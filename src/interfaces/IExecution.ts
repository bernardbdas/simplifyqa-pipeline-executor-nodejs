type startExecData = {
  token: string;
};

type getExecStatusData = {
  executionId: number;
  customerId: number;
  projectId: number;
};

type killExecData = {
  customerId: number;
  id: number;
  userId: number;
  userName: string;
};

type ExecutionData = {
  token: string;
  appurl?: string;
  threshold?: number;
  verbose?: boolean;
};

type HttpResponse = {
  statusCode: number;
  body: any;
};

export type {
  startExecData,
  getExecStatusData,
  killExecData,
  ExecutionData,
  HttpResponse
};
