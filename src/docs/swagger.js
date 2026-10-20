import swaggerJsdoc from 'swagger-jsdoc';
import config from '../config/index.js';

// Configuracion de Swagger separada de la logica de rutas (Pre-entrega 5).
// Los endpoints documentan sus detalles via comentarios @openapi en cada
// archivo de rutas; aca se define la informacion general, los tags
// y los schemas reutilizables.

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ShipNow API',
      version: '5.0.0',
      description:
        'API de logistica para gestionar usuarios, pedidos y entregas. ' +
        'Construida con Node.js, Express y MongoDB, utilizando una arquitectura ' +
        'por capas, manejo centralizado de errores, mocking y logging con Winston.',
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api`,
        description: 'Servidor local',
      },
    ],
    tags: [
      {
        name: 'Health',
        description: 'Chequeo de disponibilidad de la API',
      },
      {
        name: 'Users',
        description: 'Gestion de usuarios, clientes, repartidores y locales',
      },
      {
        name: 'Orders',
        description: 'Gestion de pedidos',
      },
      {
        name: 'Deliveries',
        description: 'Gestion de entregas asociadas a pedidos y repartidores',
      },
      {
        name: 'Mocks',
        description: 'Generacion y carga de datos de prueba',
      },
      {
        name: 'Logger',
        description:
          'Herramienta de validacion del sistema de logs, sin logica de negocio',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          required: [
            '_id',
            'firstName',
            'lastName',
            'email',
            'role',
            'isAvailable',
          ],
          properties: {
            _id: {
              type: 'string',
              example: '6710f3a1c2a4b5d6e7f80901',
              description: 'Identificador unico del usuario',
            },
            firstName: {
              type: 'string',
              example: 'Ana',
              description: 'Nombre del usuario',
            },
            lastName: {
              type: 'string',
              example: 'Perez',
              description: 'Apellido del usuario',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'ana.perez@test.com',
              description: 'Correo electronico del usuario',
            },
            role: {
              type: 'string',
              enum: ['admin', 'customer', 'driver', 'store'],
              example: 'customer',
              description: 'Rol asignado al usuario',
            },
            isAvailable: {
              type: 'boolean',
              example: true,
              description: 'Disponibilidad del usuario',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-10-19T22:30:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-10-19T22:30:00.000Z',
            },
          },
        },

        OrderItem: {
          type: 'object',
          required: ['name', 'quantity', 'price'],
          additionalProperties: false,
          properties: {
            name: {
              type: 'string',
              example: 'Zapatillas running',
              description: 'Nombre del producto',
            },
            quantity: {
              type: 'integer',
              minimum: 1,
              example: 2,
              description: 'Cantidad solicitada',
            },
            price: {
              type: 'number',
              format: 'float',
              minimum: 0,
              example: 59.99,
              description: 'Precio unitario del producto',
            },
          },
        },

        Order: {
          type: 'object',
          required: [
            '_id',
            'customer',
            'items',
            'deliveryAddress',
            'total',
            'status',
            'priority',
          ],
          properties: {
            _id: {
              type: 'string',
              example: '6710f3a1c2a4b5d6e7f80902',
              description: 'Identificador unico del pedido',
            },
            customer: {
              oneOf: [
                {
                  type: 'string',
                  example: '6710f3a1c2a4b5d6e7f80901',
                },
                {
                  $ref: '#/components/schemas/User',
                },
              ],
              description: 'Usuario que realizo el pedido',
            },
            items: {
              type: 'array',
              minItems: 1,
              items: {
                $ref: '#/components/schemas/OrderItem',
              },
            },
            deliveryAddress: {
              type: 'string',
              example: 'Av. Siempre Viva 742',
              description: 'Direccion de entrega',
            },
            total: {
              type: 'number',
              format: 'float',
              minimum: 0,
              example: 119.98,
              description: 'Total calculado del pedido',
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
              example: 'created',
              description: 'Estado actual del pedido',
            },
            priority: {
              type: 'string',
              enum: ['low', 'normal', 'high'],
              example: 'normal',
              description: 'Prioridad del pedido',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-10-19T22:30:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-10-19T22:30:00.000Z',
            },
          },
        },

        Delivery: {
          type: 'object',
          required: ['_id', 'order', 'status', 'priority'],
          properties: {
            _id: {
              type: 'string',
              example: '6710f3a1c2a4b5d6e7f80903',
              description: 'Identificador unico de la entrega',
            },
            order: {
              oneOf: [
                {
                  type: 'string',
                  example: '6710f3a1c2a4b5d6e7f80902',
                },
                {
                  $ref: '#/components/schemas/Order',
                },
              ],
              description: 'Pedido asociado a la entrega',
            },
            driver: {
              oneOf: [
                {
                  type: 'string',
                  example: '6710f3a1c2a4b5d6e7f80904',
                },
                {
                  $ref: '#/components/schemas/User',
                },
              ],
              nullable: true,
              description: 'Repartidor asignado',
            },
            status: {
              type: 'string',
              enum: ['pending', 'assigned', 'in_transit', 'delivered'],
              example: 'pending',
              description: 'Estado actual de la entrega',
            },
            priority: {
              type: 'string',
              enum: ['low', 'normal', 'high'],
              example: 'normal',
              description: 'Prioridad de la entrega',
            },
            assignedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              example: '2026-10-19T22:30:00.000Z',
            },
            deliveredAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              example: null,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-10-19T22:30:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-10-19T22:30:00.000Z',
            },
          },
        },

        CreateUserRequest: {
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
              example: 'Perez',
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
          minProperties: 1,
          additionalProperties: false,
          properties: {
            firstName: {
              type: 'string',
              example: 'Ana',
            },
            lastName: {
              type: 'string',
              example: 'Perez',
            },
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
              items: {
                $ref: '#/components/schemas/OrderItem',
              },
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
          minProperties: 1,
          additionalProperties: false,
          properties: {
            items: {
              type: 'array',
              minItems: 1,
              items: {
                $ref: '#/components/schemas/OrderItem',
              },
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
          minProperties: 1,
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

        MockUser: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password', 'role', 'isAvailable'],
          properties: {
            firstName: { type: 'string', example: 'Ana' },
            lastName: { type: 'string', example: 'Perez' },
            email: {
              type: 'string',
              format: 'email',
              example: 'ana.perez@test.com',
            },
            password: {
              type: 'string',
              example: 'Mock1234!',
              description: 'Clave de prueba; solo se cifra al insertar el usuario',
            },
            role: {
              type: 'string',
              enum: ['customer', 'driver', 'store'],
            },
            isAvailable: { type: 'boolean', example: true },
          },
        },

        MockOrder: {
          type: 'object',
          required: ['customer', 'items', 'deliveryAddress', 'total', 'status', 'priority'],
          properties: {
            customer: {
              type: 'string',
              example: '6710f3a1c2a4b5d6e7f80901',
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
            total: { type: 'number', format: 'float', minimum: 0 },
            status: {
              type: 'string',
              enum: ['created', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'],
            },
            priority: {
              type: 'string',
              enum: ['low', 'normal', 'high'],
            },
          },
        },

        MockDelivery: {
          type: 'object',
          required: ['order', 'status', 'priority'],
          properties: {
            order: {
              type: 'string',
              example: '6710f3a1c2a4b5d6e7f80902',
            },
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
            assignedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            deliveredAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
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

        SuccessResponse: {
          type: 'object',
          required: ['status', 'payload'],
          properties: {
            status: {
              type: 'string',
              enum: ['success'],
              example: 'success',
            },
            payload: {
              description: 'Datos devueltos por la operacion',
            },
          },
        },

        ErrorResponse: {
          type: 'object',
          required: ['status', 'error'],
          properties: {
            status: {
              type: 'string',
              enum: ['error'],
              example: 'error',
            },
            error: {
              type: 'object',
              required: ['name', 'code', 'message'],
              properties: {
                name: {
                  type: 'string',
                  example: 'UserNotFound',
                },
                code: {
                  type: 'integer',
                  example: 4,
                },
                message: {
                  type: 'string',
                  example: 'Usuario no encontrado',
                },
              },
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

        UserResponse: {
          allOf: [
            {
              $ref: '#/components/schemas/SuccessResponse',
            },
            {
              type: 'object',
              properties: {
                payload: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          ],
        },

        UsersResponse: {
          allOf: [
            {
              $ref: '#/components/schemas/SuccessResponse',
            },
            {
              type: 'object',
              properties: {
                payload: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/User',
                  },
                },
              },
            },
          ],
        },

        OrderResponse: {
          allOf: [
            {
              $ref: '#/components/schemas/SuccessResponse',
            },
            {
              type: 'object',
              properties: {
                payload: {
                  $ref: '#/components/schemas/Order',
                },
              },
            },
          ],
        },

        OrdersResponse: {
          allOf: [
            {
              $ref: '#/components/schemas/SuccessResponse',
            },
            {
              type: 'object',
              properties: {
                payload: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Order',
                  },
                },
              },
            },
          ],
        },

        DeliveryResponse: {
          allOf: [
            {
              $ref: '#/components/schemas/SuccessResponse',
            },
            {
              type: 'object',
              properties: {
                payload: {
                  $ref: '#/components/schemas/Delivery',
                },
              },
            },
          ],
        },

        DeliveriesResponse: {
          allOf: [
            {
              $ref: '#/components/schemas/SuccessResponse',
            },
            {
              type: 'object',
              properties: {
                payload: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Delivery',
                  },
                },
              },
            },
          ],
        },

        MockUsersResponse: {
          allOf: [
            { $ref: '#/components/schemas/SuccessResponse' },
            {
              type: 'object',
              properties: {
                payload: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/MockUser' },
                },
              },
            },
          ],
        },

        MockOrdersResponse: {
          allOf: [
            { $ref: '#/components/schemas/SuccessResponse' },
            {
              type: 'object',
              properties: {
                payload: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/MockOrder' },
                },
              },
            },
          ],
        },

        MockDeliveriesResponse: {
          allOf: [
            { $ref: '#/components/schemas/SuccessResponse' },
            {
              type: 'object',
              properties: {
                payload: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/MockDelivery' },
                },
              },
            },
          ],
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

export default swaggerJsdoc(options);
