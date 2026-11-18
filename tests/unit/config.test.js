import { spawnSync } from 'node:child_process';
import { expect } from 'chai';

// La config se evalua al importarse, asi que se prueba en un proceso aparte.
// Las variables vacias evitan que dotenv tome valores de un .env local.
const loadConfig = (envOverrides) => {
  const result = spawnSync(
    process.execPath,
    ['--input-type=module', '-e', "const { default: c } = await import('./src/config/index.js'); console.log(JSON.stringify(c));"],
    { env: { PATH: process.env.PATH, NODE_ENV: 'production', MONGODB_URI: 'mongodb://localhost:27017/x', PORT: '', LOG_LEVEL: '', ENABLE_DOCS: '', ...envOverrides }, encoding: 'utf8' }
  );
  return result;
};

describe('Unit: configuracion de entorno', () => {
  it('carga los valores validos', () => {
    const result = loadConfig({ PORT: '9000', LOG_LEVEL: 'warning' });
    const config = JSON.parse(result.stdout);

    expect(result.status).to.equal(0);
    expect(config).to.include({ port: 9000, nodeEnv: 'production', logLevel: 'warning' });
  });

  it('en produccion apaga mocks/logger y Swagger por defecto', () => {
    const config = JSON.parse(loadConfig({}).stdout);

    expect(config.enableInternalEndpoints).to.equal(false);
    expect(config.enableDocs).to.equal(false);
    expect(config.logLevel).to.equal('info');
  });

  it('ENABLE_DOCS=true prende Swagger en produccion', () => {
    const config = JSON.parse(loadConfig({ ENABLE_DOCS: 'true' }).stdout);

    expect(config.enableDocs).to.equal(true);
    expect(config.enableInternalEndpoints).to.equal(false);
  });

  it('fuera de produccion todo queda prendido', () => {
    const config = JSON.parse(loadConfig({ NODE_ENV: 'development' }).stdout);

    expect(config.enableInternalEndpoints).to.equal(true);
    expect(config.enableDocs).to.equal(true);
    expect(config.logLevel).to.equal('debug');
  });

  [
    ['falta MONGODB_URI', { MONGODB_URI: '' }, 'falta MONGODB_URI'],
    ['MONGODB_URI invalida', { MONGODB_URI: 'http://localhost' }, 'tiene que empezar con mongodb'],
    ['PORT invalido', { PORT: 'abc' }, 'PORT'],
    ['PORT fuera de rango', { PORT: '70000' }, 'PORT'],
    ['NODE_ENV invalido', { NODE_ENV: 'staging' }, 'NODE_ENV'],
    ['LOG_LEVEL invalido', { LOG_LEVEL: 'verbose' }, 'LOG_LEVEL'],
    ['ENABLE_DOCS invalido', { ENABLE_DOCS: 'si' }, 'ENABLE_DOCS'],
  ].forEach(([name, env, expected]) => {
    it(`no arranca si ${name}`, () => {
      const result = loadConfig(env);

      expect(result.status).to.not.equal(0);
      expect(result.stderr).to.include('Configuracion invalida');
      expect(result.stderr).to.include(expected);
    });
  });

  it('informa todos los problemas juntos', () => {
    const result = loadConfig({ MONGODB_URI: '', PORT: 'abc' });

    expect(result.stderr).to.include('MONGODB_URI').and.to.include('PORT');
  });
});
