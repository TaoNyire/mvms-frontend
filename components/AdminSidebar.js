// components/admin/Sidebar.js
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || !user.roles?.some(role => role.name === "admin")) {
      router.push("/login");
    }
  }, [user]);

  return (
    <aside className="w-64 min-h-screen bg-white shadow-md p-4 border-r border-blue-200">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">Admin</h2>
      <nav className="space-y-3 text-blue-900">
        <Link href="/admin/dashboard" className="block hover:text-blue-600">
          Dashboard
        </Link>
        <Link href="/admin/skills" className="block hover:text-blue-600">
          Skills
        </Link>
        <Link href="/admin/reports" className="block hover:text-blue-600">
          Reports
        </Link>
        <button
          onClick={logout}
          className="mt-6 text-red-600 hover:text-red-800 w-full text-left"
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}
