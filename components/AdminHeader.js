// components/admin/AdminHeader.js
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function AdminHeader() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center border-b border-blue-200">
      <h1 className="text-2xl font-bold text-blue-700">Admin Dashboard</h1>

      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-2 text-blue-800 focus:outline-none"
        >
          <span>{user?.name}</span>
         
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow z-10">
            <button
              onClick={() => setDropdownOpen(false)}
              className="block w-full text-left px-4 py-2 text-sm text-blue-800 hover:bg-blue-50"
            >
              Profile
            </button>
            <button
              onClick={logout}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
