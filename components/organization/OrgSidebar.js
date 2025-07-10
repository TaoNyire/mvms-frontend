import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import { Briefcase, LayoutDashboard, MessageSquare, ClipboardList, Settings, Users, Star, ChartBar } from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, path: "/organization/dashboard" },
  { name: "Opportunities", icon: <Briefcase className="w-5 h-5" />, path: "/organization/opportunities" },
  { name: "Tasks", icon: <ClipboardList className="w-5 h-5" />, path: "/organization/tasks" },
  { name: "Volunteers", icon: <Users className="w-5 h-5" />, path: "/organization/volunteers" },
  { name: "Messages", icon: <MessageSquare className="w-5 h-5" />, path: "/organization/messages" },
  { name: "Feedback", icon: <Star className="w-5 h-5" />, path: "/organization/feedback" },
  { name: "Reports", icon: <ChartBar className="w-5 h-5" />, path: "/organization/reports" },
  { name: "Profile", icon: <Settings className="w-5 h-5" />, path: "/organization/profile" },
];

export default function OrgSidebar() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 shadow-xl border-r border-blue-700 flex flex-col justify-between">
      <div>
        <div className="px-6 py-6 border-b border-blue-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Organization</h2>
              <div className="text-xs text-blue-300">Management Panel</div>
            </div>
          </div>
          <div className="text-sm text-blue-200 truncate">{user?.email}</div>
        </div>
        <nav className="mt-6 flex flex-col gap-1 px-3">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.path}
              href={item.path}
              icon={item.icon}
              label={item.name}
              active={router.pathname === item.path}
            />
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-blue-700">
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
            ? "bg-blue-600 text-white font-semibold shadow-lg border-l-4 border-blue-300"
            : "text-blue-200 hover:bg-blue-700 hover:text-white"
        }`}
      >
        <span className="mr-3">{icon}</span>
        <span className="font-medium">{label}</span>
      </a>
    </Link>
  );
}