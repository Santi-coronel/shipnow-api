import path from 'node:path';
import dotenv from 'dotenv';
import { ENVIRONMENTS, LOG_LEVELS } from '../constants/index.js';

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const env = process.env;
const problems = [];

const nodeEnv = env.NODE_ENV || ENVIRONMENTS.DEVELOPMENT;
if (!Object.values(ENVIRONMENTS).includes(nodeEnv)) {
  problems.push(`NODE_ENV tiene que ser ${Object.values(ENVIRONMENTS).join(', ')} (llego "${nodeEnv}")`);
}

if (!env.MONGODB_URI) {
  problems.push('falta MONGODB_URI (URI de conexion a MongoDB)');
} else if (!/^mongodb(\+srv)?:\/\//.test(env.MONGODB_URI)) {
  problems.push('MONGODB_URI tiene que empezar con mongodb:// o mongodb+srv://');
}

const port = env.PORT === undefined || env.PORT === '' ? 8080 : Number(env.PORT);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  problems.push(`PORT tiene que ser un numero entre 1 y 65535 (llego "${env.PORT}")`);
}

const defaultLogLevel = nodeEnv === ENVIRONMENTS.PRODUCTION ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;
const logLevel = env.LOG_LEVEL || defaultLogLevel;
if (!Object.values(LOG_LEVELS).includes(logLevel)) {
  problems.push(`LOG_LEVEL tiene que ser ${Object.values(LOG_LEVELS).join(', ')} (llego "${logLevel}")`);
}

if (env.ENABLE_DOCS && !['true', 'false'].includes(env.ENABLE_DOCS)) {
  problems.push('ENABLE_DOCS tiene que ser true o false');
}

if (problems.length > 0) {
  throw new Error(
    `Configuracion invalida, la app no puede arrancar:\n${problems.map((p) => `  - ${p}`).join('\n')}\n` +
      'Revisa tu archivo .env o las variables del contenedor (ver .env.example).'
  );
}

const isProduction = nodeEnv === ENVIRONMENTS.PRODUCTION;

// Unico lugar que lee process.env; el resto importa este objeto.
const config = Object.freeze({
  port,
  mongoUri: env.MONGODB_URI,
  nodeEnv,
  logLevel,
  uploadsDir: path.resolve(env.UPLOADS_DIR || 'uploads'),
  publicUrl: env.PUBLIC_URL || `http://localhost:${port}`,
  // mocks y logger de prueba solo fuera de produccion; Swagger se puede prender con ENABLE_DOCS
  enableInternalEndpoints: !isProduction,
  enableDocs: !isProduction || env.ENABLE_DOCS === 'true',
});

export default config;
