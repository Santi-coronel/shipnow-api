import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app.js';
import { ErrorDictionary, EErrors } from '../../src/utils/errors.js';
import { expectError } from '../helpers/factories.js';

describe('Sistema: health, logger, Swagger y errores globales', () => {
  describe('GET /api/health', () => {
    it('responde que la API esta funcionando', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ status: 'success', message: 'ShipNow API funcionando correctamente' });
    });
  });

  describe('GET /api/logger/test', () => {
    it('genera logs en los 6 niveles y responde success', async () => {
      const res = await request(app).get('/api/logger/test');

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('success');
      expect(res.body.message).to.be.a('string').that.includes('6 niveles');
    });
  });

  describe('Swagger en /api/docs', () => {
    it('sirve la interfaz de documentacion', async () => {
      const res = await request(app).get('/api/docs/').redirects(1);

      expect(res.status).to.equal(200);
      expect(res.headers['content-type']).to.include('text/html');
      expect(res.text).to.include('swagger');
    });
  });

  describe('Errores globales', () => {
    it('responde 404 con formato de error en una ruta inexistente', async () => {
      const res = await request(app).get('/api/no-existe');

      expectError(res, 404, ErrorDictionary.ROUTE_NOT_FOUND);
    });

    it('responde 400 si el JSON enviado esta roto', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send('{"firstName": ');

      expectError(res, 400, ErrorDictionary.INVALID_JSON);
    });

    it('cada error del diccionario tiene un codigo unico del enum', () => {
      const codes = Object.values(ErrorDictionary).map((entry) => entry.code);

      expect(new Set(codes).size).to.equal(codes.length);
      expect(codes.every((code) => Object.values(EErrors).includes(code))).to.equal(true);
    });
  });
});
