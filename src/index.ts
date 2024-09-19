import * as task_obj from 'azure-pipelines-task-lib';
import { ExecutionModel } from '@models/Execution.model';
import { logger } from '@utils/logger';
import { stat } from 'fs';

const invalid_exec_token_msg: string = ' ERR: The EXEC_TOKEN value is invalid';
const invalid_env_msg: string =
  ' ERR: The APPURL value is invalid. (Resolving to default app url: https://simplifyqa.app)';
const invalid_threshold_msg: string =
  ' ERR: The THRESHOLD value is invalid. (Resolving to default threshold: 100%)';

const exec_pass_status_msg: string = 'Execution Passed!';
const exec_fail_status_msg: string = 'Execution Failed!';
const exec_pass_with_warn_status_msg: string =
  'Execution performed successfully with resolved values. Please change the values to avoid future warnings.';

async function gracefulShutdown({
  exec_obj,
  resFlag,
  issues_flag
}: {
  exec_obj: ExecutionModel;
  resFlag: boolean;
  issues_flag: boolean;
}): Promise<void> {
  let status = await exec_obj.checkExecStatus({ payload_flag: true });

  console.log(
    `EXECUTION STATUS: Execution ${exec_obj.getExecStatus()} for Suite ID: SU-${exec_obj.getCustId()}${exec_obj.getSuiteId()}`
  );
  console.log(
    `${' '.repeat(
      27
    )}(Executed ${exec_obj.getExecutedTcs()} of ${exec_obj.getTotalTcs()} testcase(s), execution percentage: ${exec_obj
      .getExecPercent()
      .toFixed(2)} %, fail percentage: ${exec_obj
      .getFailPercent()
      .toFixed(2)} %, threshold: ${exec_obj.getThreshold().toFixed(2)} % )\n`
  );
  let results_array = status.data.data.result;

  results_array.forEach(
    (item: {
      tcCode: string;
      tcName: string;
      result: string;
      totalSteps: number;
    }) => {
      console.log(
        `${' '.repeat(27)}${item.tcCode}: ${
          item.tcName
        } | TESTCASE ${item.result.toUpperCase()} (total steps: ${
          item.totalSteps
        })`
      );
    }
  );

  if (exec_obj.getVerbose()) {
    console.log(`REQUEST BODY: ${JSON.stringify(exec_obj.getStatusPayload())}`);
  }

  if (exec_obj.getVerbose()) {
    console.log(`RESPONSE BODY: ${JSON.stringify(status)}`);
  }
  if (exec_obj.getThreshold() <= exec_obj.getFailPercent()) {
    console.log(`${exec_fail_status_msg}`);
    task_obj.setResult(task_obj.TaskResult.Failed, ' Execution Failed!');
    resFlag = false;
  }

  let kill_status: any = null;
  kill_status = await exec_obj.killExec();

  if (kill_status === null) {
    console.log(`EXECUTION STATUS: FAILED to explicitly kill the execution!`);
  } else {
    console.log(
      `EXECUTION STATUS: SUCCESSFUL to explicitly kill the execution!`
    );
  }

  if (exec_obj.getVerbose()) {
    console.log(`REQUEST BODY: ${JSON.stringify(exec_obj.getKillPayload())}`);
  }

  if (exec_obj.getVerbose()) {
    console.log(`RESPONSE BODY: ${JSON.stringify(kill_status)}`);
  }

  if (issues_flag) {
    logger.info(`${exec_pass_with_warn_status_msg}`);
    task_obj.setResult(
      task_obj.TaskResult.SucceededWithIssues,
      ' Execution Succeded with Issues!'
    );
  } else {
    logger.info(`${exec_pass_status_msg}`);
    task_obj.setResult(task_obj.TaskResult.Succeeded, ' Execution Succeded!');
  }

  console.log(`REPORT URL: ${exec_obj.getReportUrl()}`);
  console.log('*'.repeat(51) + 'EOF' + '*'.repeat(51) + '\n');

  if (resFlag) return process.exit(0);
  else return process.exit(1);
}

