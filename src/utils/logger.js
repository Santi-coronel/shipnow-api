// Logger centralizado con Winston (Pre-entrega 4).
// Un unico punto de configuracion, importado desde cualquier archivo
// sin repetir setup. Niveles: debug, http, info, warning, error, fatal.

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import config from '../config/index.js';

// Winston no trae "warning"/"fatal" por default (usa "warn"), asi que
// definimos niveles custom con la severidad que pide el enunciado.
const customLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5,
  },
  colors: {
    fatal: 'bold red',
    error: 'red',
    warning: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
  },
};

winston.addColors(customLevels.colors);

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level}] ${message}`)
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level}] ${message}`)
);

// En desarrollo se muestra todo, incluido "debug".
// En produccion solo se registra desde "info" hacia arriba en severidad.
const consoleLevel = config.nodeEnv === 'production' ? 'info' : 'debug';

const transports = [
  new winston.transports.Console({
    level: consoleLevel,
    format: consoleFormat,
  }),
  // Rotacion diaria de archivos: evita que los logs crezcan sin control.
  // Solo persiste error y fatal (son los niveles 0 y 1 => "error" incluye fatal).
  new DailyRotateFile({
    level: 'error',
    dirname: 'logs',
    filename: 'error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d',
    format: fileFormat,
  }),
];

const logger = winston.createLogger({
  levels: customLevels.levels,
  level: config.logLevel,
  transports,
});

export default logger;
