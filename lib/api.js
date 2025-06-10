import axios from "axios";

const API_URL = "http://localhost:8000/api"; // Update this if your backend URL is different

const api = axios.create({
  baseURL: API_URL,
});

// Registration
export const register = async (data) => api.post("/register", data);

// Login
export const login = async (data) => api.post("/login", data);

// Get current user
export const getMe = async (token) =>
  api.get("/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Logout
export const logout = async (token) =>
  api.post(
    "/logout",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );