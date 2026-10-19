import { faker } from '@faker-js/faker';
import { ORDER_STATUS, DELIVERY_PRIORITY } from '../constants/index.js';

const generateMockItems = () => {
  const itemCount = faker.number.int({ min: 1, max: 4 });
  return Array.from({ length: itemCount }, () => ({
    name: faker.commerce.productName(),
    quantity: faker.number.int({ min: 1, max: 5 }),
    price: Number(faker.commerce.price({ min: 5, max: 200 })),
  }));
};

// Recibe una lista de customers ya existentes/insertados para que cada
// pedido quede relacionado a un usuario real (pedido <-> usuario).
export const generateMockOrder = (customers) => {
  const customer = faker.helpers.arrayElement(customers);
  const items = generateMockItems();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    customer: customer._id,
    items,
    deliveryAddress: faker.location.streetAddress(),
    total,
    status: faker.helpers.arrayElement(Object.values(ORDER_STATUS)),
    priority: faker.helpers.arrayElement(Object.values(DELIVERY_PRIORITY)),
  };
};

export const generateMockOrders = (qty, customers) => Array.from({ length: qty }, () => generateMockOrder(customers));
