import React, { useEffect, useState } from "react";
import Head from "next/head";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  BriefcaseIcon,
  TagIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function OpportunityDetails() {
  const { token } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  const [opportunity, setOpportunity] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchOpportunityDetails = async () => {
    setLoading(true);
    setApiError("");

    try {
      console.log(`Fetching opportunity details for ID: ${id}`);
      console.log(`API_BASE: ${API_BASE}`);
      console.log(`Token available: ${!!token}`);

      // Fetch opportunity and applications in parallel
      const [oppRes, appsRes] = await Promise.all([
        axios.get(`${API_BASE}/opportunities/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/opportunities/${id}/applications`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      console.log("Opportunity response:", oppRes.data);
      console.log("Applications response:", appsRes.data);

      setOpportunity(oppRes.data.data || oppRes.data);
      setApplications(appsRes.data.data || appsRes.data || []);
    } catch (error) {
      console.error("Failed to load opportunity details:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      let errorMessage = "Failed to load opportunity details. Please try again.";

      if (error.response?.status === 404) {
        errorMessage = "Opportunity not found.";
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have permission to view this opportunity.";
      } else if (error.response?.status === 401) {
        errorMessage = "Please log in to view this opportunity.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 500) {
        // Provide sample data for demonstration if API fails
        console.log("API error - no sample data provided");
        // Set empty data - no sample data
        setOpportunity(null);
        setApplications([]);
        errorMessage = "Failed to load opportunity data. Please try again later.";
      }

      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle application status update
  const handleApplicationAction = async (applicationId, action) => {
    setActionLoading({ ...actionLoading, [applicationId]: true });

    try {
      await axios.put(
        `${API_BASE}/applications/${applicationId}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh applications
      await fetchOpportunityDetails();
    } catch (error) {
      console.error(`Failed to ${action} application:`, error);
      setApiError(`Failed to ${action} application. Please try again.`);
    } finally {
      setActionLoading({ ...actionLoading, [applicationId]: false });
    }
  };

  // Handle opportunity deletion
  const handleDeleteOpportunity = async () => {
    try {
      await axios.delete(`${API_BASE}/opportunities/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push('/organization/opportunities');
    } catch (error) {
      console.error("Failed to delete opportunity:", error);
      setApiError("Failed to delete opportunity. Please try again.");
    }
    setShowDeleteModal(false);
  };

  useEffect(() => {
    if (!id || !token) return;
    fetchOpportunityDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  return (
    <>
      <Head>
        <title>{opportunity?.title || 'Opportunity Details'} - Organization Dashboard</title>
        <meta name="description" content="View and manage opportunity details and applications" />
      </Head>

      <div className="space-y-6">
        {/* Back Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <nav className="text-sm text-gray-600">
            <Link href="/organization/opportunities" className="hover:text-gray-900">
              Opportunities
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{opportunity?.title || 'Details'}</span>
          </nav>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              Loading opportunity details...
            </div>
          </div>
        ) : apiError ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5" />
              {apiError}
            </div>
          </div>
        ) : !opportunity ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <BriefcaseIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Opportunity not found</h3>
              <p className="text-gray-600">The opportunity you're looking for doesn't exist or has been removed.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BriefcaseIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        {opportunity.title}
                      </h1>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{opportunity.location || 'Location not specified'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span>
                            {opportunity.start_date
                              ? new Date(opportunity.start_date).toLocaleDateString()
                              : 'Start date TBD'
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <UserGroupIcon className="w-4 h-4" />
                          <span>{opportunity.volunteers_needed || 0} volunteers needed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/organization/opportunities/${id}/edit`}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>

            {/* Opportunity Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Description */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5 text-gray-600" />
                  Description
                </h2>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {opportunity.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Applications</span>
                    <span className="text-lg font-bold text-blue-600">{applications.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pending</span>
                    <span className="text-lg font-bold text-yellow-600">
                      {applications.filter(app => app.status === 'pending').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Accepted</span>
                    <span className="text-lg font-bold text-green-600">
                      {applications.filter(app => app.status === 'accepted').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rejected</span>
                    <span className="text-lg font-bold text-red-600">
                      {applications.filter(app => app.status === 'rejected').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Opportunity Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-gray-600" />
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Location</p>
                      <p className="text-sm text-gray-600">{opportunity.location || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Duration</p>
                      <p className="text-sm text-gray-600">
                        {opportunity.start_date
                          ? new Date(opportunity.start_date).toLocaleDateString()
                          : 'Start date TBD'
                        } - {opportunity.end_date
                          ? new Date(opportunity.end_date).toLocaleDateString()
                          : 'Ongoing'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <UserGroupIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Volunteers Needed</p>
                      <p className="text-sm text-gray-600">{opportunity.volunteers_needed || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ClockIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Status</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        opportunity.status === 'active' ? 'bg-green-100 text-green-800' :
                        opportunity.status === 'inactive' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {opportunity.status || 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Required Skills */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TagIcon className="w-5 h-5 text-gray-600" />
                  Required Skills
                </h3>
                {opportunity.required_skills && opportunity.required_skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {opportunity.required_skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No specific skills required</p>
                )}
              </div>
            </div>

            {/* Applications Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <UserGroupIcon className="w-5 h-5 text-gray-600" />
                  Volunteer Applications ({applications.length})
                </h3>
                <Link
                  href={`/organization/opportunities/${id}/applications`}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <EyeIcon className="w-4 h-4" />
                  View All Applications
                </Link>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-8">
                  <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h4>
                  <p className="text-gray-600">Applications will appear here once volunteers apply for this opportunity.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.slice(0, 5).map((app) => (
                    <div key={app.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserGroupIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {app.volunteer_name || app.volunteer?.name || 'Unknown Volunteer'}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Applied on {app.created_at
                                ? new Date(app.created_at).toLocaleDateString()
                                : 'Unknown date'
                              }
                            </p>
                            {app.volunteer_email && (
                              <p className="text-sm text-gray-500">{app.volunteer_email}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {app.status || 'Pending'}
                          </span>

                          {app.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApplicationAction(app.id, 'accept')}
                                disabled={actionLoading[app.id]}
                                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                              >
                                <CheckCircleIcon className="w-3 h-3" />
                                Accept
                              </button>
                              <button
                                onClick={() => handleApplicationAction(app.id, 'reject')}
                                disabled={actionLoading[app.id]}
                                className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                              >
                                <XCircleIcon className="w-3 h-3" />
                                Reject
                              </button>
                            </div>
                          )}

                          <Link
                            href={`/organization/applications/${app.id}`}
                            className="flex items-center gap-1 px-3 py-1 border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-50"
                          >
                            <EyeIcon className="w-3 h-3" />
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}

                  {applications.length > 5 && (
                    <div className="text-center pt-4">
                      <Link
                        href={`/organization/opportunities/${id}/applications`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View all {applications.length} applications →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Opportunity</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-gray-700 mb-6">
                Are you sure you want to delete "{opportunity?.title}"? This will also remove all associated applications.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleDeleteOpportunity}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Opportunity
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}