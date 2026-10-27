import { expect } from 'chai';
import swaggerSpec from '../../src/docs/swagger.js';
import { generateMockUsers } from '../../src/mocks/user.mocks.js';
import { MOCKING_PARAMETERS, PRODUCT_STATUS, USER_ROLES } from '../../src/constants/index.js';
import { createError, ErrorDictionary, EErrors } from '../../src/utils/errors.js';
import { errorHandler } from '../../src/middlewares/errorHandler.js';
import mocksService from '../../src/services/mocks.service.js';

const fakeRes = () => {
  const res = { statusCode: null, body: null };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { res.body = body; return res; };
  return res;
};

describe('Unit: constantes', () => {
  it('estan congeladas', () => {
    expect(Object.isFrozen(USER_ROLES)).to.equal(true);
    expect(Object.isFrozen(PRODUCT_STATUS)).to.equal(true);
    expect(Object.isFrozen(MOCKING_PARAMETERS)).to.equal(true);
  });

  it('PRODUCT_STATUS tiene available y out_of_stock', () => {
    expect(Object.values(PRODUCT_STATUS)).to.have.members(['available', 'out_of_stock']);
  });
});

describe('Unit: errores', () => {
  it('createError arma un error con name, code y status', () => {
    const error = createError(ErrorDictionary.USER_NOT_FOUND);

    expect(error).to.be.instanceOf(Error);
    expect(error).to.include({ name: 'UserNotFound', code: EErrors.USER_NOT_FOUND, status: 404 });
  });

  it('los codigos del enum no se repiten', () => {
    const codes = Object.values(EErrors);
    expect(new Set(codes).size).to.equal(codes.length);
  });

  it('el errorHandler oculta el detalle de un error inesperado', () => {
    const res = fakeRes();
    const req = { method: 'GET', originalUrl: '/x' };

    errorHandler(new Error('detalle interno secreto'), req, res, () => {});

    expect(res.statusCode).to.equal(500);
    expect(res.body.error.code).to.equal(EErrors.INTERNAL_ERROR);
    expect(JSON.stringify(res.body)).to.not.include('secreto');
  });

  it('el errorHandler convierte un CastError en INVALID_ID', () => {
    const res = fakeRes();
    const err = Object.assign(new Error('cast'), { name: 'CastError' });

    errorHandler(err, { method: 'GET', originalUrl: '/x' }, res, () => {});

    expect(res.statusCode).to.equal(400);
    expect(res.body.error.code).to.equal(EErrors.INVALID_ID);
  });
});

describe('Unit: mocks', () => {
  it('generateMockUsers devuelve la cantidad pedida', () => {
    const users = generateMockUsers(7);

    expect(users).to.have.lengthOf(7);
    expect(users[0]).to.include.keys('firstName', 'lastName', 'email', 'password');
  });

  it('mocksService.getUsers valida la cantidad', () => {
    expect(() => mocksService.getUsers(0)).to.throw().with.property('code', EErrors.INVALID_QUANTITY);
    expect(() => mocksService.getUsers(MOCKING_PARAMETERS.MAX_QTY + 1)).to.throw().with.property('code', EErrors.INVALID_QUANTITY);
    expect(mocksService.getUsers()).to.have.lengthOf(MOCKING_PARAMETERS.DEFAULT_QTY);
  });
});

describe('Unit: Swagger', () => {
  it('declara el tag Products y documenta sus rutas', () => {
    const tags = swaggerSpec.tags.map((tag) => tag.name);

    expect(tags).to.include('Products');
    expect(swaggerSpec.paths).to.have.property('/products');
    expect(swaggerSpec.paths).to.have.property('/products/{id}');
  });

  it('documenta las rutas principales', () => {
    ['/health', '/users', '/orders', '/deliveries', '/mocks/users', '/logger/test'].forEach((path) => {
      expect(swaggerSpec.paths, path).to.have.property(path);
    });
  });

  it('toda respuesta de error referencia ErrorResponse', () => {
    Object.entries(swaggerSpec.paths).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, op]) => {
        Object.entries(op.responses).forEach(([status, response]) => {
          if (Number(status) >= 400) {
            const ref = response.content['application/json'].schema.$ref;
            expect(ref, `${method} ${path} ${status}`).to.equal('#/components/schemas/ErrorResponse');
          }
        });
      });
    });
  });

  it('los POST y PUT con body declaran requestBody', () => {
    Object.entries(swaggerSpec.paths).forEach(([path, methods]) => {
      ['post', 'put'].forEach((method) => {
        if (methods[method] && !path.includes('seed') && path !== '/logger/test') {
          expect(methods[method].requestBody, `${method} ${path}`).to.exist;
        }
      });
    });
  });
});
