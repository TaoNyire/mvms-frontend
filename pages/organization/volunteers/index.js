import React, { useEffect, useState } from "react";
import Head from "next/head";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";

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
} from "@heroicons/react/24/outline";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function OrganizationVolunteers() {
  const { token } = useAuth();
  const [currentVolunteers, setCurrentVolunteers] = useState([]);
  const [recentVolunteers, setRecentVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [activeTab, setActiveTab] = useState("current");
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setApiError("");

    Promise.all([
      axios.get(`${API_BASE}/org/current-volunteers`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${API_BASE}/org/recent-volunteers`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([currentRes, recentRes]) => {
        setCurrentVolunteers(currentRes.data.data || currentRes.data || []);
        setRecentVolunteers(recentRes.data.data || recentRes.data || []);
      })
      .catch(() => setApiError("Failed to load volunteers."))
      .finally(() => setLoading(false));
  }, [token]);

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
              Current Volunteers ({currentVolunteers.length})
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
          <div className="grid gap-6">
            {activeTab === "current" ? (
              currentVolunteers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">No current volunteers.</div>
                </div>
              ) : (
                currentVolunteers.map((volunteer) => (
                  <EnhancedVolunteerCard
                    key={volunteer.id}
                    volunteer={volunteer}
                    onTaskStatusUpdate={handleTaskStatusUpdate}
                    actionLoading={actionLoading[volunteer.id]}
                    showTaskActions={true}
                  />
                ))
              )
            ) : recentVolunteers.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">No recent volunteers.</div>
              </div>
            ) : (
              recentVolunteers.map((volunteer) => (
                <EnhancedVolunteerCard
                  key={volunteer.id}
                  volunteer={volunteer}
                  onTaskStatusUpdate={handleTaskStatusUpdate}
                  actionLoading={actionLoading[volunteer.id]}
                  showTaskActions={false}
                />
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}

// Enhanced Volunteer Card Component
function EnhancedVolunteerCard({ volunteer, onTaskStatusUpdate, actionLoading, showTaskActions }) {
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
                {volunteer.volunteer_name || volunteer.volunteer?.name || volunteer.name || "Unknown Volunteer"}
              </h3>
              <p className="text-gray-600 text-sm">
                {volunteer.volunteer_email || volunteer.volunteer?.email || volunteer.email || "No email provided"}
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
          {volunteer.volunteer_skills && volunteer.volunteer_skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {volunteer.volunteer_skills.slice(0, 3).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                >
                  {skill}
                </span>
              ))}
              {volunteer.volunteer_skills.length > 3 && (
                <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                  +{volunteer.volunteer_skills.length - 3} more
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

          <button
            onClick={() => window.location.href = `/organization/messages?contact=${volunteer.volunteer_id || volunteer.id}`}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
            Message
          </button>
        </div>
      </div>
    </div>
  );
}
