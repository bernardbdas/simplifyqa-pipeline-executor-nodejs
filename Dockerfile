FROM node:22.2.0-alpine as simplifyqa-pipeline-executor
RUN adduser -D -u 1001 appuser
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM node:22.2.0-alpine
COPY --from=simplifyqa-pipeline-executor /app /app
USER 1001
WORKDIR /app
HEALTHCHECK NONE