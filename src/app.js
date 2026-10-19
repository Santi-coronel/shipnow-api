import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import apiRouter from './routes/index.js';
import swaggerSpec from './docs/swagger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { routeNotFoundHandle } from './middlewares/routeNotFoundHandle.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Documentacion interactiva (Pre-entrega 5) — separada de la logica de rutas.
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', apiRouter);

// Rutas no matcheadas.
app.use(routeNotFoundHandle);

// Manejo centralizado de errores (siempre al final).
app.use(errorHandler);

export default app;
