import { Router } from 'express';
import mongoose from 'mongoose';
import config from '../config/index.js';
import usersRouter from './users.router.js';
import productsRouter from './products.router.js';
import ordersRouter from './orders.router.js';
import deliveriesRouter from './deliveries.router.js';
import mocksRouter from './mocks.router.js';
import loggerRouter from './logger.router.js';


/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Comprueba la disponibilidad de la API
 *     description: Devuelve el estado de la API, el entorno, el uptime en segundos, la fecha actual y si hay conexión con la base. No expone datos sensibles.
 *     responses:
 *       200:
 *         description: La API está funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
export const createApiRouter = ({ internalEndpoints = true } = {}) => {
  const router = Router();

  router.get('/health', (req, res) => {
    res.json({
      status: 'success',
      message: 'ShipNow API funcionando correctamente',
      environment: config.nodeEnv,
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    });
  });

  router.use('/users', usersRouter);
  router.use('/products', productsRouter);
  router.use('/orders', ordersRouter);
  router.use('/deliveries', deliveriesRouter);

  // en produccion estos dos no se montan, responden 404
  if (internalEndpoints) {
    router.use('/mocks', mocksRouter);
    router.use('/logger', loggerRouter);
  }

  return router;
};
