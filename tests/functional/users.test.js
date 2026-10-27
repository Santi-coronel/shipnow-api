import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app.js';
import { USER_ROLES } from '../../src/constants/index.js';
import { ErrorDictionary } from '../../src/utils/errors.js';
import { clearDatabase } from '../helpers/db.js';
import { buildUser, createUser, expectError } from '../helpers/factories.js';

const NON_EXISTENT_ID = '64b7f0c2a1b2c3d4e5f60718';

describe('Users', () => {
  beforeEach(clearDatabase);
  after(clearDatabase);

  describe('GET /api/users', () => {
    it('devuelve una lista vacia si no hay usuarios', async () => {
      const res = await request(app).get('/api/users');

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('success');
      expect(res.body.payload).to.be.an('array').that.is.empty;
    });

    it('devuelve los usuarios creados sin exponer la password', async () => {
      await createUser({ email: 'uno@test.com' });
      await createUser({ email: 'dos@test.com', role: USER_ROLES.DRIVER });

      const res = await request(app).get('/api/users');

      expect(res.status).to.equal(200);
      expect(res.body.payload).to.have.lengthOf(2);
      res.body.payload.forEach((user) => {
        expect(user).to.include.keys('_id', 'firstName', 'lastName', 'email', 'role', 'isAvailable');
        expect(user).to.not.have.property('password');
      });
    });
  });

  describe('POST /api/users', () => {
    it('crea un usuario valido', async () => {
      const body = buildUser({ email: 'Nuevo@Test.com' });

      const res = await request(app).post('/api/users').send(body);

      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal('success');
      expect(res.body.payload).to.include({
        firstName: body.firstName,
        lastName: body.lastName,
        email: 'nuevo@test.com',
        role: USER_ROLES.CUSTOMER,
        isAvailable: true,
      });
      expect(res.body.payload._id).to.be.a('string');
      expect(res.body.payload).to.not.have.property('password');
    });

    it('asigna el rol customer por defecto', async () => {
      const { role, ...body } = buildUser();

      const res = await request(app).post('/api/users').send(body);

      expect(res.status).to.equal(201);
      expect(res.body.payload.role).to.equal(USER_ROLES.CUSTOMER);
    });

    it('responde 400 si faltan datos obligatorios', async () => {
      const res = await request(app).post('/api/users').send({ firstName: 'Ana' });

      expectError(res, 400, ErrorDictionary.INVALID_USER_DATA);
    });

    it('responde 400 si el rol no existe', async () => {
      const res = await request(app).post('/api/users').send(buildUser({ role: 'superhero' }));

      expectError(res, 400, ErrorDictionary.INVALID_ROLE);
    });

    it('responde 403 si se intenta crear un admin', async () => {
      const res = await request(app).post('/api/users').send(buildUser({ role: USER_ROLES.ADMIN }));

      expectError(res, 403, ErrorDictionary.ADMIN_CREATION_FORBIDDEN);
    });

    it('responde 409 si el email ya existe', async () => {
      await createUser({ email: 'repetido@test.com' });

      const res = await request(app).post('/api/users').send(buildUser({ email: 'repetido@test.com' }));

      expectError(res, 409, ErrorDictionary.USER_ALREADY_EXISTS);
    });
  });

  describe('GET /api/users/:id', () => {
    it('devuelve el usuario pedido', async () => {
      const user = await createUser();

      const res = await request(app).get(`/api/users/${user._id}`);

      expect(res.status).to.equal(200);
      expect(res.body.payload).to.include({ _id: user._id, email: user.email });
      expect(res.body.payload).to.not.have.property('password');
    });

    it('responde 404 si el usuario no existe', async () => {
      const res = await request(app).get(`/api/users/${NON_EXISTENT_ID}`);

      expectError(res, 404, ErrorDictionary.USER_NOT_FOUND);
    });

    it('responde 400 si el id no es valido', async () => {
      const res = await request(app).get('/api/users/123');

      expectError(res, 400, ErrorDictionary.INVALID_ID);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('actualiza los campos enviados', async () => {
      const user = await createUser();

      const res = await request(app)
        .put(`/api/users/${user._id}`)
        .send({ firstName: 'Maria', isAvailable: false });

      expect(res.status).to.equal(200);
      expect(res.body.payload).to.include({ _id: user._id, firstName: 'Maria', isAvailable: false });
      expect(res.body.payload).to.not.have.property('password');
    });

    it('responde 403 si se intenta asignar el rol admin', async () => {
      const user = await createUser();

      const res = await request(app).put(`/api/users/${user._id}`).send({ role: USER_ROLES.ADMIN });

      expectError(res, 403, ErrorDictionary.ADMIN_CREATION_FORBIDDEN);
    });

    it('responde 400 si el rol no existe', async () => {
      const user = await createUser();

      const res = await request(app).put(`/api/users/${user._id}`).send({ role: 'superhero' });

      expectError(res, 400, ErrorDictionary.INVALID_ROLE);
    });

    it('responde 404 si el usuario no existe', async () => {
      const res = await request(app).put(`/api/users/${NON_EXISTENT_ID}`).send({ firstName: 'Maria' });

      expectError(res, 404, ErrorDictionary.USER_NOT_FOUND);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('elimina el usuario', async () => {
      const user = await createUser();

      const res = await request(app).delete(`/api/users/${user._id}`);
      const after = await request(app).get(`/api/users/${user._id}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ status: 'success', message: 'Usuario eliminado' });
      expect(after.status).to.equal(404);
    });

    it('responde 404 si el usuario no existe', async () => {
      const res = await request(app).delete(`/api/users/${NON_EXISTENT_ID}`);

      expectError(res, 404, ErrorDictionary.USER_NOT_FOUND);
    });
  });
});
