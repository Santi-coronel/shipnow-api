import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/shipnow-test';

test('config: carga valores validados', async () => {
  const { default: config } = await import('../src/config/index.js');

  assert.equal(config.nodeEnv, 'test');
  assert.equal(config.mongoUri, 'mongodb://localhost:27017/shipnow-test');
});

test('config: explota si falta una variable critica', () => {
  const configUrl = new URL('../src/config/index.js', import.meta.url).href;

  const result = spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '--eval',
      `import ${JSON.stringify(configUrl)};`,
    ],
    {
      encoding: 'utf8',
      env: {
        ...process.env,
        MONGODB_URI: '',
      },
    }
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /MONGODB_URI/);
});

test('constants: objetos congelados e inmutables', async () => {
  const { USER_ROLES, ORDER_STATUS } = await import(
    '../src/constants/index.js'
  );

  assert.equal(Object.isFrozen(USER_ROLES), true);
  assert.equal(Object.isFrozen(ORDER_STATUS), true);

  assert.throws(() => {
    USER_ROLES.ADMIN = 'hacked';
  });
});

test('errors: createError construye un Error con metadata', async () => {
  const { createError, ErrorDictionary } = await import(
    '../src/utils/errors.js'
  );

  const error = createError(ErrorDictionary.USER_NOT_FOUND);

  assert.equal(error.name, 'UserNotFound');
  assert.equal(error.status, 404);
  assert.equal(error.message, 'Usuario no encontrado');
  assert.ok(error instanceof Error);
});

test('mocks: generateMockUsers respeta roles validos', async () => {
  const { generateMockUsers } = await import(
    '../src/mocks/user.mocks.js'
  );
  const { USER_ROLES } = await import('../src/constants/index.js');

  const users = generateMockUsers(10);

  assert.equal(users.length, 10);

  for (const user of users) {
    assert.ok(Object.values(USER_ROLES).includes(user.role));
    assert.ok(user.email.includes('@'));
  }
});

test('mocks: generateMockOrders relaciona pedido con usuario existente', async () => {
  const { generateMockOrders } = await import(
    '../src/mocks/order.mocks.js'
  );

  const fakeCustomers = [
    { _id: 'u1' },
    { _id: 'u2' },
  ];

  const orders = generateMockOrders(5, fakeCustomers);

  assert.equal(orders.length, 5);

  for (const order of orders) {
    assert.ok(['u1', 'u2'].includes(order.customer));
    assert.ok(order.items.length > 0);
    assert.ok(order.total > 0);
  }
});

test('mocks: generateMockDeliveries solo asigna drivers validos', async () => {
  const { generateMockDeliveries } = await import(
    '../src/mocks/delivery.mocks.js'
  );

  const orders = [
    { _id: 'o1' },
    { _id: 'o2' },
  ];

  const users = [
    { _id: 'd1', role: 'driver' },
    { _id: 'c1', role: 'customer' },
  ];

  const deliveries = generateMockDeliveries(8, orders, users);

  assert.equal(deliveries.length, 8);

  for (const delivery of deliveries) {
    if (delivery.driver) {
      assert.equal(delivery.driver, 'd1');
    }

    assert.ok(['o1', 'o2'].includes(delivery.order));
  }
});

test('mocks service: rechaza qty invalido sin tocar la base', async () => {
  const { default: mocksService } = await import(
    '../src/services/mocks.service.js'
  );

  assert.throws(
    () => mocksService.getUsers(-1),
    /InvalidQuantity|Cantidad/
  );

  assert.throws(
    () => mocksService.getUsers('abc'),
    /InvalidQuantity|Cantidad/
  );

  assert.throws(
    () => mocksService.getUsers(99999),
    /maxima permitida/
  );

  const users = mocksService.getUsers(4);

  assert.equal(users.length, 4);
});

test('users service: no permite asignar el rol admin al actualizar', async () => {
  const { default: usersService } = await import(
    '../src/services/users.service.js'
  );
  const { default: usersRepo } = await import(
    '../src/repositories/users.repo.js'
  );

  const originalUpdate = usersRepo.update;
  usersRepo.update = async () => ({});

  try {
    await assert.rejects(
      () => usersService.update('user-id', { role: 'admin' }),
      (error) => {
        assert.equal(error.name, 'AdminCreationForbidden');
        assert.equal(error.status, 403);
        return true;
      }
    );
  } finally {
    usersRepo.update = originalUpdate;
  }
});

