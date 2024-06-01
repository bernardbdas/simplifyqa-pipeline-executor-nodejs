FROM node:lts-alpine as simplifyqa-pipeline-executor
WORKDIR /app
COPY . .
RUN npm ci && npm run build
CMD ["node", "./dist/src/index.js"]
HEALTHCHECK NONE