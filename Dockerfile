FROM node:22-slim

ENV NODE_ENV=production
WORKDIR /app

# primero las dependencias, asi Docker reutiliza la capa si no cambian
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src

# carpetas de logs y uploads, con permisos para el usuario sin privilegios
RUN mkdir -p logs uploads && chown -R node:node /app
USER node

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||8080)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