test('users service: cifra una contraseña actualizada', async () => {
  const { default: usersService } = await import(
    '../src/services/users.service.js'
  );
  const { default: usersRepo } = await import(
    '../src/repositories/users.repo.js'
  );
  const { default: bcrypt } = await import('bcrypt');

  const originalUpdate = usersRepo.update;
  let receivedData;

  usersRepo.update = async (id, userData) => {
    receivedData = userData;

    return {
      _id: id,
      ...userData,
    };
  };

  try {
    await usersService.update('user-id', {
      password: 'NuevaClave123',
    });

    assert.notEqual(receivedData.password, 'NuevaClave123');

    assert.equal(
      await bcrypt.compare(
        'NuevaClave123',
        receivedData.password
      ),
      true
    );
  } finally {
    usersRepo.update = originalUpdate;
  }
});

test('users service: normaliza el email antes de buscar duplicados', async () => {
  const { default: usersService } = await import(
    '../src/services/users.service.js'
  );
  const { default: usersRepo } = await import(
    '../src/repositories/users.repo.js'
  );

  const originalFindByEmail = usersRepo.findByEmail;
  const originalCreate = usersRepo.create;
  let searchedEmail;
  let createdUser;

  usersRepo.findByEmail = async (email) => {
    searchedEmail = email;
    return null;
  };
  usersRepo.create = async (userData) => {
    createdUser = userData;
    return {
      ...userData,
      toObject: () => userData,
    };
  };

  try {
    await usersService.create({
      firstName: 'Ana',
      lastName: 'Perez',
      email: '  ANA@TEST.COM  ',
      password: 'Clave1234',
      role: 'customer',
    });

    assert.equal(searchedEmail, 'ana@test.com');
    assert.equal(createdUser.email, 'ana@test.com');
  } finally {
    usersRepo.findByEmail = originalFindByEmail;
    usersRepo.create = originalCreate;
  }
});

test('error handler: oculta detalles de errores internos inesperados', async () => {
  const { errorHandler } = await import(
    '../src/middlewares/errorHandler.js'
  );
  const { default: logger } = await import('../src/utils/logger.js');

  const originalError = logger.error;
  let responseStatus;
  let responseBody;

  logger.error = () => {};

  const res = {
    status(status) {
      responseStatus = status;
      return this;
    },
    json(body) {
      responseBody = body;
      return this;
    },
  };

  try {
    errorHandler(
      new Error('mongodb://usuario:clave@servidor/shipnow'),
      { method: 'GET', originalUrl: '/api/users' },
      res,
      () => {}
    );

    assert.equal(responseStatus, 500);
    assert.deepEqual(responseBody.error, {
      name: 'InternalError',
      code: 0,
      message: 'Error interno del servidor',
    });
  } finally {
    logger.error = originalError;
  }
});

test('orders service: recalcula el total al actualizar los items', async () => {
  const { default: ordersService } = await import(
    '../src/services/orders.service.js'
  );
  const { default: ordersRepo } = await import(
    '../src/repositories/orders.repo.js'
  );

  const originalUpdate = ordersRepo.update;
  let receivedData;

  ordersRepo.update = async (id, orderData) => {
    receivedData = orderData;

    return {
      _id: id,
      ...orderData,
    };
  };

  try {
    const updatedOrder = await ordersService.update('order-id', {
      items: [
        {
          name: 'Producto A',
          quantity: 2,
          price: 100,
        },
        {
          name: 'Producto B',
          quantity: 3,
          price: 50,
        },
      ],
    });

    assert.equal(receivedData.total, 350);
    assert.equal(updatedOrder.total, 350);
  } finally {
    ordersRepo.update = originalUpdate;
  }
});

