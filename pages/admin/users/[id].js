import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function ViewUser() {
  const router = useRouter();
  const { id } = router.query;
  const { token } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !id) return;
    
    fetchUser();
  }, [token, id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${API_BASE}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (err) {
      console.error("Error fetching user:", err);
      setError("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">User not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>View User - {user.name} | MVMS Admin</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
              <p className="text-gray-600">View user information and roles</p>
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              ← Back to Users
            </button>
          </div>

          {/* User Information Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <p className="text-gray-900 font-medium">{user.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <p className="text-gray-600">{user.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.active 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {user.active ? "Active" : "Inactive"}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Verified</label>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.email_verified_at 
                    ? "bg-green-100 text-green-800" 
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {user.email_verified_at ? "Verified" : "Not Verified"}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
                <p className="text-gray-600">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Roles Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Assigned Roles</h2>
            <div className="flex flex-wrap gap-2">
              {user.roles && user.roles.length > 0 ? (
                user.roles.map((role, index) => {
                  const roleName = typeof role === 'string' ? role : role.name;
                  return (
                    <span 
                      key={index}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        roleName === 'admin' ? 'bg-purple-100 text-purple-800' :
                        roleName === 'organization' ? 'bg-blue-100 text-blue-800' :
                        roleName === 'volunteer' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {roleName ? roleName.charAt(0).toUpperCase() + roleName.slice(1) : 'Unknown'}
                    </span>
                  );
                })
              ) : (
                <p className="text-gray-500">No roles assigned</p>
              )}
            </div>
          </div>

          {/* Profile Information */}
          {(user.volunteer_profile || user.organization_profile) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
              
              {user.volunteer_profile && (
                <div className="mb-6">
                  <h3 className="text-md font-medium text-green-800 mb-2">Volunteer Profile</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Phone:</span> {user.volunteer_profile.phone || "Not provided"}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span> {user.volunteer_profile.location || "Not provided"}
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium">Bio:</span> {user.volunteer_profile.bio || "Not provided"}
                    </div>
                  </div>
                </div>
              )}

              {user.organization_profile && (
                <div>
                  <h3 className="text-md font-medium text-blue-800 mb-2">Organization Profile</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Organization Type:</span> {user.organization_profile.org_type || "Not provided"}
                    </div>
                    <div>
                      <span className="font-medium">Website:</span> {user.organization_profile.website || "Not provided"}
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium">Description:</span> {user.organization_profile.description || "Not provided"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
