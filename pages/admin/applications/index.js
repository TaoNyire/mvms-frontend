import React, { useEffect, useState } from "react";
import Head from "next/head";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function AdminApplications() {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchApplications();
  }, [token, statusFilter, search]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setApiError("");
      const response = await axios.get(`${API_BASE}/admin/applications`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          status: statusFilter || undefined,
          search: search || undefined
        }
      });
      setApplications(response.data.data || response.data.applications || []);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      setApiError("Failed to fetch applications from server");
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      setActionLoading(true);
      await axios.put(`${API_BASE}/admin/applications/${applicationId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the application in the list
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
      
      setConfirmAction(null);
      alert(`Application ${newStatus} successfully!`);
    } catch (error) {
      console.error("Failed to update application status:", error);
      alert("Failed to update application status. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
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
          <title>Applications - Admin Dashboard</title>
        </Head>
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
              Loading applications...
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Applications - Admin Dashboard</title>
        <meta name="description" content="Manage volunteer applications in the MVMS system" />
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
            <h1 className="text-2xl font-bold text-gray-900">Applications Management</h1>
            <p className="text-gray-600 mt-1">Monitor and manage volunteer applications</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search applications..."
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
                <option value="accepted">Accepted</option>
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
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-indigo-600">{applications.length}</p>
              </div>
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-indigo-600 font-bold">📋</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {applications.filter(app => app.status === 'pending').length}
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
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-green-600">
                  {applications.filter(app => app.status === 'accepted').length}
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
                  {applications.filter(app => app.status === 'rejected').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 font-bold">❌</span>
              </div>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Applications List</h2>
          </div>
          
          {applications.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">No applications found.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Volunteer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Opportunity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((application) => (
                    <ApplicationRow 
                      key={application.id} 
                      application={application} 
                      onUpdateStatus={(status) => setConfirmAction({ type: status, application })}
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
            onConfirm={() => updateApplicationStatus(confirmAction.application.id, confirmAction.type)}
            onCancel={() => setConfirmAction(null)}
            loading={actionLoading}
          />
        )}
      </div>
    </>
  );
}

// Component for application rows
function ApplicationRow({ application, onUpdateStatus, getStatusColor, formatDate }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">{application.volunteer?.name || 'N/A'}</div>
          <div className="text-sm text-gray-500">{application.volunteer?.email || 'N/A'}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">{application.opportunity?.title || 'N/A'}</div>
          <div className="text-sm text-gray-500">{application.opportunity?.location || 'N/A'}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{application.opportunity?.organization?.name || 'N/A'}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
          {application.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatDate(application.applied_at || application.created_at)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center gap-2">
          {application.status === 'pending' && (
            <>
              <button
                onClick={() => onUpdateStatus('accepted')}
                className="text-green-600 hover:text-green-900"
              >
                Accept
              </button>
              <button
                onClick={() => onUpdateStatus('rejected')}
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
            Confirm {action.type === 'accepted' ? 'Acceptance' : 'Rejection'}
          </h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          Are you sure you want to {action.type} this application from {action.application.volunteer?.name}?
        </p>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
              action.type === 'accepted' 
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
