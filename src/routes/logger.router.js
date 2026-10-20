import { Router } from 'express';
import loggerController from '../controllers/logger.controller.js';

const router = Router();

/**
 * @openapi
 * /logger/test:
 *   get:
 *     tags: [Logger]
 *     summary: Genera logs de prueba
 *     description: >
 *       Herramienta interna que genera un mensaje en cada uno de los seis
 *       niveles configurados en Winston: debug, http, info, warning, error
 *       y fatal. Este endpoint valida el sistema de logs y no representa
 *       una funcionalidad de negocio.
 *     responses:
 *       200:
 *         description: Logs de prueba generados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *             example:
 *               status: success
 *               message: Se generaron logs de prueba en los 6 niveles (debug, http, info, warning, error, fatal). Revisa la consola y los archivos de error.
 */
router.get('/test', loggerController.testLogger);

export default router;