ARG EXEC_TOKEN
ARG APP_URL=https://simplifyqa.app/
ARG THRESHOLD=100.00
ARG VERBOSE=false

# Use the official lightweight Node.js image based on Alpine
FROM node:lts-alpine as simplifyqa-pipeline-executor

# Set the working directory
WORKDIR /app

# Copy the application files to the container
ADD . .

# Install the dependencies
RUN npm install

# Build from source
RUN npm run build

# Specify environment variables (these can be overridden at runtime)
ENV INPUT_EXEC_TOKEN=${EXEC_TOKEN}
ENV INPUT_APP_URL=${APP_URL}
ENV INPUT_THRESHOLD=${THRESHOLD}
ENV INPUT_VERBOSE=${VERBOSE}

# Set the default command to run the application
ENTRYPOINT ["sh", "-c", "node ./dist/src/index.js"]
