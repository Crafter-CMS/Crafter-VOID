import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { toast } from "sonner";
import { BACKEND_URL } from "../constants/base";
import { ErrorMessages, ErrorType } from "../constants/errors";
import {
  ApiResponse,
  CustomError,
  ErrorResponse,
  RefreshTokenResponse,
  ValidationError,
} from "../types/ApiClass";

// Server-compatible token storage interface
interface TokenStorage {
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  setAccessToken(token: string): void;
  setRefreshToken(token: string): void;

  getWebsiteId(): string | null;
  removeTokens(): void;
}

// Default token storage for server-side (no-op)
class ServerTokenStorage implements TokenStorage {
  getAccessToken(): string | null {
    return null;
  }
  getRefreshToken(): string | null {
    return null;
  }

  getWebsiteId(): string | null {
    return null;
  }

  setAccessToken(token: string): void {}
  setRefreshToken(token: string): void {}
  removeTokens(): void {}
}

// Client-side token storage using localStorage
class ClientTokenStorage implements TokenStorage {
  getAccessToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
    return null;
  }

  getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("refreshToken");
    }
    return null;
  }

  getWebsiteId(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("websiteId") || null;
    }

    return null;
  }

  setAccessToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", token);
    }
  }

  setRefreshToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("refreshToken", token);
    }
  }

  removeTokens(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }
}

export class ApiClient {
  private api: AxiosInstance;
  private tokenStorage: TokenStorage;
  private isRefreshing = false;
  private refreshTokenQueue: (() => void)[] = [];
  private websiteId: string | null = null;
  private version: "v1" | "v2";
  private skipWebsiteId: boolean = false; // New flag for payment endpoints

  constructor(options?: {
    headers?: Record<string, string>;
    version?: "v1" | "v2";
    websiteId?: string; // Server-side için websiteId parametresi
    skipWebsiteId?: boolean; // Skip websiteId in baseUrl for payment endpoints
  }) {
    const {
      headers = { "Content-Type": "application/json" },
      version = "v1",
      websiteId,
      skipWebsiteId = false,
    } = options || {};

    this.tokenStorage =
      typeof window !== "undefined"
        ? new ClientTokenStorage()
        : new ServerTokenStorage();
    this.websiteId = websiteId || this.tokenStorage.getWebsiteId();
    this.version = version;
    this.skipWebsiteId = skipWebsiteId;

    // Auto-generate baseUrl based on version and websiteId
    let finalBaseUrl: string;

    if (skipWebsiteId) {
      // For payment endpoints - use direct backend URL
      finalBaseUrl = BACKEND_URL;
    } else if (this.websiteId) {
      if (version === "v2") {
        finalBaseUrl = `${BACKEND_URL}/website/v2/${this.websiteId}`;
      } else {
        finalBaseUrl = `${BACKEND_URL}/website/${this.websiteId}`;
      }
    } else {
      // Fallback to base URL if no websiteId
      finalBaseUrl = BACKEND_URL;
    }

    this.api = axios.create({
      baseURL: finalBaseUrl,
      headers: headers,
    });

    this.setupInterceptors();
  }

  // Public methods for token management
  public setAccessToken(token: string): void {
    this.tokenStorage.setAccessToken(token);
  }

  public setRefreshToken(token: string): void {
    this.tokenStorage.setRefreshToken(token);
  }

  public removeTokens(): void {
    this.tokenStorage.removeTokens();
  }

  public getAccessToken(): string | null {
    return this.tokenStorage.getAccessToken();
  }

  public getRefreshToken(): string | null {
    return this.tokenStorage.getRefreshToken();
  }

