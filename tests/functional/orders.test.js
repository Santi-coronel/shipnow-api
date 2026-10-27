import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app.js';
import { ORDER_STATUS } from '../../src/constants/index.js';
import { ErrorDictionary } from '../../src/utils/errors.js';
import { clearDatabase } from '../helpers/db.js';
import { buildOrder, createOrder, createUser, expectError } from '../helpers/factories.js';

const NON_EXISTENT_ID = '64b7f0c2a1b2c3d4e5f60718';

describe('Orders', () => {
  beforeEach(clearDatabase);
  after(clearDatabase);

  describe('GET /api/orders', () => {
    it('devuelve una lista vacia si no hay pedidos', async () => {
      const res = await request(app).get('/api/orders');

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('success');
      expect(res.body.payload).to.be.an('array').that.is.empty;
    });

    it('devuelve los pedidos creados', async () => {
      await createOrder();
      await createOrder();

      const res = await request(app).get('/api/orders');

      expect(res.status).to.equal(200);
      expect(res.body.payload).to.have.lengthOf(2);
      expect(res.body.payload[0]).to.include.keys('_id', 'customer', 'items', 'total', 'status', 'deliveryAddress');
    });
  });

  describe('POST /api/orders', () => {
    it('crea un pedido y calcula el total', async () => {
      const customer = await createUser();

      const res = await request(app).post('/api/orders').send(buildOrder(customer._id));

      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal('success');
      expect(res.body.payload.total).to.equal(250);
      expect(res.body.payload.status).to.equal(ORDER_STATUS.CREATED);
      expect(res.body.payload.items).to.have.lengthOf(2);
    });

    it('responde 400 si faltan datos obligatorios', async () => {
      const res = await request(app).post('/api/orders').send({});

      expectError(res, 400, ErrorDictionary.INVALID_ORDER_DATA);
    });

    it('responde 400 si no hay items', async () => {
      const customer = await createUser();

      const res = await request(app).post('/api/orders').send(buildOrder(customer._id, { items: [] }));

      expectError(res, 400, ErrorDictionary.INVALID_ORDER_ITEMS);
    });

    it('responde 404 si el cliente no existe', async () => {
      const res = await request(app).post('/api/orders').send(buildOrder(NON_EXISTENT_ID));

      expectError(res, 404, ErrorDictionary.USER_NOT_FOUND);
    });

    it('responde 400 si el id del cliente es invalido', async () => {
      const res = await request(app).post('/api/orders').send(buildOrder('abc'));

      expectError(res, 400, ErrorDictionary.INVALID_ID);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('devuelve el pedido', async () => {
      const order = await createOrder();

      const res = await request(app).get(`/api/orders/${order._id}`);

      expect(res.status).to.equal(200);
      expect(res.body.payload).to.include({ _id: order._id, total: 250 });
    });

    it('responde 404 si no existe', async () => {
      const res = await request(app).get(`/api/orders/${NON_EXISTENT_ID}`);

      expectError(res, 404, ErrorDictionary.ORDER_NOT_FOUND);
    });

    it('responde 400 si el id es invalido', async () => {
      const res = await request(app).get('/api/orders/abc');

      expectError(res, 400, ErrorDictionary.INVALID_ID);
    });
  });

  describe('PUT /api/orders/:id (cambios de estado)', () => {
    it('actualiza el estado', async () => {
      const order = await createOrder();

      const res = await request(app).put(`/api/orders/${order._id}`).send({ status: ORDER_STATUS.IN_TRANSIT });

      expect(res.status).to.equal(200);
      expect(res.body.payload.status).to.equal(ORDER_STATUS.IN_TRANSIT);
    });

    it('permite cancelar un pedido', async () => {
      const order = await createOrder();

      const res = await request(app).put(`/api/orders/${order._id}`).send({ status: ORDER_STATUS.CANCELLED });

      expect(res.status).to.equal(200);
      expect(res.body.payload.status).to.equal(ORDER_STATUS.CANCELLED);
    });

    it('responde 400 si el estado no existe', async () => {
      const order = await createOrder();

      const res = await request(app).put(`/api/orders/${order._id}`).send({ status: 'volando' });

      expectError(res, 400, ErrorDictionary.INVALID_ORDER_STATUS);
    });

    it('recalcula el total si cambian los items', async () => {
      const order = await createOrder();

      const res = await request(app)
        .put(`/api/orders/${order._id}`)
        .send({ items: [{ name: 'Nuevo', quantity: 3, price: 10 }] });

      expect(res.status).to.equal(200);
      expect(res.body.payload.total).to.equal(30);
    });

    it('responde 400 si los items quedan vacios', async () => {
      const order = await createOrder();

      const res = await request(app).put(`/api/orders/${order._id}`).send({ items: [] });

      expectError(res, 400, ErrorDictionary.INVALID_ORDER_ITEMS);
    });

    it('responde 404 si el pedido no existe', async () => {
      const res = await request(app).put(`/api/orders/${NON_EXISTENT_ID}`).send({ status: ORDER_STATUS.ASSIGNED });

      expectError(res, 404, ErrorDictionary.ORDER_NOT_FOUND);
    });
  });

  describe('DELETE /api/orders/:id', () => {
    it('elimina el pedido', async () => {
      const order = await createOrder();

      const res = await request(app).delete(`/api/orders/${order._id}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ status: 'success', message: 'Pedido eliminado' });
    });

    it('responde 404 si no existe', async () => {
      const res = await request(app).delete(`/api/orders/${NON_EXISTENT_ID}`);

      expectError(res, 404, ErrorDictionary.ORDER_NOT_FOUND);
    });
  });
});
