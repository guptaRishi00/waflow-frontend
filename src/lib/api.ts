import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 403 &&
      error.response.data?.message === "Session expired or invalid token"
    ) {
      // Remove token from storage if present
      localStorage.removeItem("token");
      // Redirect to login page
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export default api;
