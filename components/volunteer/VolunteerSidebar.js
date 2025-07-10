import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  HomeIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  BellIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  Bars3Icon,
  XMarkIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";

// Sidebar links for volunteers, matching UNV style and including a dashboard link
const sidebarLinks = [
  {
    href: "/volunteer/dashboard",
    label: "Dashboard",
    icon: <HomeIcon className="w-6 h-6" />,
  },
  {
    href: "/volunteer/opportunities",
    label: "Opportunities",
    icon: <BriefcaseIcon className="w-6 h-6" />,
  },
  {
    href: "/volunteer/applications",
    label: "Applications",
    icon: <DocumentTextIcon className="w-6 h-6" />,
  },
  {
    href: "/volunteer/skills",
    label: "My Skills",
    icon: <AcademicCapIcon className="w-6 h-6" />,
  },
  {
    href: "/volunteer/messages",
    label: "Messages",
    icon: <ChatBubbleLeftRightIcon className="w-6 h-6" />,
  },
  {
    href: "/volunteer/feedback",
    label: "Feedback",
    icon: <StarIcon className="w-6 h-6" />,
  },
  {
    href: "/volunteer/notifications",
    label: "Notifications",
    icon: <BellIcon className="w-6 h-6" />,
  },
  {
    href: "/volunteer/profile",
    label: "Profile",
    icon: <UserCircleIcon className="w-6 h-6" />,
  },
];

export default function VolunteerSidebar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <Bars3Icon className="w-6 h-6" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 shadow-xl border-r border-blue-700 transform transition-transform duration-300 ease-in-out md:transform-none md:translate-x-0 flex flex-col justify-between ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex-1">
          <div className="px-6 py-6 border-b border-blue-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Volunteer Panel</h2>
                <div className="text-xs text-blue-300">Community Service</div>
              </div>
            </div>
            <div className="text-sm text-blue-200 truncate">{user?.email}</div>
          </div>
          <nav className="mt-6 flex flex-col gap-1 px-3">
            {sidebarLinks.map((link) => (
              <SidebarItem
                key={link.href}
                href={link.href}
                icon={link.icon}
                label={link.label}
                active={router.pathname === link.href}
                onClick={closeSidebar}
              />
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-blue-700">
          <button
            onClick={logout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 mb-3"
          >
            <span>🚪</span>
            Logout
          </button>
          <div className="text-xs text-blue-300 text-center">
            MVMS v1.0
          </div>
        </div>
      </aside>
    </>
  );
}

function SidebarItem({ href, icon, label, active, onClick }) {
  return (
    <Link href={href} legacyBehavior>
      <a
        onClick={onClick}
        className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${
          active
            ? "bg-blue-600 text-white font-semibold shadow-lg border-l-4 border-blue-300"
            : "text-blue-200 hover:bg-blue-700 hover:text-white"
        }`}
      >
        <span className="mr-3 flex-shrink-0">{icon}</span>
        <span className="truncate font-medium">{label}</span>
      </a>
    </Link>
  );
}
