import request from 'supertest';
import { expect } from 'chai';
import { createApp } from '../../src/app.js';
import { ErrorDictionary } from '../../src/utils/errors.js';
import { expectError } from '../helpers/factories.js';

// En produccion mocks y logger no existen y Swagger depende de ENABLE_DOCS.
describe('Endpoints internos en produccion', () => {
  const productionApp = createApp({ internalEndpoints: false, docs: false });

  ['/api/mocks/users', '/api/mocks/orders', '/api/logger/test', '/api/docs/'].forEach((route) => {
    it(`GET ${route} responde 404 con el formato de error`, async () => {
      const res = await request(productionApp).get(route);

      expectError(res, 404, ErrorDictionary.ROUTE_NOT_FOUND);
    });
  });

  it('POST /api/mocks/users/seed tampoco existe', async () => {
    const res = await request(productionApp).post('/api/mocks/users/seed').send({ qty: 1 });

    expectError(res, 404, ErrorDictionary.ROUTE_NOT_FOUND);
  });

  it('los endpoints de negocio y el health siguen funcionando', async () => {
    const health = await request(productionApp).get('/api/health');
    const users = await request(productionApp).get('/api/users');

    expect(health.status).to.equal(200);
    expect(users.status).to.equal(200);
  });

  it('con docs prendidos Swagger funciona pero no lista mocks ni logger', async () => {
    const docsApp = createApp({ internalEndpoints: false, docs: true });

    const page = await request(docsApp).get('/api/docs/').redirects(1);
    const mocks = await request(docsApp).get('/api/mocks/users');

    expect(page.status).to.equal(200);
    expect(mocks.status).to.equal(404);
  });
});
