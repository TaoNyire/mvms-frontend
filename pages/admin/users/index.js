import React, { useEffect, useState } from "react";
import Head from "next/head";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");


  // Modal state
  const [confirmAction, setConfirmAction] = useState(null); // { type, user }
  const [actionLoading, setActionLoading] = useState(false);

  // Add User modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "volunteer" });
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState(""); // Show password on success

  // Edit user modal state
  const [editUser, setEditUser] = useState(null); // user object or null
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setApiError("");
    axios
      .get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: search || undefined,
          status: statusFilter || undefined,
          role: roleFilter || undefined, // Fetch all users or filter by role
        },
      })
      .then((res) => {
        setUsers(res.data.data || res.data.users || []);
      })
      .catch(() => setApiError("Failed to fetch users."))
      .finally(() => setLoading(false));
  }, [token, search, statusFilter, roleFilter]);

  const handleToggleActive = (user) => {
    setActionLoading(true);
    axios
      .put(
        `${API_BASE}/users/${user.id}/toggle-active`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, active: !u.active } : u
          )
        );
        setConfirmAction(null);
      })
      .catch(() => alert("Failed to toggle user status."))
      .finally(() => setActionLoading(false));
  };

  const handleDelete = (user) => {
    setActionLoading(true);
    axios
      .delete(`${API_BASE}/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        setConfirmAction(null);
      })
      .catch(() => alert("Failed to delete user."))
      .finally(() => setActionLoading(false));
  };

  const handleResetPassword = (user) => {
    setActionLoading(true);
    axios
      .post(
        `${API_BASE}/users/${user.id}/reset-password`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        alert(
          res.data.new_password
            ? `Password reset. New password: ${res.data.new_password}`
            : "Password reset email sent."
        );
        setConfirmAction(null);
      })
      .catch(() => alert("Failed to reset password."))
      .finally(() => setActionLoading(false));
  };

  // Add Volunteer handlers
  const handleAddVolunteer = () => {
    setAddLoading(true);
    setAddError("");
    setGeneratedPassword("");
    axios
      .post(
        `${API_BASE}/users/add-user`,
        newUser,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setUsers([res.data.user, ...users]);
        setShowAddModal(false);
        setNewUser({ name: "", email: "", role: "volunteer" });
        setGeneratedPassword(res.data.password);
        setTimeout(() => setGeneratedPassword(""), 8000); // Hide after a while
      })
      .catch((err) => {
        setAddError(
          err.response?.data?.message ||
            (err.response?.data?.errors
              ? Object.values(err.response.data.errors).flat().join(" ")
              : "Failed to add volunteer")
        );
      })
      .finally(() => setAddLoading(false));
  };

  // Edit User handlers
  const handleEditUser = async () => {
    setEditLoading(true);
    setEditError("");
    try {
      await axios.put(
        `${API_BASE}/users/${editUser.id}`,
        { name: editUser.name, email: editUser.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === editUser.id ? { ...u, ...editUser } : u))
      );
      setEditUser(null);
    } catch (err) {
      setEditError(
        err.response?.data?.message ||
          (err.response?.data?.errors
            ? Object.values(err.response.data.errors).flat().join(" ")
            : "Failed to update user")
      );
    }
    setEditLoading(false);
  };

  return (
    <>
      <Head>
        <title>User Management - MVMS Admin</title>
        <meta name="description" content="Manage all users in the MVMS system" />
      </Head>
      <div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage volunteers, organizations, and administrators</p>
          </div>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-full shadow hover:bg-indigo-700 transition font-semibold"
            onClick={() => setShowAddModal(true)}
          >
            Add User
          </button>
        </div>
        <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:gap-4">
          <input
            type="text"
            placeholder="Search by name or email"
            className="bg-gray-50 border border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:shadow-md rounded-full px-4 py-2 transition text-gray-900 placeholder-gray-400"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />
          <select
            className="bg-gray-50 border border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:shadow-md rounded-full px-4 py-2 transition text-gray-900"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
            }}
          >
            <option value="">All Roles</option>
            <option value="volunteer">Volunteers</option>
            <option value="organization">Organizations</option>
            <option value="admin">Admins</option>
          </select>
          <select
            className="bg-gray-50 border border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:shadow-md rounded-full px-4 py-2 transition text-gray-900"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
            }}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        {apiError && (
          <div className="text-red-600 font-semibold mb-4">{apiError}</div>
        )}
        {generatedPassword && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-800">
            User added successfully! Temporary password:{" "}
            <span className="font-mono">{generatedPassword}</span>
          </div>
        )}
        <div className="overflow-x-auto rounded shadow bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-indigo-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-900 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-900 uppercase">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-900 uppercase">Role</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-900 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-indigo-700">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-2 text-gray-900">{user.name}</td>
                    <td className="px-4 py-2 text-gray-700">{user.email}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'organization' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Volunteer'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        user.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-200 text-gray-600"
                      }`}>
                        {user.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-2 space-x-2 flex flex-col sm:flex-row">
                      <button
                        className="text-indigo-600 hover:underline text-xs"
                        onClick={() => window.open(`/admin/users/${user.id}`, "_blank")}
                      >
                        View
                      </button>
                      <button
                        className="text-green-700 hover:underline text-xs"
                        onClick={() => setEditUser(user)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-yellow-700 hover:underline text-xs"
                        onClick={() => setConfirmAction({ type: "toggle", user })}
                      >
                        {user.active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        className="text-blue-700 hover:underline text-xs"
                        onClick={() => setConfirmAction({ type: "reset", user })}
                      >
                        Reset Password
                      </button>
                      <button
                        className="text-red-600 hover:underline text-xs"
                        onClick={() => setConfirmAction({ type: "delete", user })}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Confirm Modal */}
        {confirmAction && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full">
              <div className="mb-4 text-gray-900">
                {confirmAction.type === "toggle" && (
                  <>
                    Are you sure you want to {confirmAction.user.active ? "deactivate" : "activate"}{" "}
                    <span className="font-bold">{confirmAction.user.name}</span>?
                  </>
                )}
                {confirmAction.type === "delete" && (
                  <>
                    Are you sure you want to <span className="font-bold text-red-600">delete</span>{" "}
                    <span className="font-bold">{confirmAction.user.name}</span>?
                  </>
                )}
                {confirmAction.type === "reset" && (
                  <>
                    Reset password for <span className="font-bold">{confirmAction.user.name}</span>?
                  </>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-1 rounded bg-gray-200 text-gray-700"
                  onClick={() => setConfirmAction(null)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-1 rounded font-semibold ${
                    confirmAction.type === "delete"
                      ? "bg-red-600 text-white"
                      : "bg-indigo-600 text-white"
                  }`}
                  onClick={() => {
                    if (confirmAction.type === "toggle") handleToggleActive(confirmAction.user);
                    if (confirmAction.type === "delete") handleDelete(confirmAction.user);
                    if (confirmAction.type === "reset") handleResetPassword(confirmAction.user);
                  }}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Processing..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
              <h2 className="text-lg font-bold mb-4">Add User</h2>
              {addError && <div className="text-red-600 mb-2">{addError}</div>}
              <input
                type="text"
                className="w-full bg-gray-50 border border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:shadow-md rounded-full px-4 py-2 mb-2 transition text-gray-900 placeholder-gray-400"
                placeholder="Full Name"
                value={newUser.name}
                onChange={e => setNewUser(v => ({ ...v, name: e.target.value }))}
              />
              <input
                type="email"
                className="w-full bg-gray-50 border border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:shadow-md rounded-full px-4 py-2 mb-2 transition text-gray-900 placeholder-gray-400"
                placeholder="Email"
                value={newUser.email}
                onChange={e => setNewUser(v => ({ ...v, email: e.target.value }))}
              />
              <select
                className="w-full bg-gray-50 border border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:shadow-md rounded-full px-4 py-2 mb-4 transition text-gray-900"
                value={newUser.role}
                onChange={e => setNewUser(v => ({ ...v, role: e.target.value }))}
              >
                <option value="volunteer">Volunteer</option>
                <option value="organization">Organization</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-1 rounded bg-gray-200 text-gray-700"
                  onClick={() => setShowAddModal(false)}
                  disabled={addLoading}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-1 rounded bg-indigo-600 text-white"
                  onClick={handleAddVolunteer}
                  disabled={addLoading}
                >
                  {addLoading ? "Adding..." : "Add"}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Edit User Modal */}
        {editUser && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
              <h2 className="text-lg font-bold mb-4">Edit User</h2>
              {editError && <div className="text-red-600 mb-2">{editError}</div>}
              <input
                type="text"
                className="w-full bg-gray-50 border border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:shadow-md rounded-full px-4 py-2 mb-2 transition text-gray-900 placeholder-gray-400"
                placeholder="Full Name"
                value={editUser.name}
                onChange={e => setEditUser({ ...editUser, name: e.target.value })}
              />
              <input
                type="email"
                className="w-full bg-gray-50 border border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:shadow-md rounded-full px-4 py-2 mb-4 transition text-gray-900 placeholder-gray-400"
                placeholder="Email"
                value={editUser.email}
                onChange={e => setEditUser({ ...editUser, email: e.target.value })}
              />
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-1 rounded bg-gray-200 text-gray-700"
                  onClick={() => setEditUser(null)}
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-1 rounded bg-indigo-600 text-white"
                  onClick={handleEditUser}
                  disabled={editLoading}
                >
                  {editLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}