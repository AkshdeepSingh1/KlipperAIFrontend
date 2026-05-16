import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { getCookie, setCookie } from "@/lib/cookies";

// --- Helper to safely set Authorization header ---
function setAuthHeader(headers: any, token: string) {
  if ("set" in headers && typeof headers.set === "function") {
    headers.set("Authorization", `Bearer ${token}`);
  } else {
    headers["Authorization"] = `Bearer ${token}`;
  }
}

// --- Axios instance ---
const axiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Request interceptor: attach token ---
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // We rely on HTTP-only cookies (auth_token) set by the backend.
    // The browser automatically attaches them to requests since withCredentials is true.
    return config;
  },
  (error) => Promise.reject(error),
);

// --- Token refresh handling ---
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve("done");
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => {
              resolve(axiosInstance(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        // We don't need to manually read or pass the refresh_token.
        // Since withCredentials is true, the browser sends the refresh_token and device_id cookies automatically.
        await axios.post(
          "/api/auth/refresh",
          {},
          { withCredentials: true },
        );

        processQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        console.error("Token refresh failed, logging out...");
        // Clear local user data as session is truly dead
        localStorage.removeItem("KlipperAI_user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
