import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app.js';
import { DELIVERY_STATUS, ORDER_STATUS, USER_ROLES } from '../../src/constants/index.js';
import { ErrorDictionary } from '../../src/utils/errors.js';
import { clearDatabase } from '../helpers/db.js';
import { buildOrder, createDelivery, createOrder, createUser, expectError } from '../helpers/factories.js';

const createProducts = async (count) => {
  for (let i = 1; i <= count; i += 1) {
    await request(app).post('/api/products').send({ name: `Producto ${i}`, price: 10, stock: 5 });
  }
};

describe('Paginacion y filtros', () => {
  beforeEach(clearDatabase);
  after(clearDatabase);

  describe('estructura de la respuesta', () => {
    it('devuelve payload y pagination con los valores por defecto', async () => {
      await createUser();

      const res = await request(app).get('/api/users');

      expect(res.status).to.equal(200);
      expect(res.body.payload).to.have.lengthOf(1);
      expect(res.body.pagination).to.deep.equal({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });
    });

    it('con una lista vacia devuelve totalPages 1', async () => {
      const res = await request(app).get('/api/orders');

      expect(res.body.payload).to.be.empty;
      expect(res.body.pagination).to.include({ total: 0, totalPages: 1 });
    });
  });

  describe('page y limit', () => {
    it('respeta limit y page', async () => {
      await createProducts(5);

      const first = await request(app).get('/api/products?limit=2&page=1');
      const last = await request(app).get('/api/products?limit=2&page=3');

      expect(first.body.payload).to.have.lengthOf(2);
      expect(first.body.pagination).to.include({ page: 1, limit: 2, total: 5, totalPages: 3, hasNextPage: true, hasPrevPage: false });
      expect(last.body.payload).to.have.lengthOf(1);
      expect(last.body.pagination).to.include({ page: 3, hasNextPage: false, hasPrevPage: true });
    });

    it('las paginas no repiten resultados', async () => {
      await createProducts(4);

      const p1 = await request(app).get('/api/products?limit=2&page=1');
      const p2 = await request(app).get('/api/products?limit=2&page=2');
      const ids = [...p1.body.payload, ...p2.body.payload].map((p) => p._id);

      expect(new Set(ids).size).to.equal(4);
    });

    it('una pagina fuera de rango devuelve la lista vacia', async () => {
      await createProducts(2);

      const res = await request(app).get('/api/products?page=9');

      expect(res.status).to.equal(200);
      expect(res.body.payload).to.be.empty;
      expect(res.body.pagination.total).to.equal(2);
    });

    ['page=0', 'page=-1', 'page=abc', 'limit=0', 'limit=101', 'limit=1.5', 'limit=10&limit=20'].forEach((query) => {
      it(`responde 400 con ?${query}`, async () => {
        const res = await request(app).get(`/api/users?${query}`);

        expectError(res, 400, ErrorDictionary.INVALID_PAGINATION);
      });
    });

    ['users', 'orders', 'deliveries', 'products'].forEach((resource) => {
      it(`/api/${resource} valida la paginacion`, async () => {
        const res = await request(app).get(`/api/${resource}?limit=500`);

        expectError(res, 400, ErrorDictionary.INVALID_PAGINATION);
      });
    });
  });

  describe('filtros', () => {
    it('users: filtra por role', async () => {
      await createUser({ role: USER_ROLES.DRIVER });
      await createUser({ role: USER_ROLES.CUSTOMER });

      const res = await request(app).get(`/api/users?role=${USER_ROLES.DRIVER}`);

      expect(res.body.payload).to.have.lengthOf(1);
      expect(res.body.payload[0].role).to.equal(USER_ROLES.DRIVER);
      expect(res.body.pagination.total).to.equal(1);
    });

    it('users: filtra por isAvailable', async () => {
      const user = await createUser();
      await createUser();
      await request(app).put(`/api/users/${user._id}`).send({ isAvailable: false });

      const res = await request(app).get('/api/users?isAvailable=false');

      expect(res.body.payload).to.have.lengthOf(1);
      expect(res.body.payload[0]._id).to.equal(user._id);
    });

    it('users: role invalido responde 400', async () => {
      const res = await request(app).get('/api/users?role=superhero');

      expectError(res, 400, ErrorDictionary.INVALID_ROLE);
    });

    it('users: isAvailable invalido responde 400', async () => {
      const res = await request(app).get('/api/users?isAvailable=quizas');

      expectError(res, 400, ErrorDictionary.INVALID_FILTER);
    });

    it('orders: filtra por status y por customer', async () => {
      const order = await createOrder();
      await createOrder();
      await request(app).put(`/api/orders/${order._id}`).send({ status: ORDER_STATUS.CANCELLED });

      const byStatus = await request(app).get(`/api/orders?status=${ORDER_STATUS.CANCELLED}`);
      const byCustomer = await request(app).get(`/api/orders?customer=${order.customer._id ?? order.customer}`);

      expect(byStatus.body.payload).to.have.lengthOf(1);
      expect(byStatus.body.payload[0]._id).to.equal(order._id);
      expect(byCustomer.body.payload).to.have.lengthOf(1);
    });

    it('orders: status invalido responde 400', async () => {
      const res = await request(app).get('/api/orders?status=volando');

      expectError(res, 400, ErrorDictionary.INVALID_ORDER_STATUS);
    });

    it('orders: un id de cliente invalido responde 400', async () => {
      const res = await request(app).get('/api/orders?customer=abc');

      expectError(res, 400, ErrorDictionary.INVALID_ID);
    });

    it('orders: no acepta operadores de Mongo en los filtros', async () => {
      await createOrder();

      const status = await request(app).get('/api/orders?status[$ne]=created');
      const customer = await request(app).get('/api/orders?customer[$ne]=x');

      expectError(status, 400, ErrorDictionary.INVALID_ORDER_STATUS);
      expectError(customer, 400, ErrorDictionary.INVALID_ID);
    });

    it('deliveries: filtra por status', async () => {
      const delivery = await createDelivery();
      await createDelivery();
      await request(app).put(`/api/deliveries/${delivery._id}`).send({ status: DELIVERY_STATUS.IN_TRANSIT });

      const res = await request(app).get(`/api/deliveries?status=${DELIVERY_STATUS.IN_TRANSIT}`);

      expect(res.body.payload).to.have.lengthOf(1);
      expect(res.body.payload[0]._id).to.equal(delivery._id);
    });

    it('deliveries: status invalido responde 400', async () => {
      const res = await request(app).get('/api/deliveries?status=perdida');

      expectError(res, 400, ErrorDictionary.INVALID_DELIVERY_STATUS);
    });

    it('deliveries: filtra por driver', async () => {
      const driver = await createUser({ role: USER_ROLES.DRIVER });
      const order = await createOrder();
      await request(app).post('/api/deliveries').send({ order: order._id, driver: driver._id });
      await createDelivery();

      const res = await request(app).get(`/api/deliveries?driver=${driver._id}`);

      expect(res.body.payload).to.have.lengthOf(1);
      expect(res.body.pagination.total).to.equal(1);
    });

    it('products: sigue ocultando los agotados y pagina', async () => {
      await createProducts(3);
      await request(app).post('/api/products').send({ name: 'Agotado', price: 10, stock: 0 });

      const res = await request(app).get('/api/products?limit=2');

      expect(res.body.pagination.total).to.equal(3);
      expect(res.body.payload).to.have.lengthOf(2);
    });
  });

  it('los pedidos listados incluyen al cliente sin datos sensibles', async () => {
    const customer = await createUser();
    await request(app).post('/api/orders').send(buildOrder(customer._id));

    const res = await request(app).get('/api/orders');

    expect(res.body.payload[0].customer).to.include.keys('firstName', 'lastName', 'email');
    expect(res.body.payload[0].customer).to.not.have.property('password');
  });
});
