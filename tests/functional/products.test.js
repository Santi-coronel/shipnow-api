import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app.js';
import { PRODUCT_STATUS } from '../../src/constants/index.js';
import { ErrorDictionary } from '../../src/utils/errors.js';
import { clearDatabase } from '../helpers/db.js';
import { expectError } from '../helpers/factories.js';

const NON_EXISTENT_ID = '64b7f0c2a1b2c3d4e5f60718';
const validProduct = (overrides = {}) => ({ name: 'Caja chica', description: 'Caja de carton', price: 1500, stock: 10, ...overrides });
const createProduct = async (overrides) => (await request(app).post('/api/products').send(validProduct(overrides))).body.payload;

describe('Products', () => {
  beforeEach(clearDatabase);
  after(clearDatabase);

  describe('POST /api/products', () => {
    it('crea un producto disponible si tiene stock', async () => {
      const res = await request(app).post('/api/products').send(validProduct());

      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal('success');
      expect(res.body.payload).to.include({ name: 'Caja chica', price: 1500, stock: 10, status: PRODUCT_STATUS.AVAILABLE });
      expect(res.body.payload._id).to.be.a('string');
    });

    it('queda out_of_stock si el stock es 0', async () => {
      const res = await request(app).post('/api/products').send(validProduct({ stock: 0 }));

      expect(res.status).to.equal(201);
      expect(res.body.payload.status).to.equal(PRODUCT_STATUS.OUT_OF_STOCK);
    });

    it('responde 400 si faltan datos', async () => {
      const res = await request(app).post('/api/products').send({ name: 'Solo nombre' });

      expectError(res, 400, ErrorDictionary.INVALID_PRODUCT_DATA);
    });

    it('responde 400 si el precio es negativo', async () => {
      const res = await request(app).post('/api/products').send(validProduct({ price: -5 }));

      expectError(res, 400, ErrorDictionary.INVALID_PRODUCT_DATA);
    });
  });

  describe('GET /api/products', () => {
    it('por defecto no lista los productos sin stock', async () => {
      await createProduct({ name: 'Con stock' });
      await createProduct({ name: 'Sin stock', stock: 0 });

      const res = await request(app).get('/api/products');

      expect(res.status).to.equal(200);
      expect(res.body.payload).to.have.lengthOf(1);
      expect(res.body.payload[0].name).to.equal('Con stock');
    });

    it('con includeOutOfStock=true lista todos', async () => {
      await createProduct({ name: 'Con stock' });
      await createProduct({ name: 'Sin stock', stock: 0 });

      const res = await request(app).get('/api/products?includeOutOfStock=true');

      expect(res.status).to.equal(200);
      expect(res.body.payload).to.have.lengthOf(2);
    });
  });

  describe('GET /api/products/:id', () => {
    it('devuelve el producto', async () => {
      const product = await createProduct();

      const res = await request(app).get(`/api/products/${product._id}`);

      expect(res.status).to.equal(200);
      expect(res.body.payload._id).to.equal(product._id);
    });

    it('responde 404 si no existe', async () => {
      const res = await request(app).get(`/api/products/${NON_EXISTENT_ID}`);

      expectError(res, 404, ErrorDictionary.PRODUCT_NOT_FOUND);
    });

    it('responde 400 si el id es invalido', async () => {
      const res = await request(app).get('/api/products/abc');

      expectError(res, 400, ErrorDictionary.INVALID_ID);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('recalcula el estado cuando cambia el stock', async () => {
      const product = await createProduct();

      const res = await request(app).put(`/api/products/${product._id}`).send({ stock: 0 });

      expect(res.status).to.equal(200);
      expect(res.body.payload.status).to.equal(PRODUCT_STATUS.OUT_OF_STOCK);
    });

    it('responde 400 si el estado no es valido', async () => {
      const product = await createProduct();

      const res = await request(app).put(`/api/products/${product._id}`).send({ status: 'roto' });

      expectError(res, 400, ErrorDictionary.INVALID_PRODUCT_STATUS);
    });

    it('responde 404 si no existe', async () => {
      const res = await request(app).put(`/api/products/${NON_EXISTENT_ID}`).send({ price: 10 });

      expectError(res, 404, ErrorDictionary.PRODUCT_NOT_FOUND);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('elimina el producto', async () => {
      const product = await createProduct();

      const res = await request(app).delete(`/api/products/${product._id}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ status: 'success', message: 'Producto eliminado correctamente' });
    });

    it('responde 404 si no existe', async () => {
      const res = await request(app).delete(`/api/products/${NON_EXISTENT_ID}`);

      expectError(res, 404, ErrorDictionary.PRODUCT_NOT_FOUND);
    });
  });
});
