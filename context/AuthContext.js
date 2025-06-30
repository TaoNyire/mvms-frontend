import React, { createContext, useContext, useState, useEffect } from "react";
import { register as apiRegister, login as apiLogin, getMe, logout as apiLogout } from "../lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    typeof window !== "undefined" ? localStorage.getItem("token") : null
  );
  const [loading, setLoading] = useState(true);

  // Automatically fetch user if token exists
  useEffect(() => {
    if (token) {
      getMe(token)
        .then((res) => {
          setUser(res.data);
          setLoading(false);
        })
        .catch(() => {
          setToken(null);
          setUser(null);
          localStorage.removeItem("token");
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  // Register
  const register = async (data) => {
    const res = await apiRegister(data);
    setToken(res.data.access_token);
    localStorage.setItem("token", res.data.access_token);
    setUser(res.data.user);
  };

  // Login
 const login = async (email, password) => {
  const res = await apiLogin({ email, password });
  setToken(res.data.access_token);
  localStorage.setItem("token", res.data.access_token);
  setUser(res.data.user);
  return res.data; // ✅ THIS LINE FIXES IT
};

  // Logout
  const logout = async () => {
    if (token) await apiLogout(token);
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}