import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function AdminHeader() {
  const { token, logout } = useAuth();
  const [admin, setAdmin] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch admin user info
  useEffect(() => {
    if (!token) return;
    axios
      .get(`${API_BASE}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setAdmin(res.data.data || res.data))
      .catch(() => setAdmin(null));
  }, [token]);

  // Close dropdown on click outside
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  return (
    <header className="flex items-center justify-between mb-8 px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl shadow-lg border border-indigo-500">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">⚡</span>
        </div>
        <div>
          <h1 className="text-white font-bold text-2xl tracking-tight select-none">Admin Dashboard</h1>
          <p className="text-indigo-200 text-sm">System Management & Control</p>
        </div>
      </div>
      {/* Admin name & dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
          onClick={() => setDropdownOpen((v) => !v)}
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
        >
          {/* User Icon */}
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white bg-opacity-20 text-white shadow-inner">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 14c-4.418 0-8 2.239-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.761-3.582-5-8-5Z"
              />
            </svg>
          </span>
          <span className="font-medium text-white text-base drop-shadow-sm">
            {admin ? admin.name : "Admin"}
          </span>
          <svg width="18" height="18" fill="none" stroke="currentColor" className="ml-1 text-white">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 9l3 3 3-3"
            />
          </svg>
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-indigo-200 rounded-xl shadow-xl z-50 py-2 animate-fade-in">
            <button
              className="w-full text-left px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-800 transition-colors duration-200 flex items-center gap-2"
              onClick={() => {
                setDropdownOpen(false);
                window.open("/admin/profile", "_blank");
              }}
            >
              <span>👤</span>
              Profile
            </button>
            <button
              className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center gap-2"
              onClick={async () => {
                setDropdownOpen(false);
                await logout();
                window.location.href = "/login";
              }}
            >
              <span>🚪</span>
              Logout
            </button>
          </div>
        )}
      </div>
      {/* Optional: Add animation for dropdown */}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.18s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px);}
          to { opacity: 1; transform: none;}
        }
      `}</style>
    </header>
  );
}