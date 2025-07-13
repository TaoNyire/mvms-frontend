import axios from "axios";

const API_URL = "http://localhost:8000/api"; // Update this if your backend URL is different

const api = axios.create({
  baseURL: API_URL,
});

// Add request interceptor to automatically include Bearer token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

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

// ===== OPPORTUNITY MANAGEMENT =====
export const getOpportunities = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return api.get(`/opportunities${queryString ? `?${queryString}` : ""}`);
};

export const createOpportunity = (data) => api.post("/opportunities/add", data);

export const updateOpportunity = (opportunityId, data) =>
  api.put(`/opportunities/${opportunityId}`, data);

export const deleteOpportunity = (opportunityId) =>
  api.delete(`/opportunities/${opportunityId}`);

export const getOpportunity = (opportunityId) =>
  api.get(`/opportunities/${opportunityId}`);

// ===== TASK MANAGEMENT =====
export const getOpportunityTasks = (opportunityId) =>
  api.get(`/opportunities/${opportunityId}/tasks`);

export const createTask = (opportunityId, data) =>
  api.post(`/opportunities/${opportunityId}/tasks`, data);

export const updateTask = (taskId, data) =>
  api.put(`/tasks/${taskId}`, data);

export const completeTask = (taskId, data = {}) =>
  api.post(`/tasks/${taskId}/complete`, data);

export const assignVolunteersToTask = (taskId, applicationIds) =>
  api.post(`/tasks/${taskId}/assign-volunteers`, { application_ids: applicationIds });

export const reassignVolunteers = (taskId, data) =>
  api.post(`/tasks/${taskId}/reassign-volunteers`, data);

// ===== APPLICATION MANAGEMENT =====
export const getApplications = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return api.get(`/applications${queryString ? `?${queryString}` : ""}`);
};

export const respondToApplication = (applicationId, status) =>
  api.put(`/applications/${applicationId}/respond`, { status });

export const getApplication = (applicationId) =>
  api.get(`/applications/${applicationId}`);

export const applyToOpportunity = (opportunityId) =>
  api.post(`/opportunities/${opportunityId}/apply`);

export const confirmApplication = (applicationId, confirmationStatus) =>
  api.post(`/applications/${applicationId}/confirm`, { confirmation_status: confirmationStatus });

// ===== ORGANIZATION DASHBOARD =====
export const getOrganizationDashboard = () =>
  api.get("/organization/dashboard");

export const getCurrentVolunteers = () =>
  api.get("/current-volunteers");

export const getRecentVolunteers = (days = 30) =>
  api.get(`/recent-volunteers?days=${days}`);

export const getCurrentVolunteersDetailed = () =>
  api.get("/organization/current-volunteers-detailed");

export const getRecentlyEmployedVolunteers = (days = 30) =>
  api.get(`/organization/recent-volunteers?days=${days}`);

// New API functions for enhanced volunteer management
export const getOrganizationVolunteersList = (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.per_page) queryParams.append('per_page', params.per_page);
  if (params.search) queryParams.append('search', params.search);
  if (params.status) queryParams.append('status', params.status);

  const queryString = queryParams.toString();
  return api.get(`/organization/volunteers-list${queryString ? `?${queryString}` : ''}`);
};

export const getVolunteerProfile = (volunteerId) =>
  api.get(`/organization/volunteers/${volunteerId}/profile`);

export const getVolunteersWithTasks = (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.per_page) queryParams.append('per_page', params.per_page);
  if (params.search) queryParams.append('search', params.search);
  if (params.task_status) queryParams.append('task_status', params.task_status);
  if (params.opportunity_id) queryParams.append('opportunity_id', params.opportunity_id);

  const queryString = queryParams.toString();
  return api.get(`/tasks/volunteers-with-tasks${queryString ? `?${queryString}` : ''}`);
};

export const getVolunteerTaskDetails = (applicationId) =>
  api.get(`/tasks/volunteer-details/${applicationId}`);

export const getOrganizationApplications = () =>
  api.get("/organization/applications");

// ===== VOLUNTEER TASK MANAGEMENT =====
export const getMyTasks = () =>
  api.get("/my-tasks");

export const startTask = (applicationId) =>
  api.post(`/tasks/${applicationId}/start`);

export const completeVolunteerTask = (applicationId, data) =>
  api.post(`/tasks/${applicationId}/complete`, data);

export const quitTask = (applicationId, data) =>
  api.post(`/tasks/${applicationId}/quit`, data);

export const updateTaskProgress = (applicationId, data) =>
  api.put(`/tasks/${applicationId}/progress`, data);

// ===== ORGANIZATION SKILLS MANAGEMENT =====
export const getOrganizationSkills = () =>
  api.get("/organization/skills");

export const getOrganizationSpecificSkills = () =>
  api.get("/organization/skills/organization-specific");

export const createOrganizationSkill = (data) =>
  api.post("/organization/skills", data);

export const updateOrganizationSkill = (skillId, data) =>
  api.put(`/organization/skills/${skillId}`, data);

export const deleteOrganizationSkill = (skillId) =>
  api.delete(`/organization/skills/${skillId}`);

export const toggleOrganizationSkillStatus = (skillId) =>
  api.patch(`/organization/skills/${skillId}/toggle-status`);

export const getSkillCategories = () =>
  api.get("/organization/skills/categories");

export const getSkillProficiencyLevels = () =>
  api.get("/organization/skills/proficiency-levels");

// Reports functionality completely removed

// Enhanced dashboard data is now part of the regular dashboard endpoints