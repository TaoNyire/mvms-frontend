import React, { useEffect, useState } from "react";
import Head from "next/head";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function AdminOrganizations() {
  const { token } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchOrganizations();
  }, [token, statusFilter, search]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setApiError("");
      const response = await axios.get(`${API_BASE}/organizations`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          status: statusFilter || undefined,
          search: search || undefined
        }
      });
      setOrganizations(response.data.data || response.data.organizations || []);
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
      setApiError("Failed to fetch organizations from server");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orgId) => {
    try {
      setActionLoading(true);
      await axios.post(`${API_BASE}/organizations/${orgId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update the organization in the list
      setOrganizations(prev => prev.map(org => 
        org.id === orgId ? { ...org, status: 'verified', active: true } : org
      ));
      
      setConfirmAction(null);
      alert('Organization approved successfully!');
    } catch (error) {
      console.error("Failed to approve organization:", error);
      alert("Failed to approve organization. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (orgId) => {
    try {
      setActionLoading(true);
      await axios.post(`${API_BASE}/organizations/${orgId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update the organization in the list
      setOrganizations(prev => prev.map(org => 
        org.id === orgId ? { ...org, status: 'rejected', active: false } : org
      ));
      
      setConfirmAction(null);
      alert('Organization rejected successfully!');
    } catch (error) {
      console.error("Failed to reject organization:", error);
      alert("Failed to reject organization. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Organizations - Admin Dashboard</title>
        </Head>
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
              Loading organizations...
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Organizations - Admin Dashboard</title>
        <meta name="description" content="Manage organizations in the MVMS system" />
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
            <h1 className="text-2xl font-bold text-gray-900">Organizations Management</h1>
            <p className="text-gray-600 mt-1">Manage and approve organization registrations</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search organizations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Organizations</p>
                <p className="text-2xl font-bold text-indigo-600">{organizations.length}</p>
              </div>
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-indigo-600 font-bold">🏢</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {organizations.filter(org => org.status === 'pending').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 font-bold">⏳</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-green-600">
                  {organizations.filter(org => org.status === 'verified').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold">✅</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {organizations.filter(org => org.status === 'rejected').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 font-bold">❌</span>
              </div>
            </div>
          </div>
        </div>

        {/* Organizations Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Organizations List</h2>
          </div>
          
          {organizations.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">No organizations found.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {organizations.map((org) => (
                    <OrganizationRow 
                      key={org.id} 
                      organization={org} 
                      onApprove={() => setConfirmAction({ type: 'approve', org })}
                      onReject={() => setConfirmAction({ type: 'reject', org })}
                      getStatusColor={getStatusColor}
                      formatDate={formatDate}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {confirmAction && (
          <ConfirmationModal
            action={confirmAction}
            onConfirm={confirmAction.type === 'approve' ? 
              () => handleApprove(confirmAction.org.id) : 
              () => handleReject(confirmAction.org.id)
            }
            onCancel={() => setConfirmAction(null)}
            loading={actionLoading}
          />
        )}
      </div>
    </>
  );
}

// Component for organization rows
function OrganizationRow({ organization, onApprove, onReject, getStatusColor, formatDate }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">{organization.org_name || organization.name}</div>
          <div className="text-sm text-gray-500">{organization.description || 'No description'}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">{organization.user?.name || organization.contact_name}</div>
          <div className="text-sm text-gray-500">{organization.user?.email || organization.email}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(organization.status)}`}>
          {organization.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatDate(organization.created_at)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center gap-2">
          {organization.status === 'pending' && (
            <>
              <button
                onClick={onApprove}
                className="text-green-600 hover:text-green-900"
              >
                Approve
              </button>
              <button
                onClick={onReject}
                className="text-red-600 hover:text-red-900"
              >
                Reject
              </button>
            </>
          )}
          <button className="text-indigo-600 hover:text-indigo-900">
            View Details
          </button>
        </div>
      </td>
    </tr>
  );
}

// Component for confirmation modal
function ConfirmationModal({ action, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Confirm {action.type === 'approve' ? 'Approval' : 'Rejection'}
          </h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          Are you sure you want to {action.type} the organization "{action.org.org_name || action.org.name}"?
        </p>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
              action.type === 'approve' 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Processing...' : `Yes, ${action.type}`}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
