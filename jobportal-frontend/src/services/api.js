import axios from "axios";

// Default to local backend during development, or use VITE_API_URL environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

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

// Auto-logout on 403 Forbidden (role mismatch / unauthorized access)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("name");
      localStorage.removeItem("email");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      window.location.reload();
    }
    return Promise.reject(error);
  }
);


// Helper function to extract friendly error message from Axios errors
export const getErrorMessage = (error, defaultMsg = "An error occurred") => {
  if (error?.response) {
    if (typeof error.response.data === "string" && error.response.data.trim()) {
      return error.response.data;
    }
    if (error.response.data?.message) {
      return error.response.data.message;
    }
    if (error.response.data?.error) {
      return error.response.data.error;
    }
    return `Server returned error (${error.response.status})`;
  }
  if (error?.code === "ECONNABORTED" || error?.message?.includes("timeout")) {
    return "Request timed out. Please ensure the backend server is reachable.";
  }
  if (error?.message === "Network Error") {
    return `Cannot connect to backend (${API_BASE_URL}). Please ensure the Spring Boot server is running on port 8080.`;
  }
  return error?.message || defaultMsg;
};

export default api;