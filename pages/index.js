import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Welcome to the Next.js + Laravel Auth Example!</h1>
      {user ? (
        <p>
          Logged in as {user.name} — <Link href="/dashboard">Dashboard</Link>
        </p>
      ) : (
        <p>
          <Link href="/login">Login</Link> or <Link href="/register">Register</Link>
        </p>
      )}
    </div>
  );
}