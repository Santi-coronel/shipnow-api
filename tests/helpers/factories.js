import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app.js';
import { USER_ROLES } from '../../src/constants/index.js';

let counter = 0;
const nextId = () => `${Date.now()}${++counter}`;

export const buildUser = (overrides = {}) => ({
  firstName: 'Ana',
  lastName: 'Test',
  email: `ana.${nextId()}@test.com`,
  password: 'Clave1234',
  role: USER_ROLES.CUSTOMER,
  ...overrides,
});

export const buildOrder = (customerId, overrides = {}) => ({
  customer: customerId,
  items: [
    { name: 'Producto A', quantity: 2, price: 100 },
    { name: 'Producto B', quantity: 1, price: 50 },
  ],
  deliveryAddress: 'Calle Falsa 123',
  ...overrides,
});

export const createUser = async (overrides = {}) => {
  const res = await request(app).post('/api/users').send(buildUser(overrides));
  return res.body.payload;
};

export const createOrder = async (overrides = {}) => {
  const customer = await createUser();
  const res = await request(app).post('/api/orders').send(buildOrder(customer._id, overrides));
  return res.body.payload;
};

export const createDelivery = async (overrides = {}) => {
  const order = await createOrder();
  const res = await request(app).post('/api/deliveries').send({ order: order._id, ...overrides });
  return res.body.payload;
};

export const expectError = (res, expectedStatus, dictionaryEntry, message = dictionaryEntry.message) => {
  expect(res.status).to.equal(expectedStatus);
  expect(res.body).to.have.keys('status', 'error');
  expect(res.body.status).to.equal('error');
  expect(res.body.error).to.deep.equal({
    name: dictionaryEntry.name,
    code: dictionaryEntry.code,
    message,
  });
};
