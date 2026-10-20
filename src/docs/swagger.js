import swaggerJsdoc from 'swagger-jsdoc';
import config from '../config/index.js';

// Configuracion de Swagger separada de la logica de rutas (Pre-entrega 5).
// Los endpoints documentan sus detalles via comentarios @openapi en cada
// archivo de rutas/controllers; aca solo se define la info general,
// los tags y los schemas reutilizables.

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ShipNow API',
      version: '5.0.0',
      description:
        'API de logistica (usuarios, pedidos y entregas) construida con Node.js, Express y MongoDB. ' +
        'Arquitectura por capas (Router -> Controller -> Service -> Repository -> Model), con mocking, ' +
        'manejo centralizado de errores y logging con Winston.',
    },
    servers: [{ url: `http://localhost:${config.port}/api`, description: 'Servidor local' }],
    tags: [
      { name: 'Health', description: 'Chequeo de disponibilidad de la API' },
      { name: 'Users', description: 'Gestion de usuarios (clientes, repartidores, locales)' },
      { name: 'Orders', description: 'Gestion de pedidos' },
      { name: 'Deliveries', description: 'Gestion de entregas asociadas a pedidos y repartidores' },
      { name: 'Mocks', description: 'Generacion y carga de datos de prueba' },
      { name: 'Logger', description: 'Endpoint de validacion del sistema de logs (no es logica de negocio)' },
    ],
    components: {
      schemas: { CreateUserRequest: {
  type: 'object',
  required: ['firstName', 'lastName', 'email', 'password'],
  additionalProperties: false,
  properties: {
    firstName: {
      type: 'string',
      example: 'Ana',
      description: 'Nombre del usuario',
    },
    lastName: {
      type: 'string',
      example: 'Pérez',
      description: 'Apellido del usuario',
    },
    email: {
      type: 'string',
      format: 'email',
      example: 'ana.perez@test.com',
    },
    password: {
      type: 'string',
      minLength: 8,
      example: 'ClaveSegura123',
    },
    role: {
      type: 'string',
      enum: ['customer', 'driver', 'store'],
      default: 'customer',
    },
  },
},

UpdateUserRequest: {
  type: 'object',
  additionalProperties: false,
  properties: {
    firstName: { type: 'string', example: 'Ana' },
    lastName: { type: 'string', example: 'Pérez' },
    email: {
      type: 'string',
      format: 'email',
      example: 'ana.actualizada@test.com',
    },
    password: {
      type: 'string',
      minLength: 8,
      example: 'NuevaClave123',
    },
    role: {
      type: 'string',
      enum: ['customer', 'driver', 'store'],
    },
    isAvailable: {
      type: 'boolean',
      example: true,
    },
  },
},

CreateOrderRequest: {
  type: 'object',
  required: ['customer', 'items', 'deliveryAddress'],
  additionalProperties: false,
  properties: {
    customer: {
      type: 'string',
      example: '6710f3a1c2a4b5d6e7f80901',
      description: 'ID del usuario que realiza el pedido',
    },
    items: {
      type: 'array',
      minItems: 1,
      items: { $ref: '#/components/schemas/OrderItem' },
    },
    deliveryAddress: {
      type: 'string',
      example: 'Av. Siempre Viva 742',
    },
    priority: {
      type: 'string',
      enum: ['low', 'normal', 'high'],
      default: 'normal',
    },
  },
},

UpdateOrderRequest: {
  type: 'object',
  additionalProperties: false,
  properties: {
    items: {
      type: 'array',
      minItems: 1,
      items: { $ref: '#/components/schemas/OrderItem' },
    },
    deliveryAddress: {
      type: 'string',
      example: 'Av. Siempre Viva 742',
    },
    status: {
      type: 'string',
      enum: [
        'created',
        'assigned',
        'picked_up',
        'in_transit',
        'delivered',
        'cancelled',
      ],
    },
    priority: {
      type: 'string',
      enum: ['low', 'normal', 'high'],
    },
  },
},

CreateDeliveryRequest: {
  type: 'object',
  required: ['order'],
  additionalProperties: false,
  properties: {
    order: {
      type: 'string',
      example: '6710f3a1c2a4b5d6e7f80902',
      description: 'ID del pedido',
    },
    driver: {
      type: 'string',
      nullable: true,
      example: '6710f3a1c2a4b5d6e7f80904',
      description: 'ID del repartidor',
    },
    priority: {
      type: 'string',
      enum: ['low', 'normal', 'high'],
      default: 'normal',
    },
  },
},

UpdateDeliveryRequest: {
  type: 'object',
  additionalProperties: false,
  properties: {
    driver: {
      type: 'string',
      nullable: true,
      example: '6710f3a1c2a4b5d6e7f80904',
    },
    status: {
      type: 'string',
      enum: ['pending', 'assigned', 'in_transit', 'delivered'],
    },
    priority: {
      type: 'string',
      enum: ['low', 'normal', 'high'],
    },
  },
},

MockSeedRequest: {
  type: 'object',
  additionalProperties: false,
  properties: {
    qty: {
      type: 'integer',
      minimum: 1,
      maximum: 100,
      default: 5,
      example: 10,
    },
  },
},

MockSeedAllRequest: {
  type: 'object',
  additionalProperties: false,
  properties: {
    usersQty: {
      type: 'integer',
      minimum: 1,
      maximum: 100,
      default: 5,
      example: 10,
    },
    ordersQty: {
      type: 'integer',
      minimum: 1,
      maximum: 100,
      default: 5,
      example: 8,
    },
    deliveriesQty: {
      type: 'integer',
      minimum: 1,
      maximum: 100,
      default: 5,
      example: 5,
    },
  },
},

MessageResponse: {
  type: 'object',
  required: ['status', 'message'],
  properties: {
    status: {
      type: 'string',
      enum: ['success'],
      example: 'success',
    },
    message: {
      type: 'string',
      example: 'Recurso eliminado correctamente',
    },
  },
},
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '6710f3a1c2a4b5d6e7f80901' },
            firstName: { type: 'string', example: 'Ana' },
            lastName: { type: 'string', example: 'Perez' },
            email: { type: 'string', example: 'ana.perez@test.com' },
            role: { type: 'string', enum: ['admin', 'customer', 'driver', 'store'], example: 'customer' },
            isAvailable: { type: 'boolean', example: true },
          },
        },
        OrderItem: {
          type: 'object',
          required: ['name', 'quantity', 'price'],
          properties: {
            name: { type: 'string', example: 'Zapatillas running' },
            quantity: { type: 'integer', example: 2 },
            price: { type: 'number', example: 59.99 },
          },
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '6710f3a1c2a4b5d6e7f80902' },
            customer: { type: 'string', example: '6710f3a1c2a4b5d6e7f80901' },
            items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
            deliveryAddress: { type: 'string', example: 'Av. Siempre Viva 742' },
            total: { type: 'number', example: 119.98 },
            status: {
              type: 'string',
              enum: ['created', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'],
              example: 'created',
            },
            priority: { type: 'string', enum: ['low', 'normal', 'high'], example: 'normal' },
          },
        },
        Delivery: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '6710f3a1c2a4b5d6e7f80903' },
            order: { type: 'string', example: '6710f3a1c2a4b5d6e7f80902' },
            driver: { type: 'string', nullable: true, example: '6710f3a1c2a4b5d6e7f80904' },
            status: { type: 'string', enum: ['pending', 'assigned', 'in_transit', 'delivered'], example: 'pending' },
            priority: { type: 'string', enum: ['low', 'normal', 'high'], example: 'normal' },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            payload: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            error: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'UserNotFound' },
                code: { type: 'integer', example: 4 },
                message: { type: 'string', example: 'Usuario no encontrado' },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

export default swaggerJsdoc(options);
