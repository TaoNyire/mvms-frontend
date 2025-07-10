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

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authVerified,
        login,
        logout,
        register,
        setAuthVerified
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