test('orders service: rechaza una lista de items vacia al actualizar', async () => {
  const { default: ordersService } = await import(
    '../src/services/orders.service.js'
  );
  const { default: ordersRepo } = await import(
    '../src/repositories/orders.repo.js'
  );

  const originalUpdate = ordersRepo.update;
  ordersRepo.update = async () => ({});

  try {
    await assert.rejects(
      () => ordersService.update('order-id', { items: [] }),
      (error) => {
        assert.equal(error.name, 'InvalidOrderItems');
        assert.equal(error.status, 400);
        return true;
      }
    );
  } finally {
    ordersRepo.update = originalUpdate;
  }
});

test('deliveries service: rechaza asignar un usuario que no es driver', async () => {
  const { default: deliveriesService } = await import(
    '../src/services/deliveries.service.js'
  );
  const { default: deliveriesRepo } = await import(
    '../src/repositories/deliveries.repo.js'
  );
  const { default: usersRepo } = await import(
    '../src/repositories/users.repo.js'
  );

  const originalFindById = usersRepo.findById;
  const originalUpdate = deliveriesRepo.update;

  usersRepo.findById = async () => ({
    _id: 'customer-id',
    role: 'customer',
  });
  deliveriesRepo.update = async () => ({ _id: 'delivery-id' });

  try {
    await assert.rejects(
      () => deliveriesService.update('delivery-id', { driver: 'customer-id' }),
      (error) => {
        assert.equal(error.name, 'DriverNotValid');
        assert.equal(error.status, 400);
        return true;
      }
    );
  } finally {
    usersRepo.findById = originalFindById;
    deliveriesRepo.update = originalUpdate;
  }
});

test('repositories: ejecutan validadores al actualizar', async () => {
  const { default: usersRepo } = await import(
    '../src/repositories/users.repo.js'
  );
  const { default: ordersRepo } = await import(
    '../src/repositories/orders.repo.js'
  );
  const { default: deliveriesRepo } = await import(
    '../src/repositories/deliveries.repo.js'
  );
  const { default: User } = await import('../src/models/user.model.js');
  const { default: Order } = await import('../src/models/order.model.js');
  const { default: Delivery } = await import('../src/models/delivery.model.js');

  const cases = [
    { repo: usersRepo, model: User },
    { repo: ordersRepo, model: Order },
    { repo: deliveriesRepo, model: Delivery },
  ];

  for (const { repo, model } of cases) {
    const originalFindByIdAndUpdate = model.findByIdAndUpdate;
    let receivedOptions;

    model.findByIdAndUpdate = (id, data, options) => {
      receivedOptions = options;
      return {
        select: () => ({ _id: id, ...data }),
      };
    };

    try {
      await repo.update('resource-id', { priority: 'high' });
      assert.equal(receivedOptions.runValidators, true);
    } finally {
      model.findByIdAndUpdate = originalFindByIdAndUpdate;
    }
  }
});

test('swagger: el spec se genera con los tags esperados', async () => {
  const { default: swaggerSpec } = await import(
    '../src/docs/swagger.js'
  );

  const tagNames = swaggerSpec.tags.map((tag) => tag.name);

  assert.deepEqual(tagNames, [
    'Health',
    'Users',
    'Orders',
    'Deliveries',
    'Mocks',
    'Logger',
  ]);

  assert.ok(swaggerSpec.components.schemas.User);
  assert.ok(swaggerSpec.components.schemas.Order);
  assert.ok(swaggerSpec.components.schemas.OrderItem);
  assert.ok(swaggerSpec.components.schemas.Delivery);
  assert.ok(swaggerSpec.components.schemas.SuccessResponse);
  assert.ok(swaggerSpec.components.schemas.ErrorResponse);
  assert.ok(Object.keys(swaggerSpec.paths).length > 0);
});

test('swagger: incluye schemas reutilizables para requests', async () => {
  const { default: swaggerSpec } = await import(
    '../src/docs/swagger.js'
  );

  const expectedSchemas = [
    'CreateUserRequest',
    'UpdateUserRequest',
    'CreateOrderRequest',
    'UpdateOrderRequest',
    'CreateDeliveryRequest',
    'UpdateDeliveryRequest',
    'MockSeedRequest',
    'MockSeedAllRequest',
    'MessageResponse',
  ];

  for (const schemaName of expectedSchemas) {
    assert.ok(
      swaggerSpec.components.schemas[schemaName],
      `Falta el schema ${schemaName}`
    );
  }
});

