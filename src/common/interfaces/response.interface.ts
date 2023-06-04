export interface ResponseOut<T> {
  statusCode: number;
  status: string;
  message: string;
  data?: T;
  additionalInfo?: Record<string, any>;
}
