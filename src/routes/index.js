import { Router } from 'express';
import usersRouter from './users.router.js';
import ordersRouter from './orders.router.js';
import deliveriesRouter from './deliveries.router.js';
import mocksRouter from './mocks.router.js';
import loggerRouter from './logger.router.js';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Chequeo de disponibilidad de la API
 *     responses:
 *       200:
 *         description: La API esta funcionando
 */
router.get('/health', (req, res) => {
  res.json({ status: 'success', message: 'ShipNow API funcionando correctamente' });
});

router.use('/users', usersRouter);
router.use('/orders', ordersRouter);
router.use('/deliveries', deliveriesRouter);
router.use('/mocks', mocksRouter);
router.use('/logger', loggerRouter);

export default router;
