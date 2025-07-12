import React, { createContext, useContext, useState, useEffect } from "react";
import { register as apiRegister, login as apiLogin, getMe, logout as apiLogout } from "../lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    typeof window !== "undefined" ? localStorage.getItem("token") : null
  );
  const [loading, setLoading] = useState(true);
  const [authVerified, setAuthVerified] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [profileRequirements, setProfileRequirements] = useState(null);

  // Automatically fetch user if token exists
  useEffect(() => {
    const verifyAuth = async () => {
      if (token) {
        try {
          console.log("Verifying token:", token.substring(0, 20) + "...");
          const res = await getMe(token);
          console.log("Auth verification successful:", res.data);
          setUser(res.data);
          setAuthVerified(true);
        } catch (err) {
          console.error("Auth verification failed:", err);
          console.error("Error status:", err.response?.status);
          console.error("Error details:", err.response?.data || err.message);

          // Clear invalid token
          console.log("Clearing invalid token from localStorage");
          setToken(null);
          setUser(null);
          localStorage.removeItem("token");
          setAuthVerified(false);
        }
      } else {
        console.log("No token found in localStorage");
      }
      setLoading(false);
    };

    verifyAuth();
  }, [token]);

  // Register
  const register = async (data) => {
    const res = await apiRegister(data);
    setToken(res.data.access_token);
    localStorage.setItem("token", res.data.access_token);
    setUser(res.data.user);
    setAuthVerified(true);
    return res.data;
  };

  // Login
  const login = async (email, password) => {
    const res = await apiLogin({ email, password });
    setToken(res.data.access_token);
    localStorage.setItem("token", res.data.access_token);
    setUser(res.data.user);
    setAuthVerified(true);
    return res.data;
  };

  // Logout
  const logout = async () => {
    if (token) {
      try {
        await apiLogout(token);
        console.log("Successfully logged out from server");
      } catch (err) {
        console.error("Logout error:", err);
        // Continue with local logout even if server logout fails
      }
    }
    // Clear local state
    setUser(null);
    setToken(null);
    setAuthVerified(false);
    localStorage.removeItem("token");
    console.log("Local logout completed");
  };

  // Helper function to handle 403 errors
  const handle403Error = (error, requiredRole = null) => {
    if (error.response?.status === 403) {
      const message = requiredRole
        ? `Access denied. You need the '${requiredRole}' role to access this feature.`
        : 'Access denied. You do not have permission to access this feature.';

      console.warn('403 Forbidden:', message);
      return {
        isPermissionError: true,
        message,
        suggestedAction: requiredRole ? `Please contact an administrator to assign you the '${requiredRole}' role.` : 'Please contact an administrator for access.'
      };
    }
    return { isPermissionError: false };
  };

  // Check profile completion
  const checkProfileCompletion = async () => {
    if (!token || !user) return true;

    try {
      // Try to access a protected endpoint based on user role
      const endpoint = user.role === 'volunteer' ? '/volunteer/dashboard' : '/organization/dashboard';
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.status === 422) {
        const data = await response.json();
        if (data.error === 'PROFILE_INCOMPLETE') {
          setProfileComplete(false);
          setProfileRequirements(data.requirements);
          return false;
        }
      }

      if (response.ok) {
        setProfileComplete(true);
        setProfileRequirements(null);
        return true;
      }

      // For other errors, assume profile is complete to avoid blocking
      setProfileComplete(true);
      setProfileRequirements(null);
      return true;
    } catch (error) {
      console.error('Error checking profile completion:', error);
      // Assume complete on error to avoid blocking
      setProfileComplete(true);
      setProfileRequirements(null);
      return true;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authVerified,
        profileComplete,
        profileRequirements,
        login,
        logout,
        register,
        setAuthVerified,
        handle403Error,
        checkProfileCompletion
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}