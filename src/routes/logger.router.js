import { Router } from 'express';
import loggerController from '../controllers/logger.controller.js';

const router = Router();

/**
 * @openapi
 * /logger/test:
 *   get:
 *     tags: [Logger]
 *     summary: Genera un log de prueba en cada uno de los 6 niveles
 *     description: >
 *       Herramienta interna de validacion del sistema de logs (Winston),
 *       no representa una funcionalidad de negocio real.
 *     responses:
 *       200:
 *         description: Logs generados correctamente
 */
router.get('/test', loggerController.testLogger);

export default router;
