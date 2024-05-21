import axios, {
  Axios,
  AxiosError,
  AxiosHeaders,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import type {
  startExecData,
  getExecStatusData,
  killExecData,
  HttpResponse,
} from "@interfaces/IExecution.js";
import { logger } from "@utils/logger.js";

class ConnHandler {
  public CONNECTION_TIMEOUT: number = 300000; // 5 minutes

  async makeHttpGetRequest(
    url: string,
    headers?: Record<string, string>
  ): Promise<HttpResponse> {
    try {
      const response: AxiosResponse = await axios.get(url, {
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        timeout: this.CONNECTION_TIMEOUT,
      });

      return {
        statusCode: response.status,
        body: response.data,
      };
    } catch (error: any) {
      throw new Error(`HTTP GET request failed: ${error.message}`);
    }
  }

  async makeHttpPostRequest(
    url: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<HttpResponse> {
    try {
      const response: AxiosResponse = await axios.post(url, body, {
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        timeout: this.CONNECTION_TIMEOUT,
      });

      return {
        statusCode: response.status,
        body: response.data,
      };
    } catch (error: any) {
      throw new Error(`HTTP POST request failed: ${error.message}`);
    }
  }

  public async makePostRequest({
    url,
    data,
    headers,
  }: {
    url: string;
    data: startExecData | getExecStatusData | killExecData;
    headers: AxiosHeaders;
  }): Promise<AxiosResponse | AxiosError | Error> {
    try {
      const response = await axios.post(url, data, {
        timeout: 5 * 60 * 1000,
        headers,
      });
      return response;
    } catch (error: any) {
      return error;
    }
  }
}

export { ConnHandler };
