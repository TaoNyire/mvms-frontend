import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import Link from "next/link";
import Head from "next/head";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  BriefcaseIcon,
  CalendarIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function ApplicationsIndex() {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0
  });
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showScoringModal, setShowScoringModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [sortBy, setSortBy] = useState('date'); // 'date', 'score', 'match'

  // Fetch applications
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setApiError("");
    axios
      .get(`${API_BASE}/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const apps = res.data.data || res.data || [];
        setApplications(apps);

        // Calculate stats
        const stats = {
          total: apps.length,
          pending: apps.filter(app => app.status?.toLowerCase() === 'pending').length,
          accepted: apps.filter(app => app.status?.toLowerCase() === 'accepted').length,
          rejected: apps.filter(app => app.status?.toLowerCase() === 'rejected').length,
        };
        setStats(stats);
      })
      .catch((e) => {
        setApiError("Failed to load applications. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Filter applications based on search and status
  useEffect(() => {
    let filtered = applications;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(app =>
        (app.volunteer_name || app.volunteer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.opportunity_title || app.opportunity?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.volunteer_email || app.volunteer?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app =>
        (app.status || '').toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredApplications(filtered);
  }, [applications, searchTerm, statusFilter]);

  // Quick action handlers
  const handleQuickAction = async (applicationId, action) => {
    setActionLoading(prev => ({ ...prev, [applicationId]: true }));

    try {
      await axios.put(
        `${API_BASE}/applications/${applicationId}/respond`,
        { status: action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId
            ? { ...app, status: action, responded_at: new Date().toISOString() }
            : app
        )
      );

      // Update stats
      const updatedApps = applications.map(app =>
        app.id === applicationId ? { ...app, status: action } : app
      );
      const newStats = {
        total: updatedApps.length,
        pending: updatedApps.filter(app => app.status?.toLowerCase() === 'pending').length,
        accepted: updatedApps.filter(app => app.status?.toLowerCase() === 'accepted').length,
        rejected: updatedApps.filter(app => app.status?.toLowerCase() === 'rejected').length,
      };
      setStats(newStats);

    } catch (error) {
      console.error('Failed to update application:', error);
      alert('Failed to update application. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  // Batch processing functions
  const toggleApplicationSelection = (applicationId) => {
    setSelectedApplications(prev =>
      prev.includes(applicationId)
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const selectAllApplications = () => {
    const pendingApps = filteredApplications.filter(app => app.status?.toLowerCase() === 'pending').map(app => app.id);
    setSelectedApplications(pendingApps);
  };

  const clearSelection = () => {
    setSelectedApplications([]);
  };

  const batchProcessApplications = async (action, rejectionReason = '') => {
    try {
      const promises = selectedApplications.map(appId =>
        axios.put(`${API_BASE}/applications/${appId}/status`,
          {
            status: action,
            rejection_reason: rejectionReason
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );

      await Promise.all(promises);

      // Refresh applications
      const response = await axios.get(`${API_BASE}/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(response.data.data || response.data || []);

      alert(`Successfully ${action} ${selectedApplications.length} applications!`);
      setSelectedApplications([]);
      setShowBatchModal(false);

    } catch (error) {
      console.error("Failed to batch process applications:", error);
      alert("Failed to process some applications. Please try again.");
    }
  };

  // Application scoring function
  const calculateApplicationScore = (application) => {
    let score = 0;
    const opportunity = application.opportunity;
    const volunteer = application.volunteer;

    if (!opportunity || !volunteer) return 0;

    // Skills match (40% of score)
    const requiredSkills = opportunity.required_skills || [];
    const volunteerSkills = volunteer.skills || [];
    const skillsMatch = requiredSkills.filter(skill =>
      volunteerSkills.some(vSkill => vSkill.toLowerCase().includes(skill.toLowerCase()))
    ).length;
    const skillsScore = requiredSkills.length > 0 ? (skillsMatch / requiredSkills.length) * 40 : 20;
    score += skillsScore;

    // Experience level (30% of score)
    const experienceScore = volunteer.experience_level === 'expert' ? 30 :
                           volunteer.experience_level === 'intermediate' ? 20 : 10;
    score += experienceScore;

    // Availability (20% of score)
    const availabilityScore = volunteer.availability === 'full-time' ? 20 :
                             volunteer.availability === 'part-time' ? 15 : 10;
    score += availabilityScore;

    // Application completeness (10% of score)
    const completenessScore = (application.cover_letter ? 5 : 0) +
                             (volunteer.phone ? 2.5 : 0) +
                             (volunteer.address ? 2.5 : 0);
    score += completenessScore;

    return Math.round(score);
  };

  // Sort applications
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return calculateApplicationScore(b) - calculateApplicationScore(a);
      case 'match':
        const aMatch = calculateApplicationScore(a);
        const bMatch = calculateApplicationScore(b);
        return bMatch - aMatch;
      case 'date':
      default:
        return new Date(b.created_at || b.application_date) - new Date(a.created_at || a.application_date);
    }
  });

  return (
    <>
      <Head>
        <title>Applications - Organization Dashboard</title>
        <meta name="description" content="Manage volunteer applications for your organization" />
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Volunteer Applications</h1>
            <p className="text-gray-600 mt-1">Review and manage applications to your opportunities</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BriefcaseIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircleIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by volunteer name, opportunity, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
            <div className="text-gray-500">Loading applications...</div>
          </div>
        ) : apiError ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
            <div className="text-red-600 font-semibold">{apiError}</div>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
            <BriefcaseIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500 text-lg">
              {applications.length === 0 ? "No applications received yet" : "No applications match your filters"}
            </div>
            <p className="text-gray-400 mt-2">
              {applications.length === 0
                ? "Applications will appear here when volunteers apply to your opportunities"
                : "Try adjusting your search or filter criteria"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onQuickAction={handleQuickAction}
                actionLoading={actionLoading[app.id]}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// Application Card Component
function ApplicationCard({ application, onQuickAction, actionLoading }) {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Main Info */}
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-gray-400" />
                {application.volunteer_name || application.volunteer?.name || "Unknown Volunteer"}
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                {application.volunteer_email || application.volunteer?.email || "No email provided"}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
              {application.status || 'Unknown'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <BriefcaseIcon className="w-4 h-4 text-gray-400" />
              <span className="font-medium">Opportunity:</span>
              <span>{application.opportunity_title || application.opportunity?.title || "Unknown"}</span>
            </div>

            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-gray-400" />
              <span className="font-medium">Applied:</span>
              <span>{formatDate(application.applied_at || application.applied_on)}</span>
            </div>

            {application.opportunity?.location && (
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Location:</span>
                <span>{application.opportunity.location}</span>
              </div>
            )}

            {application.responded_at && (
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Responded:</span>
                <span>{formatDate(application.responded_at)}</span>
              </div>
            )}
          </div>

          {/* Skills Match */}
          {application.volunteer?.skills && application.opportunity?.skills && (
            <div className="flex flex-wrap gap-1">
              {application.volunteer.skills.slice(0, 3).map((skill, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-1 rounded-full text-xs ${
                    application.opportunity.skills.includes(skill)
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {skill}
                </span>
              ))}
              {application.volunteer.skills.length > 3 && (
                <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                  +{application.volunteer.skills.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 lg:flex-col lg:w-48">
          <Link
            href={`/organization/applications/${application.id}`}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <EyeIcon className="w-4 h-4" />
            View Details
          </Link>

          {/* CV Download Button */}
          {application.volunteer?.volunteer_profile?.cv_url ? (
            <a
              href={application.volunteer.volunteer_profile.cv_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download CV
            </a>
          ) : (
            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              No CV
            </div>
          )}

          {application.status?.toLowerCase() === 'pending' && (
            <div className="flex gap-2">
              <button
                onClick={() => onQuickAction(application.id, 'accepted')}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                <CheckCircleIcon className="w-4 h-4" />
                Accept
              </button>
              <button
                onClick={() => onQuickAction(application.id, 'rejected')}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                <XCircleIcon className="w-4 h-4" />
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}