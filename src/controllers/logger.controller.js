import logger from '../utils/logger.js';

class LoggerController {
  testLogger(req, res) {
    logger.debug('Log de prueba: nivel debug');
    logger.http('Log de prueba: nivel http');
    logger.info('Log de prueba: nivel info');
    logger.warning('Log de prueba: nivel warning');
    logger.error('Log de prueba: nivel error');
    logger.fatal('Log de prueba: nivel fatal');

    res.json({
      status: 'success',
      message: 'Se generaron logs de prueba en los 6 niveles (debug, http, info, warning, error, fatal). Revisa la consola y logs/error-*.log',
    });
  }
}

export default new LoggerController();
