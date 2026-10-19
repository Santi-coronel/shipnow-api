import dotenv from 'dotenv';

dotenv.config();

// Variables obligatorias: si falta alguna, la app no debe arrancar.
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(
      `Falta la variable de entorno obligatoria "${key}". Revisa tu archivo .env (ver .env.example).`
    );
  }
});

// Unico lugar del proyecto que lee process.env directamente.
// El resto de los archivos debe importar este objeto ya validado.
const config = Object.freeze({
  port: Number(process.env.PORT) || 8080,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
});

export default config;
