import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api", // change if your backend URL is different
});

export default apiClient;