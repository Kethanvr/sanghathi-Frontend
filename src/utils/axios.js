import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Axios Error Details:", {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
    });

    const message =
      error.response?.data?.message || "An error occurred. Please try again.";

    return Promise.reject(new Error(message));
  }
);

export default api;
