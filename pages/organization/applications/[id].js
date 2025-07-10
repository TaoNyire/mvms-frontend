import React, { useEffect, useState } from "react";
import OrgLayout from "../../../components/organization/OrgLayout";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  StarIcon,
  AcademicCapIcon,
  HeartIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function ViewApplication() {
  const { token } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [selectedAction, setSelectedAction] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Feedback states
  const [feedbackStatus, setFeedbackStatus] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComments, setFeedbackComments] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState("");

  // Fetch application details from backend
  useEffect(() => {
    if (!id || !token) return;
    fetchApplicationDetails();
  }, [id, token]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      setApiError("");

      console.log(`Fetching application details for ID: ${id}`);

      const response = await axios.get(`${API_BASE}/applications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Application response:", response.data);

      const applicationData = response.data.data || response.data;
      setApplication(applicationData);
      document.title = `Application #${id} - ${applicationData.volunteer?.name || 'Unknown Volunteer'}`;

    } catch (error) {
      console.error("Failed to load application:", error);
      console.error("Error response:", error.response?.data);

      if (error.response?.status === 500) {
        // Set empty data - no sample data
        setApplication(null);
        setApiError("Server error. Please try again later.");
      } else {
        setApiError("Failed to load application. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch feedback status
  useEffect(() => {
    if (!id || !token || !application) return;

    axios
      .get(`${API_BASE}/applications/${id}/feedback-status`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setFeedbackStatus(res.data);
      })
      .catch((error) => {
        console.error("Failed to load feedback status:", error);
      });
  }, [id, token, application]);

  // Handle application response (accept/reject)
  const handleApplicationResponse = async (status) => {
    if (!application) return;

    setActionLoading(true);
    setActionError("");
    setActionSuccess("");

    try {
      await axios.put(
        `${API_BASE}/applications/${application.id}/respond`,
        {
          status: status,
          message: responseMessage || undefined
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setApplication(prev => ({
        ...prev,
        status: status,
        responded_at: new Date().toISOString(),
        response_message: responseMessage
      }));

      setActionSuccess(`Application ${status} successfully!`);
      setShowResponseForm(false);
      setResponseMessage("");

    } catch (error) {
      console.error('Failed to respond to application:', error);
      setActionError(error.response?.data?.message || 'Failed to update application. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle feedback submission
  const handleSubmitFeedback = async () => {
    if (!application || feedbackRating === 0) {
      setFeedbackError("Please provide a rating");
      return;
    }

    setFeedbackLoading(true);
    setFeedbackError("");

    try {
      await axios.post(
        `${API_BASE}/applications/${application.id}/feedback`,
        {
          rating: feedbackRating,
          comments: feedbackComments
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setApplication(prev => ({
        ...prev,
        feedback_rating: feedbackRating,
        feedback_comment: feedbackComments
      }));

      setFeedbackSuccess("Feedback submitted successfully!");
      setShowFeedbackForm(false);
      setFeedbackRating(0);
      setFeedbackComments("");

      // Hide success message after 3 seconds
      setTimeout(() => setFeedbackSuccess(""), 3000);

    } catch (error) {
      console.error('Failed to submit feedback:', error);
      setFeedbackError(error.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Handle canceling feedback
  const handleCancelFeedback = () => {
    setShowFeedbackForm(false);
    setFeedbackRating(0);
    setFeedbackComments("");
    setFeedbackError("");
  };

  return (
    <OrgLayout>
      <Head>
        <title>Application Details - MVMS</title>
        <meta name="description" content="View volunteer application details" />
      </Head>

      {/* Error Message */}
      {apiError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg flex items-center gap-2 mb-6">
          <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="inline-flex items-center gap-2 text-emerald-600">
            <div className="w-6 h-6 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin"></div>
            <span className="font-medium">Loading application details...</span>
          </div>
        </div>
      ) : !application ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">Application not found.</div>
        </div>
      ) : (
        <>
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/organization/applications" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors">
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-medium">Back to Applications</span>
            </Link>
          </div>

          {/* Application Header Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Application #{application.id}</h1>
                  <p className="text-emerald-100 text-lg">
                    {application.volunteer?.name || 'Unknown Volunteer'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="mb-2">
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                      (application.status || "").toLowerCase() === "pending"
                        ? "bg-amber-100 text-amber-800"
                        : (application.status || "").toLowerCase() === "accepted"
                        ? "bg-green-100 text-green-800"
                        : (application.status || "").toLowerCase() === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {application.status || 'Unknown'}
                    </span>
                  </div>
                  <p className="text-emerald-100 text-sm">
                    Applied {new Date(application.applied_at || application.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Volunteer Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Volunteer Information Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Volunteer Information</h2>
                      <p className="text-gray-600">Personal details and contact information</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium text-gray-900">{application.volunteer?.email || 'Not provided'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <PhoneIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium text-gray-900">{application.volunteer?.phone || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <MapPinIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Location</p>
                          <p className="font-medium text-gray-900">{application.volunteer?.location || 'Not provided'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <CalendarIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Applied On</p>
                          <p className="font-medium text-gray-900">
                            {new Date(application.applied_at || application.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Volunteer Profile Card */}
                {application.volunteer?.profile && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Volunteer Profile</h2>
                        <p className="text-gray-600">Background and experience</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {application.volunteer.profile.bio && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">Biography</h3>
                          <p className="text-gray-600 leading-relaxed">{application.volunteer.profile.bio}</p>
                        </div>
                      )}

                      {application.volunteer.profile.motivation && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">Motivation</h3>
                          <p className="text-gray-600 leading-relaxed">{application.volunteer.profile.motivation}</p>
                        </div>
                      )}

                      {application.volunteer.profile.experience && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">Experience</h3>
                          <p className="text-gray-600 leading-relaxed">{application.volunteer.profile.experience}</p>
                        </div>
                      )}

                      {application.volunteer.profile.availability && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">Availability</h3>
                          <p className="text-gray-600 leading-relaxed">{application.volunteer.profile.availability}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Skills Card */}
                {application.volunteer?.profile?.skills && application.volunteer.profile.skills.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <AcademicCapIcon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Skills & Expertise</h2>
                        <p className="text-gray-600">Volunteer's skills and capabilities</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {application.volunteer.profile.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Opportunity & Actions */}
              <div className="space-y-6">
                {/* Opportunity Details Card */}
                {application.opportunity && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <BriefcaseIcon className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Opportunity</h2>
                        <p className="text-gray-600">Applied position details</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{application.opportunity.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{application.opportunity.description}</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPinIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{application.opportunity.location}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <CalendarIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {new Date(application.opportunity.start_date).toLocaleDateString()} - {new Date(application.opportunity.end_date).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <UserIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{application.opportunity.volunteers_needed} volunteers needed</span>
                        </div>
                      </div>

                      {application.opportunity.skills && application.opportunity.skills.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Required Skills</h4>
                          <div className="flex flex-wrap gap-1">
                            {application.opportunity.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons Card */}
                {application.status === "pending" && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Actions</h2>
                        <p className="text-gray-600">Respond to this application</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <button
                        onClick={() => {
                          setSelectedAction("accepted");
                          setShowResponseForm(true);
                        }}
                        disabled={actionLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                        Accept Application
                      </button>

                      <button
                        onClick={() => {
                          setSelectedAction("rejected");
                          setShowResponseForm(true);
                        }}
                        disabled={actionLoading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <XCircleIcon className="w-5 h-5" />
                        Reject Application
                      </button>
                    </div>
                  </div>
                )}

                {/* Feedback Card */}
                {application.status === "accepted" && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <StarIcon className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Feedback</h2>
                        <p className="text-gray-600">Rate volunteer performance</p>
                      </div>
                    </div>

                    {application.feedback_rating ? (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Your Rating</p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIconSolid
                                key={star}
                                className={`w-5 h-5 ${
                                  star <= application.feedback_rating
                                    ? "text-amber-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-sm text-gray-600">
                              ({application.feedback_rating}/5)
                            </span>
                          </div>
                        </div>

                        {application.feedback_comment && (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Your Comment</p>
                            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg text-sm">
                              {application.feedback_comment}
                            </p>
                          </div>
                        )}

                        <button
                          onClick={() => setShowFeedbackForm(true)}
                          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          Update Feedback
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowFeedbackForm(true)}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <StarIcon className="w-5 h-5" />
                        Provide Feedback
                      </button>
                    )}
                  </div>
                )}

                {/* Application Status Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <ClockIcon className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Timeline</h2>
                      <p className="text-gray-600">Application progress</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">Application Submitted</p>
                        <p className="text-sm text-gray-600">
                          {new Date(application.applied_at || application.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {application.responded_at && (
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          application.status === 'accepted' ? 'bg-emerald-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Application {application.status === 'accepted' ? 'Accepted' : 'Rejected'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(application.responded_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Response Modal */}
            {showResponseForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {selectedAction === "accepted" ? "Accept Application" : "Reject Application"}
                      </h3>
                      <button
                        onClick={() => {
                          setShowResponseForm(false);
                          setResponseMessage("");
                          setActionError("");
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XCircleIcon className="w-6 h-6" />
                      </button>
                    </div>

                    {actionError && (
                      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
                        {actionError}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Message to Volunteer (Optional)
                        </label>
                        <textarea
                          value={responseMessage}
                          onChange={(e) => setResponseMessage(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder={`Add a ${selectedAction === "accepted" ? "welcome" : "rejection"} message...`}
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApplicationResponse(selectedAction)}
                          disabled={actionLoading}
                          className={`flex-1 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 ${
                            selectedAction === "accepted"
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : "bg-red-600 hover:bg-red-700 text-white"
                          } disabled:opacity-50`}
                        >
                          {actionLoading ? "Processing..." : `${selectedAction === "accepted" ? "Accept" : "Reject"} Application`}
                        </button>
                        <button
                          onClick={() => {
                            setShowResponseForm(false);
                            setResponseMessage("");
                            setActionError("");
                          }}
                          disabled={actionLoading}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Feedback Modal */}
            {showFeedbackForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">Provide Feedback</h3>
                      <button
                        onClick={handleCancelFeedback}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XCircleIcon className="w-6 h-6" />
                      </button>
                    </div>

                    {feedbackError && (
                      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
                        {feedbackError}
                      </div>
                    )}

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Rating
                        </label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setFeedbackRating(star)}
                              className="focus:outline-none"
                            >
                              <StarIconSolid
                                className={`w-8 h-8 transition-colors ${
                                  star <= feedbackRating
                                    ? "text-amber-400"
                                    : "text-gray-300 hover:text-amber-200"
                                }`}
                              />
                            </button>
                          ))}
                          <span className="ml-2 text-sm text-gray-600">
                            ({feedbackRating}/5)
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Comments
                        </label>
                        <textarea
                          value={feedbackComments}
                          onChange={(e) => setFeedbackComments(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          placeholder="Share your experience working with this volunteer..."
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleSubmitFeedback}
                          disabled={feedbackLoading}
                          className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
                        >
                          {feedbackLoading ? "Submitting..." : "Submit Feedback"}
                        </button>
                        <button
                          onClick={handleCancelFeedback}
                          disabled={feedbackLoading}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Success Messages */}
          {actionSuccess && (
            <div className="fixed bottom-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5" />
                <span>{actionSuccess}</span>
              </div>
            </div>
          )}

          {feedbackSuccess && (
            <div className="fixed bottom-4 right-4 bg-amber-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
              <div className="flex items-center gap-2">
                <StarIcon className="w-5 h-5" />
                <span>{feedbackSuccess}</span>
              </div>
            </div>
          )}
        </>
      )}
    </OrgLayout>
  );
}