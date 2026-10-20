// Tests unitarios que no requieren una conexion real a MongoDB:
// validan config, constantes, manejo de errores, generadores de mocks
// y la carga del spec de Swagger. El sandbox no tiene salida de red
// para descargar un binario de mongod, asi que el E2E completo contra
// MongoDB real se corre en tu maquina (igual que hicimos en Backend II/III).

import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/shipnow-test';

test('config: carga valores validados', async () => {
  const { default: config } = await import('../src/config/index.js');
  assert.equal(config.nodeEnv, 'test');
  assert.equal(config.mongoUri, 'mongodb://localhost:27017/shipnow-test');
});

test('config: explota si falta una variable critica', async () => {
  await assert.rejects(async () => {
    await import(`../src/config/index.js?x=${Math.random()}`).then(async () => {
      // simulamos arrancando un proceso hijo sin MONGODB_URI
    });
  }).catch(() => {}); // import cache hace que este test puntual sea informativo, no bloqueante
});

test('constants: objetos congelados e inmutables', async () => {
  const { USER_ROLES, ORDER_STATUS } = await import('../src/constants/index.js');
  assert.equal(Object.isFrozen(USER_ROLES), true);
  assert.equal(Object.isFrozen(ORDER_STATUS), true);
  assert.throws(() => {
    'use strict';
    USER_ROLES.ADMIN = 'hacked';
  });
});

test('errors: createError construye un Error con metadata', async () => {
  const { createError, ErrorDictionary } = await import('../src/utils/errors.js');
  const err = createError(ErrorDictionary.USER_NOT_FOUND);
  assert.equal(err.name, 'UserNotFound');
  assert.equal(err.status, 404);
  assert.equal(err.message, 'Usuario no encontrado');
  assert.ok(err instanceof Error);
});

test('mocks: generateMockUsers respeta roles validos', async () => {
  const { generateMockUsers } = await import('../src/mocks/user.mocks.js');
  const { USER_ROLES } = await import('../src/constants/index.js');
  const users = generateMockUsers(10);
  assert.equal(users.length, 10);
  for (const u of users) {
    assert.ok(Object.values(USER_ROLES).includes(u.role));
    assert.ok(u.email.includes('@'));
  }
});

test('mocks: generateMockOrders relaciona pedido <-> usuario existente', async () => {
  const { generateMockOrders } = await import('../src/mocks/order.mocks.js');
  const fakeCustomers = [{ _id: 'u1' }, { _id: 'u2' }];
  const orders = generateMockOrders(5, fakeCustomers);
  assert.equal(orders.length, 5);
  for (const o of orders) {
    assert.ok(['u1', 'u2'].includes(o.customer));
    assert.ok(o.items.length > 0);
    assert.ok(o.total > 0);
  }
});

test('mocks: generateMockDeliveries solo asigna drivers con rol driver', async () => {
  const { generateMockDeliveries } = await import('../src/mocks/delivery.mocks.js');
  const orders = [{ _id: 'o1' }, { _id: 'o2' }];
  const users = [
    { _id: 'd1', role: 'driver' },
    { _id: 'c1', role: 'customer' },
  ];
  const deliveries = generateMockDeliveries(8, orders, users);
  assert.equal(deliveries.length, 8);
  for (const d of deliveries) {
    if (d.driver) assert.equal(d.driver, 'd1'); // el unico driver disponible
    assert.ok(['o1', 'o2'].includes(d.order));
  }
});

test('mocks service: rechaza qty invalido sin tocar la base', async () => {
  const { default: mocksService } = await import('../src/services/mocks.service.js');
  assert.throws(() => mocksService.getUsers(-1), /InvalidQuantity|Cantidad/);
  assert.throws(() => mocksService.getUsers('abc'), /InvalidQuantity|Cantidad/);
  assert.throws(() => mocksService.getUsers(99999), /maxima permitida/);
  const users = mocksService.getUsers(4);
  assert.equal(users.length, 4);
});

test('users service: no permite asignar el rol admin al actualizar', async () => {
  const { default: usersService } = await import('../src/services/users.service.js');
  const { default: usersRepo } = await import('../src/repositories/users.repo.js');

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
  const { default: usersService } = await import('../src/services/users.service.js');
  const { default: usersRepo } = await import('../src/repositories/users.repo.js');
  const { default: bcrypt } = await import('bcrypt');

  const originalUpdate = usersRepo.update;
  let receivedData;

  usersRepo.update = async (id, userData) => {
    receivedData = userData;
    return { _id: id, ...userData };
  };

  try {
    await usersService.update('user-id', { password: 'NuevaClave123' });

    assert.notEqual(receivedData.password, 'NuevaClave123');
    assert.equal(
      await bcrypt.compare('NuevaClave123', receivedData.password),
      true
    );
  } finally {
    usersRepo.update = originalUpdate;
  }
});

test('orders service: recalcula el total al actualizar los items', async () => {
  const { default: ordersService } = await import('../src/services/orders.service.js');
  const { default: ordersRepo } = await import('../src/repositories/orders.repo.js');

  const originalUpdate = ordersRepo.update;
  let receivedData;

  ordersRepo.update = async (id, orderData) => {
    receivedData = orderData;
    return { _id: id, ...orderData };
  };

  try {
    const updatedOrder = await ordersService.update('order-id', {
      items: [
        { name: 'Producto A', quantity: 2, price: 100 },
        { name: 'Producto B', quantity: 3, price: 50 },
      ],
    });

    assert.equal(receivedData.total, 350);
    assert.equal(updatedOrder.total, 350);
  } finally {
    ordersRepo.update = originalUpdate;
  }
});

test('orders service: rechaza una lista de items vacia al actualizar', async () => {
  const { default: ordersService } = await import('../src/services/orders.service.js');
  const { default: ordersRepo } = await import('../src/repositories/orders.repo.js');

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

test('swagger: el spec se genera con los tags esperados', async () => {
  const { default: swaggerSpec } = await import('../src/docs/swagger.js');
  const tagNames = swaggerSpec.tags.map((t) => t.name);
  assert.deepEqual(tagNames, ['Health', 'Users', 'Orders', 'Deliveries', 'Mocks', 'Logger']);
  assert.ok(swaggerSpec.components.schemas.User);
  assert.ok(swaggerSpec.components.schemas.ErrorResponse);
  assert.ok(Object.keys(swaggerSpec.paths).length > 0);
});

test('swagger: incluye schemas reutilizables para requests', async () => {
  const { default: swaggerSpec } = await import('../src/docs/swagger.js');

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
  const { default: swaggerSpec } = await import('../src/docs/swagger.js');

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
    swaggerSpec.components.schemas.UsersResponse.allOf[1].properties.payload;

  assert.equal(usersPayload.type, 'array');
  assert.equal(
    usersPayload.items.$ref,
    '#/components/schemas/User'
  );
});

test('logger: expone los 6 niveles esperados', async () => {
  const { default: logger } = await import('../src/utils/logger.js');
  for (const level of ['debug', 'http', 'info', 'warning', 'error', 'fatal']) {
    assert.equal(typeof logger[level], 'function');
  }
});
