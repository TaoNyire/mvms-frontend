import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { BellIcon, UserCircleIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function VolunteerHeader() {
  const { token, user, logout } = useAuth();
  const router = useRouter();
  const [volunteer, setVolunteer] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Fetch volunteer user info
  useEffect(() => {
    if (!token) return;
    axios
      .get(`${API_BASE}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setVolunteer(res.data.data || res.data))
      .catch(() => setVolunteer(null));
  }, [token]);

  // Fetch notification count
  useEffect(() => {
    if (!token) return;

    const fetchNotificationCount = async () => {
      try {
        const response = await axios.get(`${API_BASE}/my-notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const notificationsData = response.data.data || [];
        const unreadNotifications = notificationsData.filter(n => !n.read);
        setUnreadCount(unreadNotifications.length);

      } catch (error) {
        console.error('Error fetching notification count:', error);
        // Use sample count if API fails
        setUnreadCount(2);
      }
    };

    fetchNotificationCount();

    // Refresh notification count every 5 minutes
    const interval = setInterval(fetchNotificationCount, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

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
    router.push("/volunteer/profile");
  };

  return (
    <header className="flex items-center justify-between mb-6 sm:mb-8 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg sm:rounded-xl shadow-lg border border-blue-500">
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg sm:text-xl">🤝</span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-bold text-lg sm:text-xl lg:text-2xl tracking-tight select-none truncate">
            Volunteer Dashboard
          </h1>
          <p className="text-green-200 text-xs sm:text-sm mt-1 hidden sm:block">
            Discover opportunities and manage your applications
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Notifications */}
        <button
          onClick={() => router.push("/volunteer/notifications")}
          className="relative p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
        >
          <BellIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-200"
          >
            <UserCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-700" />
            <span className="text-xs sm:text-sm font-medium text-gray-700 drop-shadow-sm hidden sm:block truncate max-w-24 lg:max-w-none">
              {volunteer?.name || user?.name || "Volunteer"}
            </span>
            <ChevronDownIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white rounded-xl shadow-xl border border-green-200 py-2 z-50">
              <button
                onClick={handleProfileClick}
                className="w-full text-left px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-200 flex items-center gap-2"
              >
                <span>👤</span>
                Profile
              </button>

              <button
                onClick={handleLogout}
                className="w-full text-left px-3 sm:px-4 py-3 text-xs sm:text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center gap-2"
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
