import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app.js';
import { DELIVERY_STATUS, USER_ROLES } from '../../src/constants/index.js';
import { ErrorDictionary } from '../../src/utils/errors.js';
import { clearDatabase } from '../helpers/db.js';
import { createDelivery, createOrder, createUser, expectError } from '../helpers/factories.js';

const NON_EXISTENT_ID = '64b7f0c2a1b2c3d4e5f60718';

describe('Deliveries', () => {
  beforeEach(clearDatabase);
  after(clearDatabase);

  describe('GET /api/deliveries', () => {
    it('devuelve una lista vacia', async () => {
      const res = await request(app).get('/api/deliveries');

      expect(res.status).to.equal(200);
      expect(res.body.payload).to.be.an('array').that.is.empty;
    });

    it('devuelve las entregas creadas', async () => {
      await createDelivery();

      const res = await request(app).get('/api/deliveries');

      expect(res.status).to.equal(200);
      expect(res.body.payload).to.have.lengthOf(1);
    });
  });

  describe('POST /api/deliveries', () => {
    it('crea una entrega pendiente sin repartidor', async () => {
      const order = await createOrder();

      const res = await request(app).post('/api/deliveries').send({ order: order._id });

      expect(res.status).to.equal(201);
      expect(res.body.payload.status).to.equal(DELIVERY_STATUS.PENDING);
      expect(res.body.payload.order).to.equal(order._id);
    });

    it('crea una entrega asignada si se envia un repartidor valido', async () => {
      const order = await createOrder();
      const driver = await createUser({ role: USER_ROLES.DRIVER });

      const res = await request(app).post('/api/deliveries').send({ order: order._id, driver: driver._id });

      expect(res.status).to.equal(201);
      expect(res.body.payload.status).to.equal(DELIVERY_STATUS.ASSIGNED);
      expect(res.body.payload.driver).to.equal(driver._id);
    });

    it('responde 404 si el pedido no existe', async () => {
      const res = await request(app).post('/api/deliveries').send({ order: NON_EXISTENT_ID });

      expectError(res, 404, ErrorDictionary.ORDER_NOT_FOUND);
    });

    it('responde 400 si el usuario no es repartidor', async () => {
      const order = await createOrder();
      const customer = await createUser();

      const res = await request(app).post('/api/deliveries').send({ order: order._id, driver: customer._id });

      expectError(res, 400, ErrorDictionary.DRIVER_NOT_VALID);
    });
  });

  describe('GET /api/deliveries/:id', () => {
    it('devuelve la entrega', async () => {
      const delivery = await createDelivery();

      const res = await request(app).get(`/api/deliveries/${delivery._id}`);

      expect(res.status).to.equal(200);
      expect(res.body.payload._id).to.equal(delivery._id);
    });

    it('responde 404 si no existe', async () => {
      const res = await request(app).get(`/api/deliveries/${NON_EXISTENT_ID}`);

      expectError(res, 404, ErrorDictionary.DELIVERY_NOT_FOUND);
    });
  });

  describe('PUT /api/deliveries/:id', () => {
    it('marca la entrega como entregada y guarda deliveredAt', async () => {
      const delivery = await createDelivery();

      const res = await request(app).put(`/api/deliveries/${delivery._id}`).send({ status: DELIVERY_STATUS.DELIVERED });

      expect(res.status).to.equal(200);
      expect(res.body.payload.status).to.equal(DELIVERY_STATUS.DELIVERED);
      expect(res.body.payload.deliveredAt).to.be.a('string');
    });

    it('responde 400 si el estado no existe', async () => {
      const delivery = await createDelivery();

      const res = await request(app).put(`/api/deliveries/${delivery._id}`).send({ status: 'perdida' });

      expectError(res, 400, ErrorDictionary.INVALID_DELIVERY_STATUS);
    });

    it('responde 404 si no existe', async () => {
      const res = await request(app).put(`/api/deliveries/${NON_EXISTENT_ID}`).send({ status: DELIVERY_STATUS.IN_TRANSIT });

      expectError(res, 404, ErrorDictionary.DELIVERY_NOT_FOUND);
    });
  });

  describe('DELETE /api/deliveries/:id', () => {
    it('elimina la entrega', async () => {
      const delivery = await createDelivery();

      const res = await request(app).delete(`/api/deliveries/${delivery._id}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ status: 'success', message: 'Entrega eliminada' });
    });

    it('responde 404 si no existe', async () => {
      const res = await request(app).delete(`/api/deliveries/${NON_EXISTENT_ID}`);

      expectError(res, 404, ErrorDictionary.DELIVERY_NOT_FOUND);
    });
  });
});
