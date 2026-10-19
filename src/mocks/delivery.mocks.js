import { faker } from '@faker-js/faker';
import { DELIVERY_STATUS, DELIVERY_PRIORITY, USER_ROLES } from '../constants/index.js';

// Recibe pedidos y usuarios ya existentes para respetar las relaciones:
// entrega <-> pedido, y repartidor con rol DRIVER coherente.
export const generateMockDelivery = (orders, drivers) => {
  const order = faker.helpers.arrayElement(orders);
  const driver = drivers.length > 0 && faker.datatype.boolean() ? faker.helpers.arrayElement(drivers) : null;
  const status = driver ? faker.helpers.arrayElement(Object.values(DELIVERY_STATUS)) : DELIVERY_STATUS.PENDING;

  return {
    order: order._id,
    driver: driver ? driver._id : null,
    status,
    priority: faker.helpers.arrayElement(Object.values(DELIVERY_PRIORITY)),
    assignedAt: driver ? faker.date.recent() : null,
    deliveredAt: status === DELIVERY_STATUS.DELIVERED ? faker.date.recent() : null,
  };
};

export const generateMockDeliveries = (qty, orders, allUsers) => {
  const drivers = allUsers.filter((u) => u.role === USER_ROLES.DRIVER);
  return Array.from({ length: qty }, () => generateMockDelivery(orders, drivers));
};
