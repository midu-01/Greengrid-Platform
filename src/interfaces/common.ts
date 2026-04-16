export interface ApiMeta {
  [key: string]: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: ApiMeta;
}
