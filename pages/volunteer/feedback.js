import React, { useEffect, useState } from "react";
import Head from "next/head";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
  StarIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  BriefcaseIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function VolunteerFeedback() {
  const { token } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setApiError("");

    axios
      .get(`${API_BASE}/my-feedback-alt`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setFeedback(res.data.data || res.data || []);
      })
      .catch(() => setApiError("Failed to load feedback."))
      .finally(() => setLoading(false));
  }, [token]);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${
          i < rating ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ));
  };

  return (
    <>
      <Head>
        <title>My Feedback - Volunteer Dashboard</title>
        <meta name="description" content="View feedback received from organizations" />
      </Head>

      <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Feedback</h1>
                <p className="text-gray-600 mt-1">View feedback received from organizations</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ChartBarIcon className="w-5 h-5" />
                <span>{feedback.length} feedback received</span>
              </div>
            </div>

            {/* Feedback List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center gap-2 text-gray-600">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                  Loading feedback...
                </div>
              </div>
            ) : apiError ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {apiError}
                </div>
              </div>
            ) : feedback.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <StarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback received yet</h3>
                  <p className="text-gray-600">
                    Complete volunteer work to receive feedback from organizations.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Feedback from Organizations</h2>
                <div className="grid gap-6">
                  {feedback.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <BuildingOfficeIcon className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {item.application?.opportunity?.title || item.opportunity_title || "Volunteer Work"}
                              </h3>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <BuildingOfficeIcon className="w-4 h-4" />
                                From: {item.fromUser?.name || item.organization_name || "Organization"}
                              </p>
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <CalendarIcon className="w-3 h-3" />
                                {new Date(item.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }, (_, i) => (
                              <StarIcon
                                key={i}
                                className={`w-5 h-5 ${
                                  i < (item.rating || 0)
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {item.rating || 0}/5
                          </span>
                        </div>
                      </div>

                      {item.comments && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <div className="flex items-start gap-2">
                            <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-medium text-gray-800 mb-1">Organization Comments:</h4>
                              <p className="text-gray-700 text-sm leading-relaxed">{item.comments}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <BriefcaseIcon className="w-4 h-4" />
                            Application #{item.application_id}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Organization Feedback
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
      </div>
    </>
  );
}
