import axios, { type AxiosInstance } from "axios";

const baseURL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  "http://localhost:7777";

export const TOKEN_KEY = "amorette_token";

export const api: AxiosInstance = axios.create({
  baseURL,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      // Attempt refresh once
      try {
        const r = await axios.post(`${baseURL}/api/auth/refresh`, {}, { withCredentials: true });
        const newToken = r.data?.accessToken || r.data?.token;
        if (newToken) {
          localStorage.setItem(TOKEN_KEY, newToken);
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return api.request(error.config);
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    return Promise.reject(error);
  },
);

export const apiBaseUrl = baseURL;