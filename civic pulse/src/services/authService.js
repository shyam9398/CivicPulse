import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api/auth",
  headers: {
    "Content-Type": "application/json",
  },
});

export const authService = {
  setToken: (token) => {
    if (token) {
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete API.defaults.headers.common["Authorization"];
    }
  },

  register: async (name, email, phoneNumber, password, confirmPassword) => {
    const response = await API.post("/register", {
      name,
      email,
      phoneNumber,
      password,
      confirmPassword,
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await API.post("/login", {
      email,
      password,
    });
    return response.data;
  },
};

export default authService;