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
  // Fetch volunteer profile
export const getProfile = (token) =>
  api.get("/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });

// Create or update volunteer profile
export const saveProfile = (data, token) =>
  api.post("/profile", data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  // fetch organization profile
export const getOrgProfile = (token) =>
  api.get("/organization/profile", { headers: { Authorization: `Bearer ${token}` } });

// save organization profile
export const saveOrgProfile = (data, token) =>
  api.post("/organization/profile", data, { headers: { Authorization: `Bearer ${token}` } });

// Admin APIs
export const getAdminDashboardStats = (token) =>
  api.get("/admin/dashboard", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAdminRecentUsers = (token, limit = 5) =>
  api.get(`/admin/users?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAdminRecentOpportunities = (token, limit = 5) =>
  api.get(`/admin/opportunities?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAllAdminUsers = (token) =>
  api.get("/admin/users", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateAdminUser = (userId, data, token) =>
  api.put(`/admin/users/${userId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteAdminUser = (userId, token) =>
  api.delete(`/admin/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAllAdminOpportunities = (token) =>
  api.get("/admin/opportunities", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateAdminOpportunity = (opportunityId, data, token) =>
  api.put(`/admin/opportunities/${opportunityId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteAdminOpportunity = (opportunityId, token) =>
  api.delete(`/admin/opportunities/${opportunityId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Skills Management
export const getAllSkills = (token) =>
  api.get("/skills", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const addSkill = (data, token) =>
  api.post("/skills/addskill", data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateSkill = (skillId, data, token) =>
  api.put(`/skills/updateskill/${skillId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteSkill = (skillId, token) =>
  api.delete(`/skills/deleteskill/${skillId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });