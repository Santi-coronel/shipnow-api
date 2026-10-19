import mongoose from 'mongoose';
import app from './app.js';
import config from './config/index.js';
import logger from './utils/logger.js';

async function startServer() {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info(`Conexion a MongoDB establecida (entorno: ${config.nodeEnv})`);

    app.listen(config.port, () => {
      logger.info(`Servidor ShipNow escuchando en el puerto ${config.port}`);
      logger.info(`Documentacion disponible en http://localhost:${config.port}/api/docs`);
    });
  } catch (error) {
    logger.fatal(`No se pudo iniciar el servidor: ${error.message}`);
    process.exit(1);
  }
}

startServer();
