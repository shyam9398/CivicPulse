import API from "./api";

export const authService = {
  register: async (name, email, phoneNumber, password, confirmPassword) => {
    const response = await API.post("/auth/register", {
      name,
      email,
      phoneNumber,
      password,
      confirmPassword,
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await API.post("/auth/login", {
      email,
      password,
    });
    return response.data;
  },
};

export default authService;