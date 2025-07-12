import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import FeedbackInitiator from "../../../components/feedback/FeedbackInitiator";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function ApplicationDetail() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  const [application, setApplication] = useState(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!id || !token) return;
    setApiLoading(true);
    setApiError("");

    axios
      .get(`${API_BASE}/applications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("Application detail response:", res.data);
        setApplication(res.data.application || res.data);
      })
      .catch((error) => {
        console.error("Application detail error:", error);
        setApiError("Failed to load application details.");
      })
      .finally(() => setApiLoading(false));
  }, [id, token]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <ClockIcon className="w-6 h-6 text-yellow-500" />;
      case 'accepted':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="w-6 h-6 text-red-500" />;
      default:
        return <ClockIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading || apiLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-green-600">Loading application details...</div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{apiError}</div>
        <button
          onClick={() => router.push("/volunteer/applications")}
          className="text-green-600 hover:text-green-700"
        >
          ← Back to Applications
        </button>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-4">Application not found.</div>
        <button
          onClick={() => router.push("/volunteer/applications")}
          className="text-green-600 hover:text-green-700"
        >
          ← Back to Applications
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Application Details - Volunteer Panel</title>
        <meta name="description" content="View your application details" />
      </Head>

      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push("/volunteer/applications")}
            className="flex items-center text-green-600 hover:text-green-700 transition-colors text-sm sm:text-base"
          >
            <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
            Back to Applications
          </button>
        </div>

        {/* Application Status */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 break-words">
                {application.opportunity?.title || application.opportunity_title || "Application Details"}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Application ID: #{application.id}
              </p>
            </div>
            <div className="flex items-center space-x-2 self-start">
              {getStatusIcon(application.status)}
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(application.status)}`}>
                {application.status || 'Pending'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <span className="font-medium text-gray-700">Applied:</span>
              <span className="ml-2 text-gray-600">
                {new Date(application.created_at || application.applied_at).toLocaleDateString()}
              </span>
            </div>
            {application.updated_at && (
              <div>
                <span className="font-medium text-gray-700">Last Updated:</span>
                <span className="ml-2 text-gray-600">
                  {new Date(application.updated_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Feedback Section */}
        {application && (
          <div className="mt-8">
            <FeedbackInitiator
              applicationId={application.id}
              userType="volunteer"
              trigger="card"
              className="w-full"
            />
          </div>
        )}
      </div>
    </>
  );
}