import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading]);

  if (loading || !user) return <div>Loading...</div>;

  return (
    <div>
      <h2>Welcome, {user.name}!</h2>
      <div><b>Email:</b> {user.email}</div>
      <div><b>Roles:</b> {user.roles && user.roles.join(", ")}</div>
      <button onClick={logout}>Logout</button>
    </div>
  );
}