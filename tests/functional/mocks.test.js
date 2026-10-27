import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app.js';
import { MOCKING_PARAMETERS } from '../../src/constants/index.js';
import { ErrorDictionary } from '../../src/utils/errors.js';
import { clearDatabase } from '../helpers/db.js';
import { createDelivery, createOrder, createUser, expectError } from '../helpers/factories.js';

describe('Mocks', () => {
  beforeEach(clearDatabase);
  after(clearDatabase);

  describe('GET /api/mocks/users', () => {
    it('genera la cantidad por defecto sin guardar nada', async () => {
      const res = await request(app).get('/api/mocks/users');
      const saved = await request(app).get('/api/users');

      expect(res.status).to.equal(200);
      expect(res.body.payload).to.have.lengthOf(MOCKING_PARAMETERS.DEFAULT_QTY);
      expect(res.body.payload[0]).to.include.keys('firstName', 'lastName', 'email', 'role');
      expect(saved.body.payload).to.be.empty;
    });

    it('respeta el parametro qty', async () => {
      const res = await request(app).get('/api/mocks/users?qty=3');

      expect(res.status).to.equal(200);
      expect(res.body.payload).to.have.lengthOf(3);
    });

    [['0'], ['-2'], ['abc'], ['1.5']].forEach(([qty]) => {
      it(`responde 400 si qty es "${qty}"`, async () => {
        const res = await request(app).get(`/api/mocks/users?qty=${qty}`);

        expectError(res, 400, ErrorDictionary.INVALID_QUANTITY);
      });
    });

    it('responde 400 si qty supera el maximo', async () => {
      const res = await request(app).get('/api/mocks/users?qty=101');

      expectError(res, 400, ErrorDictionary.INVALID_QUANTITY, 'La cantidad maxima permitida es 100');
    });
  });

  describe('GET /api/mocks/orders', () => {
    it('responde 400 si no hay usuarios', async () => {
      const res = await request(app).get('/api/mocks/orders');

      expect(res.status).to.equal(400);
      expect(res.body.error).to.include({
        name: ErrorDictionary.MOCK_DEPENDENCY_MISSING.name,
        code: ErrorDictionary.MOCK_DEPENDENCY_MISSING.code,
      });
    });

    it('genera pedidos usando los usuarios existentes', async () => {
      await createUser();

      const res = await request(app).get('/api/mocks/orders?qty=2');

      expect(res.status).to.equal(200);
      expect(res.body.payload).to.have.lengthOf(2);
    });
  });

  describe('GET /api/mocks/deliveries', () => {
    it('responde 400 si no hay pedidos', async () => {
      const res = await request(app).get('/api/mocks/deliveries');

      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal(ErrorDictionary.MOCK_DEPENDENCY_MISSING.code);
    });

    it('genera entregas usando los pedidos existentes', async () => {
      await createOrder();

      const res = await request(app).get('/api/mocks/deliveries?qty=2');

      expect(res.status).to.equal(200);
      expect(res.body.payload).to.have.lengthOf(2);
    });
  });

  describe('POST /api/mocks/users/seed', () => {
    it('inserta usuarios en la base', async () => {
      const res = await request(app).post('/api/mocks/users/seed').send({ qty: 4 });
      const saved = await request(app).get('/api/users');

      expect(res.status).to.equal(200);
      expect(res.body.payload.insertados).to.equal(4);
      expect(saved.body.payload).to.have.lengthOf(4);
    });

    it('responde 400 si qty es invalido', async () => {
      const res = await request(app).post('/api/mocks/users/seed').send({ qty: 0 });

      expectError(res, 400, ErrorDictionary.INVALID_QUANTITY);
    });
  });

  describe('POST /api/mocks/orders/seed', () => {
    it('inserta pedidos', async () => {
      await createUser();

      const res = await request(app).post('/api/mocks/orders/seed').send({ qty: 3 });

      expect(res.status).to.equal(200);
      expect(res.body.payload.insertados).to.equal(3);
    });

    it('responde 400 si no hay usuarios', async () => {
      const res = await request(app).post('/api/mocks/orders/seed').send({ qty: 3 });

      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal(ErrorDictionary.MOCK_DEPENDENCY_MISSING.code);
    });
  });

  describe('POST /api/mocks/deliveries/seed', () => {
    it('inserta entregas', async () => {
      await createDelivery();

      const res = await request(app).post('/api/mocks/deliveries/seed').send({ qty: 2 });

      expect(res.status).to.equal(200);
      expect(res.body.payload.insertados).to.equal(2);
    });
  });

  describe('POST /api/mocks/seed/all', () => {
    it('siembra usuarios, pedidos y entregas en cascada', async () => {
      const res = await request(app)
        .post('/api/mocks/seed/all')
        .send({ usersQty: 3, ordersQty: 2, deliveriesQty: 2 });

      expect(res.status).to.equal(200);
      expect(res.body.payload).to.deep.equal({ usuarios: 3, pedidos: 2, entregas: 2 });
    });

    it('responde 400 si una cantidad es invalida', async () => {
      const res = await request(app).post('/api/mocks/seed/all').send({ usersQty: -1 });

      expectError(res, 400, ErrorDictionary.INVALID_QUANTITY);
    });
  });
});
