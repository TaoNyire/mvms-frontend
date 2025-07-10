import React, { useState, useEffect } from "react";
import Head from "next/head";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import {
  ShieldCheckIcon,
  UserGroupIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  EyeIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function SecurityAndRoles() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("roles");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [securityData, setSecurityData] = useState(null);
  const [apiError, setApiError] = useState("");
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [showEditRole, setShowEditRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    color: "gray",
    permissions: []
  });

  // Load security data from database
  useEffect(() => {
    if (!token) return;
    fetchSecurityData();
  }, [token]);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      setApiError("");
      const response = await axios.get(`${API_BASE}/admin/security`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSecurityData(response.data);
    } catch (error) {
      console.error("Failed to load security data:", error);
      setApiError("Failed to load security data from server");
    } finally {
      setLoading(false);
    }
  };

  // Refresh security data
  const refreshSecurityData = async () => {
    setRefreshing(true);
    await fetchSecurityData();
    setRefreshing(false);
    if (!apiError) {
      alert("Security data refreshed!");
    }
  };

  // Use data from API or fallback to empty array
  const roles = securityData?.roles || [];
  const securityStats = securityData?.stats || {};
  const permissions = securityData?.permissions || {};

  // Handle role creation
  const handleCreateRole = async () => {
    try {
      await axios.post(`${API_BASE}/admin/roles`, newRole, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowCreateRole(false);
      setNewRole({ name: "", description: "", color: "gray", permissions: [] });
      await fetchSecurityData();
      alert("Role created successfully!");
    } catch (error) {
      console.error("Failed to create role:", error);
      alert("Failed to create role. Please try again.");
    }
  };

  // Handle role editing
  const handleEditRole = async () => {
    try {
      await axios.put(`${API_BASE}/admin/roles/${selectedRole.id}`, selectedRole, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowEditRole(false);
      setSelectedRole(null);
      await fetchSecurityData();
      alert("Role updated successfully!");
    } catch (error) {
      console.error("Failed to update role:", error);
      alert("Failed to update role. Please try again.");
    }
  };

  // Handle role deletion
  const handleDeleteRole = async (role) => {
    if (!confirm(`Are you sure you want to delete the "${role.name}" role?`)) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/admin/roles/${role.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchSecurityData();
      alert("Role deleted successfully!");
    } catch (error) {
      console.error("Failed to delete role:", error);
      alert(error.response?.data?.message || "Failed to delete role. Please try again.");
    }
  };

  const securityLogs = [
    {
      id: 1,
      type: "login",
      user: "admin@mvms.org",
      action: "Successful login",
      ip: "192.168.1.100",
      timestamp: "2024-01-15 10:30:00",
      status: "success"
    },
    {
      id: 2,
      type: "failed_login",
      user: "unknown@example.com",
      action: "Failed login attempt",
      ip: "203.0.113.45",
      timestamp: "2024-01-15 09:15:00",
      status: "warning"
    },
    {
      id: 3,
      type: "permission_change",
      user: "admin@mvms.org",
      action: "Updated user permissions",
      ip: "192.168.1.100",
      timestamp: "2024-01-15 08:45:00",
      status: "info"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleColor = (color) => {
    const colorMap = {
      red: 'bg-red-100 text-red-800 border-red-200',
      indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
    };
    return colorMap[color] || colorMap.blue;
  };

  const tabs = [
    { id: "roles", label: "User Roles", icon: UserGroupIcon },
    { id: "permissions", label: "Permissions", icon: KeyIcon },
    { id: "security", label: "Security Logs", icon: ShieldCheckIcon },
  ];

  if (loading) {
    return (
      <>
        <Head>
          <title>Security & Roles - Admin Dashboard</title>
          <meta name="description" content="Manage user roles, permissions, and security settings" />
        </Head>
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
              Loading security data...
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Security & Roles - Admin Dashboard</title>
        <meta name="description" content="Manage user roles, permissions, and security settings" />
      </Head>

      <div className="space-y-6">
        {/* Error Message */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {apiError}
          </div>
        )}
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Security & Roles</h1>
            <p className="text-gray-600 mt-1">Manage user permissions and monitor security</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={refreshSecurityData}
              disabled={refreshing}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {refreshing ? "Refreshing..." : "Refresh Data"}
            </button>
            <button
              onClick={() => setShowCreateRole(true)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add New Role
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "roles" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map((role) => (
              <div key={role.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(role.color)}`}>
                    {role.users} users
                  </span>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions:</h4>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map((permission, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedRole({...role});
                      setShowEditRole(true);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Edit Role
                  </button>
                  <button
                    onClick={() => alert(`Role Details:\n\nName: ${role.name}\nDescription: ${role.description}\nUsers: ${role.users}\nPermissions: ${role.permissions.join(', ')}`)}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {EyeIcon ? (
                      <EyeIcon className="w-4 h-4" />
                    ) : (
                      <span>👁️</span>
                    )}
                  </button>
                  {!['admin', 'organization', 'volunteer'].includes(role.name.toLowerCase()) && (
                    <button
                      onClick={() => handleDeleteRole(role)}
                      className="px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "permissions" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <KeyIcon className="w-5 h-5 text-gray-600" />
              Permission Matrix
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Permission</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Super Admin</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Admin</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Organization</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Volunteer</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    "User Management",
                    "Organization Management", 
                    "System Settings",
                    "Create Opportunities",
                    "Manage Applications",
                    "View Reports",
                    "Apply for Opportunities",
                    "Manage Profile"
                  ].map((permission, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm text-gray-900">{permission}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-green-600">✓</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={index < 3 ? "text-green-600" : "text-gray-300"}>
                          {index < 3 ? "✓" : "✗"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={index >= 3 && index < 6 ? "text-green-600" : "text-gray-300"}>
                          {index >= 3 && index < 6 ? "✓" : "✗"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={index >= 6 ? "text-green-600" : "text-gray-300"}>
                          {index >= 6 ? "✓" : "✗"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-6">
            {/* Security Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Security Status</p>
                    <p className="text-lg font-bold text-green-600">Secure</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Failed Logins (24h)</p>
                    <p className="text-lg font-bold text-yellow-600">{securityStats.failedLogins || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <LockClosedIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Sessions</p>
                    <p className="text-lg font-bold text-blue-600">{securityStats.activeSessions || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Logs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-gray-600" />
                Recent Security Events
              </h3>
              <div className="space-y-3">
                {securityLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{log.action}</p>
                        <p className="text-xs text-gray-500">{log.user} from {log.ip}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Role Modal */}
      {showCreateRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Role</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter role name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newRole.description}
                  onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows="3"
                  placeholder="Enter role description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <select
                  value={newRole.color}
                  onChange={(e) => setNewRole({...newRole, color: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="gray">Gray</option>
                  <option value="red">Red</option>
                  <option value="yellow">Yellow</option>
                  <option value="green">Green</option>
                  <option value="blue">Blue</option>
                  <option value="indigo">Indigo</option>
                  <option value="purple">Purple</option>
                  <option value="pink">Pink</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateRole(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRole}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditRole && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Role</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                <input
                  type="text"
                  value={selectedRole.name}
                  onChange={(e) => setSelectedRole({...selectedRole, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter role name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={selectedRole.description}
                  onChange={(e) => setSelectedRole({...selectedRole, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows="3"
                  placeholder="Enter role description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <select
                  value={selectedRole.color}
                  onChange={(e) => setSelectedRole({...selectedRole, color: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="gray">Gray</option>
                  <option value="red">Red</option>
                  <option value="yellow">Yellow</option>
                  <option value="green">Green</option>
                  <option value="blue">Blue</option>
                  <option value="indigo">Indigo</option>
                  <option value="purple">Purple</option>
                  <option value="pink">Pink</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditRole(false);
                  setSelectedRole(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditRole}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