test('swagger: incluye respuestas tipadas para las entidades', async () => {
  const { default: swaggerSpec } = await import(
    '../src/docs/swagger.js'
  );

  const expectedSchemas = [
    'UserResponse',
    'UsersResponse',
    'OrderResponse',
    'OrdersResponse',
    'DeliveryResponse',
    'DeliveriesResponse',
  ];

  for (const schemaName of expectedSchemas) {
    assert.ok(
      swaggerSpec.components.schemas[schemaName],
      `Falta el schema ${schemaName}`
    );
  }

  const usersPayload =
    swaggerSpec.components.schemas.UsersResponse.allOf[1]
      .properties.payload;

  assert.equal(usersPayload.type, 'array');

  assert.equal(
    usersPayload.items.$ref,
    '#/components/schemas/User'
  );
});

test('swagger: los mocks usan schemas acordes a datos no persistidos', async () => {
  const { default: swaggerSpec } = await import(
    '../src/docs/swagger.js'
  );

  const expectedResponses = {
    '/mocks/users': 'MockUsersResponse',
    '/mocks/orders': 'MockOrdersResponse',
    '/mocks/deliveries': 'MockDeliveriesResponse',
  };

  for (const [path, schemaName] of Object.entries(expectedResponses)) {
    assert.ok(
      swaggerSpec.components.schemas[schemaName],
      `Falta el schema ${schemaName}`
    );

    assert.equal(
      swaggerSpec.paths[path].get.responses[200].content['application/json']
        .schema.$ref,
      `#/components/schemas/${schemaName}`
    );
  }
});

test('swagger: documenta todas las operaciones y sus respuestas', async () => {
  const { default: swaggerSpec } = await import(
    '../src/docs/swagger.js'
  );

  const httpMethods = [
    'get',
    'post',
    'put',
    'patch',
    'delete',
  ];

  const operations = [];

  for (const [path, pathItem] of Object.entries(swaggerSpec.paths)) {
    for (const method of httpMethods) {
      if (pathItem[method]) {
        operations.push({
          path,
          method,
          operation: pathItem[method],
        });
      }
    }
  }

  assert.equal(operations.length, 24);

  for (const { path, method, operation } of operations) {
    assert.ok(
      Array.isArray(operation.tags) && operation.tags.length > 0,
      `Faltan tags en ${method.toUpperCase()} ${path}`
    );

    assert.ok(
      operation.summary,
      `Falta summary en ${method.toUpperCase()} ${path}`
    );

    assert.ok(
      operation.responses,
      `Faltan responses en ${method.toUpperCase()} ${path}`
    );

    for (const [status, response] of Object.entries(
      operation.responses
    )) {
      assert.ok(
        response.description,
        `Falta descripcion para ${status} en ${method.toUpperCase()} ${path}`
      );

      if (Number(status) >= 400) {
        assert.equal(
          response.content['application/json'].schema.$ref,
          '#/components/schemas/ErrorResponse',
          `Error ${status} sin ErrorResponse en ${method.toUpperCase()} ${path}`
        );
      }
    }
  }
});

test('swagger: todos los POST y PUT documentan requestBody', async () => {
  const { default: swaggerSpec } = await import(
    '../src/docs/swagger.js'
  );

  for (const [path, pathItem] of Object.entries(swaggerSpec.paths)) {
    for (const method of ['post', 'put']) {
      const operation = pathItem[method];

      if (!operation) {
        continue;
      }

      assert.ok(
        operation.requestBody,
        `Falta requestBody en ${method.toUpperCase()} ${path}`
      );

      assert.ok(
        operation.requestBody.content['application/json'].schema,
        `Falta schema del body en ${method.toUpperCase()} ${path}`
      );
    }
  }
});

test('logger: expone los 6 niveles esperados', async () => {
  const { default: logger } = await import('../src/utils/logger.js');

  const levels = [
    'debug',
    'http',
    'info',
    'warning',
    'error',
    'fatal',
  ];

  for (const level of levels) {
    assert.equal(typeof logger[level], 'function');
  }
});
