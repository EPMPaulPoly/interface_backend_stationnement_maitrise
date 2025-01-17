export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }
  
  export interface ApiError {
    success: false;
    error: string;
    details?: any;
  }