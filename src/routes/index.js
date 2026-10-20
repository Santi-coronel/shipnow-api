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
 *     summary: Comprueba la disponibilidad de la API
 *     description: Devuelve una respuesta simple para confirmar que el servidor está funcionando.
 *     responses:
 *       200:
 *         description: La API está funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *             example:
 *               status: success
 *               message: ShipNow API funcionando correctamente
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'ShipNow API funcionando correctamente',
  });
});

router.use('/users', usersRouter);
router.use('/orders', ordersRouter);
router.use('/deliveries', deliveriesRouter);
router.use('/mocks', mocksRouter);
router.use('/logger', loggerRouter);

export default router;