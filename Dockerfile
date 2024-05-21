FROM node:latest as simplifyqa-pipeline-executor
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build