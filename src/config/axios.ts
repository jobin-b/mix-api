import axios from "axios";
const axiosInstance = axios.create({
  baseURL: "https://accounts.spotify.com/",
  timeout: 5000,
}); // 5 seconds

export const addToken = async (token: string) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      // If the token exists in localStorage, add it to the request headers
      config.headers["Authorization"] = `Bearer ${token}`;

      return config;
    },
    (error) => {
      // Handle request error here
      return Promise.reject(error);
    }
  );
};

export default axiosInstance;
