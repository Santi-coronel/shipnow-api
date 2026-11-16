import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const requiredEnvVars = ['MONGODB_URI'];
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(
      `Falta la variable de entorno obligatoria "${key}". Revisa tu archivo .env (ver .env.example).`
    );
  }
});

const config = Object.freeze({
  port: Number(process.env.PORT) || 8080,
  mongoUri: process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV || 'development',
  uploadsDir: path.resolve(process.env.UPLOADS_DIR || 'uploads'),
  logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
});

export default config;
