# SimplifyQA Pipeline Executor

[![SimplifyQA Pipeline Executor](https://github.com/bernardbdas/simplifyqa-pipeline-executor-nodejs/actions/workflows/basic-workflow.yml/badge.svg)](https://github.com/bernardbdas/simplifyqa-pipeline-executor-nodejs/actions/workflows/basic-workflow.yml)

This guide provides instructions on using the `simplifyqa-pipeline-executor` Docker image to execute pipelines for the SimplifyQA application.

## Table of Contents

- [SimplifyQA Pipeline Executor](#simplifyqa-pipeline-executor)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Usage](#usage)
    - [Step 1: Pull the Docker Image](#step-1-pull-the-docker-image)
    - [Step 2: Building the services](#step-2-building-the-services)
      - [Using `docker run` command](#using-docker-run-command)
      - [Using a `docker-compose.yml` File](#using-a-docker-composeyml-file)
    - [Step 3: Pull and Run the Docker Image](#step-3-pull-and-run-the-docker-image)
  - [Environment Variables](#environment-variables)
  - [Docker Compose Configuration](#docker-compose-configuration)
  - [Stopping the Service](#stopping-the-service)
  - [Additional Information](#additional-information)

## Getting Started

To get started with the `simplifyqa-pipeline-executor`, you will need Docker and Docker Compose installed on your system. Follow the instructions below to set up and run the container.

## Prerequisites

Ensure you have Docker and Docker Compose installed. You can download them from the following links:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Usage

### Step 1: Pull the Docker Image

First, pull the latest `simplifyqa-pipeline-executor` image from Docker Hub.

```sh
docker pull bernardbdas/simplifyqa-pipeline-executor
```

### Step 2: Building the services

#### Using `docker run` command

Run the Docker container using the `docker run` command. Make sure to replace the environment variable values with your actual configuration.

```sh
docker run --name simplifyqa-pipeline-executor \
  -e INPUT_EXECTOKEN=U2FsdGVkX18vNvpp************************************************************************ \
  -e INPUT_APPURL=https://simplifyqa.app \
  -e INPUT_THRESHOLD=40 \
  -e INPUT_VERBOSE=true \
  bernardbdas/simplifyqa-pipeline-executor:latest
```

#### Using a `docker-compose.yml` File

Create a `docker-compose.yml` file with the following content:

```yaml
services:
  simplifyqa-pipeline-executor:
    container_name: simplifyqa-pipeline-executor
    image: bernardbdas/simplifyqa-pipeline-executor
    environment:
      INPUT_EXECTOKEN: U2FsdGVkX18vNvpp************************************************************************
      INPUT_APPURL: https://simplifyqa.app
      INPUT_THRESHOLD: 40
      INPUT_VERBOSE: true
```

Update the environment variables in the `docker-compose.yml` file according to your requirements. Refer to the [Environment Variables](#environment-variables) section for details.

### Step 3: Pull and Run the Docker Image

Use Docker Compose to pull the latest image and run the container.

```sh
docker-compose up -d
```

This command will pull the latest `simplifyqa-pipeline-executor` image from Docker Hub and start the service in detached mode.

## Environment Variables

The `simplifyqa-pipeline-executor` service uses the following environment variables:

- `INPUT_EXECTOKEN`: The execution token used for authentication.
- `INPUT_APPURL`: The URL of the SimplifyQA application.
- `INPUT_THRESHOLD`: The threshold value for the pipeline execution.
- `INPUT_VERBOSE`: Set to `true` to enable verbose logging.

```yaml
environment:
  INPUT_EXECTOKEN: U2FsdGVkX18vNvpp************************************************************************
  INPUT_APPURL: https://simplifyqa.app
  INPUT_THRESHOLD: 40
  INPUT_VERBOSE: true

```

## Docker Compose Configuration

Below is the complete `docker-compose.yml` file used to configure and run the `simplifyqa-pipeline-executor` Docker image.

```yaml
services:
  simplifyqa-pipeline-executor:
    container_name: simplifyqa-pipeline-executor
    image: bernardbdas/simplifyqa-pipeline-executor
    environment:
      INPUT_EXECTOKEN: U2FsdGVkX18vNvpp*****************************************************************
      INPUT_APPURL: https://simplifyqa.app
      INPUT_THRESHOLD: 40
      INPUT_VERBOSE: true
```

## Stopping the Service

To stop the service, use the following command:

```sh
docker-compose down
```

This command will stop and remove the containers defined in the `docker-compose.yml` file.

## Additional Information

For more information on using Docker and Docker Compose, refer to the official documentation:

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

If you encounter any issues or have questions, please open an issue in the [repository](https://github.com/bernardbdas/simplifyqa-pipeline-executor-nodejs) or contact one of the maintainers mentioned below:

- [@bernardbdas](https://github.com/bernardbdas)
