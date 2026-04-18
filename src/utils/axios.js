import axios from "axios";

import logger from "./logger.js";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 && typeof window !== "undefined") {
      const currentPath = `${window.location.pathname}${window.location.search}`;
      const isAuthPage =
        window.location.pathname.startsWith("/login") ||
        window.location.pathname.startsWith("/forgot-password") ||
        window.location.pathname.startsWith("/reset-password");

      if (!isAuthPage) {
        sessionStorage.setItem("postLoginRedirectPath", currentPath);
        window.location.assign(
          `/login?redirect=${encodeURIComponent(currentPath)}`
        );
      }
    }

    if (import.meta.env.DEV) {
      logger.error("Axios Error Details:", {
        status,
        data: error.response?.data,
        headers: error.response?.headers,
      });
    }

    const message =
      error.response?.data?.message || "An error occurred. Please try again.";

    error.message = message;
    return Promise.reject(error);
  }
);

export default api;