  public getWebsiteId(): string | null {
    return this.websiteId || this.tokenStorage.getWebsiteId();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = this.tokenStorage.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ErrorResponse>) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.refreshTokenQueue.push(() => {
                originalRequest.headers = {
                  ...originalRequest.headers,
                  Authorization: `Bearer ${this.tokenStorage.getAccessToken()}`,
                };
                resolve(this.api(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const success = await this.refreshToken();
            if (success) {
              this.processQueue();
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            this.processQueue(refreshError as AxiosError);
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: AxiosError | null = null): void {
    this.refreshTokenQueue.forEach((prom) => {
      if (error) {
        prom();
      } else {
        prom();
      }
    });
    this.refreshTokenQueue = [];
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = this.tokenStorage.getRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await axios.post<RefreshTokenResponse>(
        `${BACKEND_URL}v2/${this.websiteId}/auth/refresh-token`,
        { refresh_token: refreshToken }
      );

      this.tokenStorage.setAccessToken(response.data.accessToken);
      this.tokenStorage.setRefreshToken(response.data.refreshToken);
      return true;
    } catch (error) {
      this.tokenStorage.removeTokens();
      return false;
    }
  }

  private handleError(error: AxiosError<ErrorResponse>): never {
    const response = error.response?.data;

    if (!response) {
      throw {
        message: "An error occurred",
        status: error.response?.status || 500,
      };
    }

    // Handle email update requirement
    if (
      typeof window !== "undefined" &&
      response &&
      "requiresEmailUpdate" in response &&
      (response as any).requiresEmailUpdate === true
    ) {
      toast.warning("E-posta Güncelleme Gerekli", {
        description:
          "Devam etmek için lütfen e-posta adresinizi güncelleyiniz.",
        duration: 5000,
      });
      
      // Delay redirect to allow toast to be visible
      setTimeout(() => {
        window.location.href = "/profile/settings";
      }, 1000);
      
      // Throw error to stop execution
      throw {
        message: "Email update required",
        status: 400,
        requiresEmailUpdate: true,
      };
    }

    // Handle validation errors
    if (error.response?.status === 400 && Array.isArray(response.message)) {
      const validationError = response as ValidationError;
      throw {
        message: validationError.message,
        status: validationError.statusCode,
      };
    }

    // Handle custom error types
    if (
      "type" in response &&
      response.type &&
      Object.values(ErrorType).includes(response.type as ErrorType)
    ) {
      const customError = response as CustomError;
      throw {
        message:
          ErrorMessages[response.type as keyof typeof ErrorMessages] ||
          customError.message,
        status: error.response?.status || 500,
        type: response.type,
      };
    }

    // Handle other errors
    throw {
      message: response.message || "An error occurred",
      status: error.response?.status || 500,
    };
  }

  async request<T>(
    config: AxiosRequestConfig,
    authorize = true
  ): Promise<ApiResponse<T>> {
    try {
      // Always add x-website-id header
      config.headers = {
        ...config.headers,
        "x-website-id": this.websiteId,
      };

      if (authorize) {
        const token = this.tokenStorage.getAccessToken();
        if (token) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          };
        }
      }

      const response: AxiosResponse<T> = await this.api(config);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      this.handleError(error as AxiosError<ErrorResponse>);
      throw error;
    }
  }

  get<T>(url: string, config?: AxiosRequestConfig, authorize = true) {
    return this.request<T>({ ...config, method: "GET", url }, authorize);
  }

  post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    authorize = true
  ) {
    return this.request<T>({ ...config, method: "POST", url, data }, authorize);
  }

  put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    authorize = true
  ) {
    return this.request<T>({ ...config, method: "PUT", url, data }, authorize);
  }

  delete<T>(url: string, config?: AxiosRequestConfig, authorize = true) {
    return this.request<T>({ ...config, method: "DELETE", url }, authorize);
  }
}

// Create a default instance
export const apiClient = new ApiClient();

// For backward compatibility, export a hook-like function that returns the API client
export const useApi = (options?: {
  version?: "v1" | "v2";
  headers?: Record<string, string>;
  skipWebsiteId?: boolean; // New option for payment endpoints
}) => {
  const { skipWebsiteId = false, ...apiOptions } = options || {};

  if (skipWebsiteId) {
    // For payment endpoints - use direct backend URL without websiteId
    return new ApiClient({
      version: apiOptions.version || "v1",
      headers: apiOptions.headers,
      skipWebsiteId: true, // Set flag to skip websiteId
    });
  }

  return new ApiClient({
    version: apiOptions.version || "v1",
    headers: apiOptions.headers,
  });
};

// Helper functions to create API clients with specific versions
export const createApiClient = (
  version: "v1" | "v2" = "v1",
  headers?: Record<string, string>
) => {
  return new ApiClient({ version, headers });
};

// Server-side helper that accepts websiteId
export const createServerApiClient = (
  websiteId: string,
  version: "v1" | "v2" = "v1",
  headers?: Record<string, string>
) => {
  return new ApiClient({ version, headers, websiteId });
};

// Server-side useApi helper
export const useServerApi = (
  websiteId: string,
  options?: {
    version?: "v1" | "v2";
    headers?: Record<string, string>;
  }
) => {
  return new ApiClient({
    version: options?.version || "v1",
    headers: options?.headers,
    websiteId,
  });
};

// Export the class for direct usage in server components
