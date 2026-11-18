import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import config from './config/index.js';
import { createApiRouter } from './routes/index.js';
import swaggerSpec from './docs/swagger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { routeNotFoundHandle } from './middlewares/routeNotFoundHandle.js';

const INTERNAL_PATHS = /^\/(mocks|logger)/;

// Si los endpoints internos estan apagados, tampoco se muestran en Swagger.
const buildSpec = (internalEndpoints) => {
  if (internalEndpoints) return swaggerSpec;
  const paths = Object.fromEntries(Object.entries(swaggerSpec.paths).filter(([route]) => !INTERNAL_PATHS.test(route)));
  const tags = swaggerSpec.tags.filter((tag) => tag.name !== 'Mocks' && tag.name !== 'Logger');
  return { ...swaggerSpec, paths, tags };
};

export const createApp = ({
  internalEndpoints = config.enableInternalEndpoints,
  docs = config.enableDocs,
} = {}) => {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  if (docs) {
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(buildSpec(internalEndpoints)));
  }

  app.use('/api', createApiRouter({ internalEndpoints }));

  app.use(routeNotFoundHandle);
  app.use(errorHandler);

  return app;
};

export default createApp();
