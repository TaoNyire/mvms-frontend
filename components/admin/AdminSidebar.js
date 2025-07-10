import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";

const sidebarLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/admin/users", label: "User Management", icon: "👥" },
  { href: "/admin/organizations", label: "Organizations", icon: "🏢" },
  { href: "/admin/opportunities", label: "Opportunities", icon: "🎯" },
  { href: "/admin/applications", label: "Applications", icon: "📋" },
  { href: "/admin/security", label: "Security & Roles", icon: "🔒" },
  { href: "/admin/logs", label: "System Logs", icon: "📊" },
  { href: "/admin/maintenance", label: "Maintenance", icon: "🛠️" },
];

export default function AdminSidebar() {
  const router = useRouter();
  const { logout, user } = useAuth();

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-indigo-900 to-indigo-800 shadow-xl border-r border-indigo-700 flex flex-col justify-between">
      <div>
        <div className="px-6 py-6 border-b border-indigo-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Admin Panel</h2>
              <div className="text-xs text-indigo-300">System Administration</div>
            </div>
          </div>
          <div className="text-sm text-indigo-200 truncate">{user?.email}</div>
        </div>
        <nav className="mt-6 flex flex-col gap-1 px-3">
          {sidebarLinks.map((link) => (
            <SidebarItem
              key={link.href}
              href={link.href}
              icon={link.icon}
              label={link.label}
              active={router.pathname === link.href}
            />
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-indigo-700">
        <button
          onClick={logout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <span>🚪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}

function SidebarItem({ href, icon, label, active }) {
  return (
    <Link href={href} legacyBehavior>
      <a
        className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${
          active
            ? "bg-indigo-600 text-white font-semibold shadow-lg border-l-4 border-indigo-300"
            : "text-indigo-200 hover:bg-indigo-700 hover:text-white"
        }`}
      >
        <span className="mr-3 text-lg">{icon}</span>
        <span className="font-medium">{label}</span>
      </a>
    </Link>
  );
}