async function run() {
  let exec_obj: ExecutionModel;
  let issues_flag: boolean = false;

  try {
    const exec_token: string = task_obj.getInputRequired('EXECTOKEN');
    let environment: string | undefined = task_obj.getInputRequired('APPURL');
    let threshold: number | string | undefined =
      task_obj.getInputRequired('THRESHOLD');
    let verbose: boolean | undefined = task_obj.getBoolInput('VERBOSE', false);

    if (exec_token.length != 88) {
      logger.info(invalid_exec_token_msg);
      task_obj.setResult(task_obj.TaskResult.Failed, invalid_exec_token_msg);
      logger.info('*'.repeat(51) + 'EOF' + '*'.repeat(51) + '\n');
      process.exit(1);
    }

    if (environment != undefined) {
      if (environment.length < 2) {
        issues_flag = true;
        logger.info(invalid_env_msg);
        environment = '';
      }
    } else {
      issues_flag = true;
      logger.info(invalid_env_msg);
      environment = '';
    }

    if (threshold != undefined) {
      if (Number.isNaN(Number.parseFloat(threshold))) {
        issues_flag = true;
        logger.info(invalid_threshold_msg);
        threshold = 100;
      } else {
        threshold = Number.parseFloat(threshold);
        if (threshold > 100 || threshold < 0) {
          issues_flag = true;
          logger.info(invalid_threshold_msg);
          threshold = 100;
        }
      }
    } else {
      issues_flag = true;
      logger.info(invalid_threshold_msg);
      threshold = 100;
    }

    if (verbose == undefined) {
      issues_flag = true;
      verbose = false;
    }
    logger.info('\n');
    logger.info(
      '**************************************  SIMPLIFYQA PIPELINE EXECUTOR  **************************************'
    );
    logger.info('\n\n\nThe Set Parameters are:');
    // logger.info( "=".repeat(105));
    exec_obj = new ExecutionModel({
      exec_token: exec_token,
      env: environment,
      threshold: threshold,
      verbose: verbose
    });

    // GRACEFUL SHUTDOWN ON USER INTERRUPT
    process.on('SIGTERM', () => {
      console.log('EXECUTION STATUS: GRACEFUL SHUTDOWN ON USER INTERRUPT.');
      gracefulShutdown({
        exec_obj: exec_obj,
        resFlag: false,
        issues_flag: issues_flag
      });
    });

    // GRACEFUL SHUTDOWN ON SYSTEM TERMINATION
    process.on('SIGINT', () => {
      console.log('EXECUTION STATUS: GRACEFUL SHUTDOWN ON SYSTEM TERMINATION.');
      gracefulShutdown({
        exec_obj: exec_obj,
        resFlag: false,
        issues_flag: issues_flag
      });
    });

    logger.info(
      'Execution Token: ' +
        '*'.repeat(70) +
        exec_obj
          .getExecToken()
          .slice(
            exec_obj.getExecToken().length - 18,
            exec_obj.getExecToken().length
          )
    );
    logger.info('App Url: ' + exec_obj.getAppUrl());
    logger.info('Threshold: ' + exec_obj.getThreshold() + ' %');
    logger.info('Verbose: ' + exec_obj.getVerbose());
    logger.info('*'.repeat(51) + '*'.repeat(51) + '\n\n\n');

    let triggered: any = await exec_obj.startExec();

    if (triggered === null && !exec_obj.getRetry()) {
      logger.info(`${exec_fail_status_msg}`);
      task_obj.setResult(task_obj.TaskResult.Failed, ' Execution Failed!');
      logger.info('\n');
      logger.info('*'.repeat(51) + 'EOF' + '*'.repeat(51) + '\n');
      process.exit(1);
    }

    logger.info(
      `EXECUTION STATUS: INITIALIZING TESTCASES in the triggered suite`
    );
    let status: any = null;
    status = await exec_obj.checkExecStatus({ payload_flag: true });

    while (status === null) {
      status = await new Promise((resolve) => {
        setTimeout(async () => {
          const newStatus = await exec_obj.checkExecStatus({
            payload_flag: false
          });
          resolve(newStatus);
        }, 5000);
      });
      //logger.info(status);
    }

    logger.info(
      `EXECUTION STATUS: Execution IN-PROGRESS for Suite ID: SU-${exec_obj.getCustId()}${exec_obj.getSuiteId()}`
    );
    logger.info(
      `${' '.repeat(
        27
      )}(Executed ${exec_obj.getExecutedTcs()} of ${exec_obj.getTotalTcs()} testcase(s), execution percentage: ${exec_obj
        .getExecPercent()
        .toFixed(2)} %, fail percentage: ${exec_obj
        .getFailPercent()
        .toFixed(2)} %, threshold: ${exec_obj.getThreshold().toFixed(2)} % )\n`
    );

    let results_array: any = status.data.data.result;

    results_array.forEach(
      (item: {
        tcCode: string;
        tcName: string;
        result: string;
        totalSteps: number;
      }) => {
        logger.info(
          `${' '.repeat(27)}${item.tcCode}: ${
            item.tcName
          } | TESTCASE ${item.result.toUpperCase()} (total steps: ${
            item.totalSteps
          })`
        );
      }
    );

    if (exec_obj.getVerbose()) {
      logger.info(
        `REQUEST BODY: ${JSON.stringify(exec_obj.getStatusPayload())}`
      );
    }

    if (exec_obj.getVerbose()) {
      logger.info(`RESPONSE BODY: ${JSON.stringify(status)}`);
    }

    while (
      exec_obj.getExecStatus() === 'INPROGRESS' &&
      exec_obj.getThreshold() > exec_obj.getFailPercent() &&
      !exec_obj.getisKilled()
    ) {
      let curr_tcs = exec_obj.getExecutedTcs();

      status = await new Promise((resolve) => {
        setTimeout(async () => {
          const newStatus = await exec_obj.checkExecStatus({
            payload_flag: false
          });
          resolve(newStatus);
        }, 5000);
      });
      if (curr_tcs < exec_obj.getExecutedTcs()) {
        logger.info(
          `EXECUTION STATUS: Execution ${exec_obj.getExecStatus()} for Suite ID: SU-${exec_obj.getCustId()}${exec_obj.getSuiteId()}`
        );
        logger.info(
          `${' '.repeat(
            27
          )}(Executed ${exec_obj.getExecutedTcs()} of ${exec_obj.getTotalTcs()} testcase(s), execution percentage: ${exec_obj
            .getExecPercent()
            .toFixed(2)} %, fail percentage: ${exec_obj
            .getFailPercent()
            .toFixed(2)} %, threshold: ${exec_obj
            .getThreshold()
            .toFixed(2)} % )\n`
        );
        let results_array: any = status.data.data.result;

        results_array.forEach(
          (item: {
            tcCode: string;
            tcName: string;
            result: string;
            totalSteps: number;
          }) => {
            logger.info(
              `${' '.repeat(27)}${item.tcCode}: ${
                item.tcName
              } | TESTCASE ${item.result.toUpperCase()} (total steps: ${
                item.totalSteps
              })`
            );
          }
        );

        if (exec_obj.getVerbose()) {
          logger.info(
            `REQUEST BODY: ${JSON.stringify(exec_obj.getStatusPayload())}`
          );
        }

        if (exec_obj.getVerbose()) {
          logger.info(`RESPONSE BODY: ${JSON.stringify(status)}`);
        }
      }

      if (exec_obj.getThreshold() <= exec_obj.getFailPercent()) {
        logger.info(`\n`);
        logger.info(`THRESHOLD REACHED!`);
        break;
      }
    }

    let resFlag = true;
    if (!exec_obj.getisKilled()) {
      logger.info(
        `EXECUTION STATUS: Execution ${exec_obj.getExecStatus()} for Suite ID: SU-${exec_obj.getCustId()}${exec_obj.getSuiteId()}`
      );
      logger.info(
        `${' '.repeat(
          27
        )}(Executed ${exec_obj.getExecutedTcs()} of ${exec_obj.getTotalTcs()} testcase(s), execution percentage: ${exec_obj
          .getExecPercent()
          .toFixed(2)} %, fail percentage: ${exec_obj
          .getFailPercent()
          .toFixed(2)} %, threshold: ${exec_obj
          .getThreshold()
          .toFixed(2)} % )\n`
      );
      results_array = status.data.data.result;

      results_array.forEach(
        (item: {
          tcCode: string;
          tcName: string;
          result: string;
          totalSteps: number;
        }) => {
          logger.info(
            `${' '.repeat(27)}${item.tcCode}: ${
              item.tcName
            } | TESTCASE ${item.result.toUpperCase()} (total steps: ${
              item.totalSteps
            })`
          );
        }
      );

      if (exec_obj.getVerbose())
        logger.info(
          `REQUEST BODY: ${JSON.stringify(exec_obj.getStatusPayload())}`
        );

      if (exec_obj.getVerbose())
        logger.info(`RESPONSE BODY: ${JSON.stringify(status)}`);

      logger.info(
        `EXECUTION STATUS: Execution ${exec_obj.getExecStatus()} for Suite ID: SU-${exec_obj.getCustId()}${exec_obj.getSuiteId()} was terminated.`
      );

      logger.info(`${exec_fail_status_msg}`);
      task_obj.setResult(task_obj.TaskResult.Failed, ' Execution Failed!');
      resFlag = false;
    } else if (exec_obj.getThreshold() <= exec_obj.getFailPercent()) {
      logger.info(
        `EXECUTION STATUS: Execution ${exec_obj.getExecStatus()} for Suite ID: SU-${exec_obj.getCustId()}${exec_obj.getSuiteId()}`
      );
      logger.info(
        `${' '.repeat(
          27
        )}(Executed ${exec_obj.getExecutedTcs()} of ${exec_obj.getTotalTcs()} testcase(s), execution percentage: ${exec_obj
          .getExecPercent()
          .toFixed(2)} %, fail percentage: ${exec_obj
          .getFailPercent()
          .toFixed(2)} %, threshold: ${exec_obj
          .getThreshold()
          .toFixed(2)} % )\n`
      );
      results_array = status.data.data.result;

      results_array.forEach(
        (item: {
          tcCode: string;
          tcName: string;
          result: string;
          totalSteps: number;
        }) => {
          logger.info(
            `${' '.repeat(27)}${item.tcCode}: ${
              item.tcName
            } | TESTCASE ${item.result.toUpperCase()} (total steps: ${
              item.totalSteps
            })`
          );
        }
      );

      if (exec_obj.getVerbose()) {
        logger.info(
          `REQUEST BODY: ${JSON.stringify(exec_obj.getStatusPayload())}`
        );
      }

      if (exec_obj.getVerbose()) {
        logger.info(`RESPONSE BODY: ${JSON.stringify(status)}`);
      }

      logger.info(`${exec_fail_status_msg}`);
      task_obj.setResult(task_obj.TaskResult.Failed, ' Execution Failed!');
      resFlag = false;

      let kill_status: any = null;
      if (100.0 <= exec_obj.getFailPercent())
        kill_status = await exec_obj.killExec();

      if (kill_status === null) {
        logger.info(
          `EXECUTION STATUS: FAILED to explicitly kill the execution!`
        );
      } else {
        logger.info(
          `EXECUTION STATUS: SUCCESSFUL to explicitly kill the execution!`
        );
      }

      if (exec_obj.getVerbose()) {
        logger.info(
          `REQUEST BODY: ${JSON.stringify(exec_obj.getKillPayload())}`
        );
      }

      if (exec_obj.getVerbose()) {
        logger.info(`RESPONSE BODY: ${JSON.stringify(kill_status)}`);
      }
    } else {
      logger.info(
        `EXECUTION STATUS: Execution ${exec_obj.getExecStatus()} for Suite ID: SU-${exec_obj.getCustId()}${exec_obj.getSuiteId()}`
      );
      logger.info(
        `${' '.repeat(
          27
        )}(Executed ${exec_obj.getExecutedTcs()} of ${exec_obj.getTotalTcs()} testcase(s), execution percentage: ${exec_obj
          .getExecPercent()
          .toFixed(2)} %, fail percentage: ${exec_obj
          .getFailPercent()
          .toFixed(2)} %, threshold: ${exec_obj
          .getThreshold()
          .toFixed(2)} % )\n`
      );
      results_array = status.data.data.result;

      results_array.forEach(
        (item: {
          tcCode: string;
          tcName: string;
          result: string;
          totalSteps: number;
        }) => {
          logger.info(
            `${' '.repeat(27)}${item.tcCode}: ${
              item.tcName
            } | TESTCASE ${item.result.toUpperCase()} (total steps: ${
              item.totalSteps
            })`
          );
        }
      );
      if (exec_obj.getVerbose()) {
        logger.info(
          `REQUEST BODY: ${JSON.stringify(exec_obj.getStatusPayload())}`
        );
      }

      if (exec_obj.getVerbose()) {
        logger.info(`RESPONSE BODY: ${JSON.stringify(status)}`);
      }

      if (issues_flag) {
        logger.info(`${exec_pass_with_warn_status_msg}`);
        task_obj.setResult(
          task_obj.TaskResult.SucceededWithIssues,
          ' Execution Succeded with Issues!'
        );
      } else {
        if (exec_obj.getFailPercent() > 0.0) {
          logger.info(`${exec_pass_status_msg}`);
          task_obj.setResult(
            task_obj.TaskResult.Succeeded,
            ' Execution Succeded!'
          );
          resFlag = true;
        } else {
          logger.info(`${exec_fail_status_msg}`);
          task_obj.setResult(task_obj.TaskResult.Failed, ' Execution Failed!');
          resFlag = false;
        }
      }
    }

    logger.info(`REPORT URL: ${exec_obj.getReportUrl()}`);
    logger.info('*'.repeat(51) + 'EOF' + '*'.repeat(51) + '\n');

    if (resFlag) process.exit(0);
    else process.exit(1);
  } catch (err: any) {
    task_obj.setResult(task_obj.TaskResult.Failed, err.message);
    process.exit(1);
  }
}

run();
