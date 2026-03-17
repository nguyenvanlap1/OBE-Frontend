import api from "./api";

const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post("/login", { username, password });
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/logout");
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/me");
    return response.data;
  },
};

export default authService;
