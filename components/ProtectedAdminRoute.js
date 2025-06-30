// components/ProtectedAdminRoute.js
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function ProtectedAdminRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 🔁 Always call useEffect at top level
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Show loading while auth resolves
  if (loading || !user) {
    return <div>Loading...</div>;
  }

  // If user is admin → render protected content
  if (user.role === "admin") {
    return children;
  }

  // Else return null (redirect handled by useEffect)
  return null;
}