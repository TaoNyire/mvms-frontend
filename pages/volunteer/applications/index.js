import { useState, useEffect } from "react";
import Head from "next/head";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/router";
import axios from "axios";
import {
  BriefcaseIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function Applications() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [applications, setApplications] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!token) return;
    fetchApplications();
  }, [token]);

  const fetchApplications = async () => {
    try {
      setApiLoading(true);
      setApiError("");

      console.log('Fetching applications from:', `${API_BASE}/my-applications`);

      const response = await axios.get(`${API_BASE}/my-applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Applications response:", response.data);
      const applicationsData = response.data?.data || response.data || [];
      setApplications(applicationsData);

    } catch (error) {
      console.error("Applications error:", error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });

      // Set empty array - no sample data
      console.log('API error - no applications data available');
      setApplications([]);

      // Set appropriate error message
      if (error.response?.status === 401) {
        setApiError("Authentication failed. Please log in again.");
      } else if (error.response?.status === 403) {
        setApiError("Access denied. Please check your permissions.");
      } else if (error.response?.status === 500) {
        setApiError("Server error. Please try again later.");
      } else if (!error.response) {
        setApiError("Network error. Please check your connection and try again.");
      } else {
        setApiError(`Failed to load applications (Error ${error.response?.status || 'Unknown'}). Please try again.`);
      }

    } finally {
      setApiLoading(false);
    }
  };

  // Filter applications
  const filteredApplications = applications.filter(app => {
    if (filter === "all") return true;
    return app.status?.toLowerCase() === filter;
  });

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'accepted':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || !user || apiLoading)
    return <div className="text-center mt-10">Loading...</div>;

  return (
    <>
      <Head>
        <title>My Applications - Volunteer Panel</title>
        <meta name="description" content="View and manage your volunteer applications" />
      </Head>

      <div className="space-y-4 sm:space-y-6">
        {/* Error Message */}
        {apiError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{apiError}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-green-700">My Applications</h1>
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'accepted', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <BriefcaseIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-sm sm:text-base px-4">
              {filter === 'all'
                ? "You have not applied to any opportunities yet."
                : `No ${filter} applications found.`}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => router.push('/volunteer/opportunities')}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Browse Opportunities
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 truncate">
                      {app.opportunity?.title || app.opportunity_title || "Unknown Opportunity"}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">
                      Organization: {app.opportunity?.organization?.name || app.organization_name || "Unknown"}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Applied: {new Date(app.created_at || app.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 self-start">
                    {getStatusIcon(app.status)}
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                      {app.status || 'Pending'}
                    </span>
                  </div>
                </div>

                {app.opportunity?.description && (
                  <p className="text-gray-700 mb-4 text-xs sm:text-sm line-clamp-2">
                    {app.opportunity.description}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="text-xs sm:text-sm text-gray-500">
                    {app.opportunity?.location && (
                      <span>📍 {app.opportunity.location}</span>
                    )}
                  </div>
                  <button
                    onClick={() => router.push(`/volunteer/applications/${app.id}`)}
                    className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}