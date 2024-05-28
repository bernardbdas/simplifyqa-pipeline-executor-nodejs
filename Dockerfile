FROM node:lts-alpine3.20 as simplifyqa-pipeline-executor
RUN useradd -r 1001
WORKDIR /app
COPY . .
USER 1001
RUN npm ci && npm run build
HEALTHCHECK NONE