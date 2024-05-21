import { logger } from "@utils/logger.js";
import { TaskResult } from "azure-pipelines-task-lib";

class ExecutionDriver {
  constructor() {}

  async drive(): Promise<TaskResult> {
    return new Promise<TaskResult>((resolve, reject) => {
      try {
        resolve(TaskResult.Succeeded);
      } catch (err: any) {
        logger.error(err.message);
        reject(TaskResult.Failed);
      }
    });
  }
}

export { ExecutionDriver };
