import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import { BellIcon, UserCircleIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

export default function OrganizationHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications] = useState([
    { id: 1, message: "New volunteer application received", time: "2 hours ago" },
  ]);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/login");
    }
  };

  const handleProfileClick = () => {
    setDropdownOpen(false);
    router.push("/organization/profile");
  };

  return (
    <header className="flex items-center justify-between mb-8 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg border border-blue-500">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">🏢</span>
        </div>
        <div>
          <h1 className="text-white font-bold text-2xl tracking-tight select-none">
            Organization Panel
          </h1>
          <p className="text-blue-200 text-sm mt-1">
            Manage your volunteer opportunities and applications
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors">
          <BellIcon className="w-6 h-6" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {notifications.length}
            </span>
          )}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-200"
          >
            <UserCircleIcon className="w-8 h-8  text-gray-700" />
            <span className="text-sm font-medium  text-gray-700 drop-shadow-sm">
              {user?.name || "Organization"}
            </span>
            <ChevronDownIcon className="w-4 h-4  text-gray-700" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-blue-200 py-2 z-50">
              <button
                onClick={handleProfileClick}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 flex items-center gap-2"
              >
                <span>👤</span>
                Profile
              </button>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center gap-2"
              >
                <span>🚪</span>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
