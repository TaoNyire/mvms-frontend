import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useAuth } from "../../../context/AuthContext";
import {
  getCurrentVolunteersDetailed,
  getRecentlyEmployedVolunteers,
  getOrganizationVolunteersList,
  getVolunteerProfile,
  reassignVolunteers
} from "../../../lib/api";

import {
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  BriefcaseIcon,
  CalendarIcon,
  MapPinIcon,
  StarIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

export default function OrganizationVolunteers() {
  const { token } = useAuth();
  const [currentVolunteers, setCurrentVolunteers] = useState([]);
  const [recentVolunteers, setRecentVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [activeTab, setActiveTab] = useState("current");
  const [actionLoading, setActionLoading] = useState({});

  // New state for enhanced functionality
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Load volunteers data with new API
  const loadVolunteers = async () => {
    if (!token) return;
    setLoading(true);
    setApiError("");

    try {
      const params = {
        page: currentPage,
        per_page: perPage,
        search: searchTerm,
        status: statusFilter !== "all" ? statusFilter : undefined
      };

      const [currentRes, recentRes] = await Promise.all([
        getOrganizationVolunteersList(params),
        getRecentlyEmployedVolunteers(30),
      ]);

      console.log('Current volunteers response:', currentRes);
      console.log('Recent volunteers response:', recentRes);

      // Handle new API response structure
      if (currentRes?.data?.success) {
        setCurrentVolunteers(currentRes.data.data || []);
        setTotalCount(currentRes.data.total || 0);
        setTotalPages(currentRes.data.last_page || 1);
      } else {
        setCurrentVolunteers([]);
        setTotalCount(0);
        setTotalPages(1);
      }

      // Handle recent volunteers (legacy API)
      const recentData = Array.isArray(recentRes?.data) ? recentRes.data : [];
      setRecentVolunteers(recentData);

    } catch (error) {
      console.error('Error loading volunteers:', error);
      setApiError("Failed to load volunteers.");
      setCurrentVolunteers([]);
      setRecentVolunteers([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVolunteers();
  }, [token, currentPage, searchTerm, statusFilter]);

  // Handle viewing volunteer profile
  const handleViewProfile = async (volunteerId) => {
    setProfileLoading(true);
    try {
      const response = await getVolunteerProfile(volunteerId);
      if (response?.data?.success) {
        setSelectedVolunteer(response.data.data);
        setShowProfileModal(true);
      } else {
        alert('Failed to load volunteer profile');
      }
    } catch (error) {
      console.error('Error loading volunteer profile:', error);
      alert('Failed to load volunteer profile');
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    loadVolunteers();
  };

  // Handle filter change
  const handleFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle task status update
  const handleTaskStatusUpdate = async (applicationId, status) => {
    setActionLoading(prev => ({ ...prev, [applicationId]: true }));

    try {
      await axios.post(
        `${API_BASE}/applications/${applicationId}/task-status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setCurrentVolunteers(prev =>
        prev.map(volunteer =>
          volunteer.id === applicationId
            ? { ...volunteer, task_status: { ...volunteer.task_status, status, completed_at: status === 'completed' ? new Date().toISOString() : null } }
            : volunteer
        )
      );

      // If completed or quit, move to recent volunteers
      if (status === 'completed' || status === 'quit') {
        const updatedVolunteer = currentVolunteers.find(v => v.id === applicationId);
        if (updatedVolunteer) {
          setRecentVolunteers(prev => [{ ...updatedVolunteer, task_status: { ...updatedVolunteer.task_status, status } }, ...prev]);
          setCurrentVolunteers(prev => prev.filter(v => v.id !== applicationId));
        }
      }

    } catch (error) {
      console.error('Failed to update task status:', error);
      alert('Failed to update task status. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [applicationId]: false }));
    }
  };



  return (
    <>
      <Head>
        <title>Volunteers - Organization Dashboard</title>
        <meta name="description" content="Manage your organization's volunteers and their tasks" />
      </Head>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-700">Volunteers</h1>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search volunteers by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </form>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("current")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "current"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Current Volunteers ({totalCount})
            </button>
            <button
              onClick={() => setActiveTab("recent")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "recent"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Recent Volunteers ({recentVolunteers.length})
            </button>
            <button
              onClick={() => window.location.href = '/organization/volunteers/performance'}
              className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm"
            >
              Performance Analytics
            </button>
          </nav>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-blue-600">Loading volunteers...</div>
          </div>
        ) : apiError ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {apiError}
          </div>
        ) : (
          <div>
            {activeTab === "current" ? (
              !Array.isArray(currentVolunteers) || currentVolunteers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">No current volunteers found.</div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                            Task Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Progress
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Joined
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentVolunteers.map((volunteer) => (
                          <VolunteerTableRow
                            key={volunteer.id}
                            volunteer={volunteer}
                            onTaskStatusUpdate={handleTaskStatusUpdate}
                            onViewProfile={handleViewProfile}
                            actionLoading={actionLoading[volunteer.id]}
                            profileLoading={profileLoading}
                            showTaskActions={true}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            ) : !Array.isArray(recentVolunteers) || recentVolunteers.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">No recent volunteers.</div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                          Task Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Progress
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentVolunteers.map((volunteer) => (
                        <VolunteerTableRow
                          key={volunteer.id}
                          volunteer={volunteer}
                          onTaskStatusUpdate={handleTaskStatusUpdate}
                          onViewProfile={handleViewProfile}
                          actionLoading={actionLoading[volunteer.id]}
                          profileLoading={profileLoading}
                          showTaskActions={false}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pagination for current volunteers */}
        {activeTab === "current" && totalPages > 1 && (
          <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
            <div className="flex items-center text-sm text-gray-700">
              <span>
                Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalCount)} of {totalCount} volunteers
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNum > totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md ${
                      pageNum === currentPage
                        ? 'bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Volunteer Profile Modal */}
        {showProfileModal && selectedVolunteer && (
          <VolunteerProfileModal
            volunteer={selectedVolunteer}
            onClose={() => {
              setShowProfileModal(false);
              setSelectedVolunteer(null);
            }}
          />
        )}
      </div>
    </>
  );
}

// Volunteer Table Row Component
function VolunteerTableRow({ volunteer, onTaskStatusUpdate, onViewProfile, actionLoading, profileLoading, showTaskActions }) {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'in_progress':
      case 'working': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const taskStatus = volunteer.task_status?.status || 'pending';

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {volunteer.volunteer?.name || volunteer.volunteer_name || volunteer.name || "Unknown Volunteer"}
          </div>
          <div className="text-sm text-gray-500">
            {volunteer.volunteer?.email || volunteer.volunteer_email || volunteer.email || "No email provided"}
          </div>
          {volunteer.volunteer?.skills && volunteer.volunteer.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {volunteer.volunteer.skills.slice(0, 2).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                >
                  {skill.name || skill}
                </span>
              ))}
              {volunteer.volunteer.skills.length > 2 && (
                <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                  +{volunteer.volunteer.skills.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {volunteer.opportunity?.title || volunteer.opportunity_title || "No opportunity"}
          </div>
          <div className="text-sm text-gray-500">
            {volunteer.opportunity?.location || volunteer.opportunity_location || ""}
          </div>
          <div className="text-xs text-gray-400">
            {volunteer.opportunity?.start_date && formatDate(volunteer.opportunity.start_date)} -
            {volunteer.opportunity?.end_date && formatDate(volunteer.opportunity.end_date)}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(taskStatus)}`}>
          {taskStatus.replace('_', ' ')}
        </span>
        {volunteer.task_status?.started_at && (
          <div className="text-xs text-gray-500 mt-1">
            Started: {formatDate(volunteer.task_status.started_at)}
          </div>
        )}
        {volunteer.task_status?.completed_at && (
          <div className="text-xs text-gray-500 mt-1">
            Completed: {formatDate(volunteer.task_status.completed_at)}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${volunteer.progress || 0}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-600">{volunteer.progress || 0}%</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {volunteer.joined_at ? formatDate(volunteer.joined_at) :
         volunteer.confirmed_at ? formatDate(volunteer.confirmed_at) : 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex gap-2">
          <button
            onClick={() => onViewProfile(volunteer.volunteer?.id || volunteer.volunteer_id)}
            disabled={profileLoading}
            className="text-green-600 hover:text-green-900 disabled:opacity-50 flex items-center gap-1"
          >
            <EyeIcon className="w-4 h-4" />
            {profileLoading ? 'Loading...' : 'View'}
          </button>

          <button
            onClick={() => window.location.href = `/organization/messages?contact=${volunteer.volunteer?.id || volunteer.volunteer_id || volunteer.id}`}
            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
            Message
          </button>
        </div>
      </td>
    </tr>
  );
}

// Enhanced Volunteer Card Component (keeping for backward compatibility)
function EnhancedVolunteerCard({ volunteer, onTaskStatusUpdate, onViewProfile, actionLoading, profileLoading, showTaskActions }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'in_progress':
      case 'working': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'quit': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Volunteer Info */}
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5 text-gray-400" />
                {volunteer.volunteer?.name || volunteer.volunteer_name || volunteer.name || "Unknown Volunteer"}
              </h3>
              <p className="text-gray-600 text-sm">
                {volunteer.volunteer?.email || volunteer.volunteer_email || volunteer.email || "No email provided"}
              </p>
            </div>
            {volunteer.task_status?.status && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(volunteer.task_status.status)}`}>
                {volunteer.task_status.status}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <BriefcaseIcon className="w-4 h-4 text-gray-400" />
              <span className="font-medium">Opportunity:</span>
              <span>{volunteer.opportunity_title || volunteer.opportunity?.title || "Unknown"}</span>
            </div>

            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-gray-400" />
              <span className="font-medium">Started:</span>
              <span>{formatDate(volunteer.task_status?.started_at || volunteer.started_at || volunteer.accepted_at)}</span>
            </div>

            {volunteer.opportunity?.location && (
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Location:</span>
                <span>{volunteer.opportunity.location}</span>
              </div>
            )}

            {volunteer.task_status?.completed_at && (
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Completed:</span>
                <span>{formatDate(volunteer.task_status.completed_at)}</span>
              </div>
            )}
          </div>

          {/* Skills */}
          {volunteer.volunteer?.skills && volunteer.volunteer.skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {volunteer.volunteer.skills.slice(0, 3).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                >
                  {skill.name || skill}
                </span>
              ))}
              {volunteer.volunteer.skills.length > 3 && (
                <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                  +{volunteer.volunteer.skills.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 lg:flex-col lg:w-48">
          {showTaskActions && (volunteer.task_status?.status === 'in_progress' || volunteer.task_status?.status === 'working') && (
            <div className="flex gap-2">
              <button
                onClick={() => onTaskStatusUpdate(volunteer.id, 'completed')}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                <CheckCircleIcon className="w-4 h-4" />
                {actionLoading ? 'Processing...' : 'Complete'}
              </button>
              <button
                onClick={() => onTaskStatusUpdate(volunteer.id, 'quit')}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                <XCircleIcon className="w-4 h-4" />
                {actionLoading ? 'Processing...' : 'Mark Quit'}
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => onViewProfile(volunteer.volunteer?.id || volunteer.volunteer_id)}
              disabled={profileLoading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              <EyeIcon className="w-4 h-4" />
              {profileLoading ? 'Loading...' : 'View'}
            </button>

            <button
              onClick={() => window.location.href = `/organization/messages?contact=${volunteer.volunteer?.id || volunteer.volunteer_id || volunteer.id}`}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Volunteer Profile Modal Component
function VolunteerProfileModal({ volunteer, onClose }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'in_progress':
      case 'working': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{volunteer.name}</h2>
              <p className="text-gray-600">{volunteer.email}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>

              {volunteer.profile && (
                <div className="space-y-3">
                  {volunteer.profile.bio && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bio</label>
                      <p className="text-gray-900">{volunteer.profile.bio}</p>
                    </div>
                  )}

                  {volunteer.profile.location && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <p className="text-gray-900">{volunteer.profile.location}</p>
                    </div>
                  )}

                  {volunteer.profile.district && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">District</label>
                      <p className="text-gray-900">{volunteer.profile.district}</p>
                    </div>
                  )}

                  {volunteer.profile.region && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Region</label>
                      <p className="text-gray-900">{volunteer.profile.region}</p>
                    </div>
                  )}

                  {volunteer.profile.availability && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Availability</label>
                      <p className="text-gray-900">{volunteer.profile.availability}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Documents */}
              {volunteer.profile && (volunteer.profile.cv_url || volunteer.profile.qualifications_url) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Documents</label>
                  <div className="space-y-2">
                    {volunteer.profile.cv_url && (
                      <a
                        href={volunteer.profile.cv_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                      >
                        <BriefcaseIcon className="w-4 h-4" />
                        View CV
                      </a>
                    )}
                    {volunteer.profile.qualifications_url && (
                      <a
                        href={volunteer.profile.qualifications_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                      >
                        <StarIcon className="w-4 h-4" />
                        View Qualifications
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Skills and Statistics */}
            <div className="space-y-4">
              {/* Skills */}
              {volunteer.skills && volunteer.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {volunteer.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {skill.name}
                        {skill.category && skill.category !== 'General' && (
                          <span className="text-blue-600 ml-1">({skill.category})</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Statistics */}
              {volunteer.statistics && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{volunteer.statistics.total_applications}</div>
                      <div className="text-sm text-gray-600">Total Applications</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{volunteer.statistics.completed_tasks}</div>
                      <div className="text-sm text-gray-600">Completed Tasks</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{volunteer.statistics.active_tasks}</div>
                      <div className="text-sm text-gray-600">Active Tasks</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-gray-600">{volunteer.statistics.pending_tasks}</div>
                      <div className="text-sm text-gray-600">Pending Tasks</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Applications History */}
          {volunteer.applications && volunteer.applications.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Application History</h3>
              <div className="space-y-4">
                {volunteer.applications.map((application, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{application.opportunity.title}</h4>
                        <p className="text-sm text-gray-600">{application.opportunity.location}</p>
                      </div>
                      {application.task_status && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.task_status.status)}`}>
                          {application.task_status.status}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Applied:</span> {formatDate(application.applied_at)}
                      </div>
                      <div>
                        <span className="font-medium">Confirmed:</span> {formatDate(application.confirmed_at)}
                      </div>
                      {application.task && (
                        <>
                          <div>
                            <span className="font-medium">Task:</span> {application.task.title}
                          </div>
                          <div>
                            <span className="font-medium">Progress:</span> {application.progress}%
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
