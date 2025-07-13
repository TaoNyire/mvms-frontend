import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  StarIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function FeedbackInitiator({ 
  applicationId, 
  userType, // 'volunteer' or 'organization'
  onFeedbackSubmitted,
  className = "",
  trigger = "button" // "button", "auto", "card"
}) {
  const { token } = useAuth();
  const [feedbackStatus, setFeedbackStatus] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (applicationId && token) {
      fetchFeedbackStatus();
    }
  }, [applicationId, token]);

  const fetchFeedbackStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/applications/${applicationId}/feedback-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedbackStatus(response.data);
    } catch (error) {
      console.error('Error fetching feedback status:', error);
    }
  };

  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      setError('Please provide a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endpoint = userType === 'volunteer' 
        ? `/applications/${applicationId}/org-feedback` 
        : `/applications/${applicationId}/feedback`;

      await axios.post(`${API_BASE}${endpoint}`, {
        rating,
        comments
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Feedback submitted successfully!');
      setShowFeedbackForm(false);
      setRating(0);
      setComments('');
      
      // Refresh feedback status
      await fetchFeedbackStatus();
      
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const canSubmitFeedback = () => {
    if (!feedbackStatus) return false;
    
    return userType === 'volunteer' 
      ? feedbackStatus.can_submit_volunteer_feedback
      : feedbackStatus.can_submit_org_feedback;
  };

  const hasSubmittedFeedback = () => {
    if (!feedbackStatus) return false;
    
    return userType === 'volunteer'
      ? feedbackStatus.volunteer_feedback
      : feedbackStatus.org_feedback;
  };

  const getExistingFeedback = () => {
    if (!feedbackStatus) return null;
    
    return userType === 'volunteer'
      ? feedbackStatus.volunteer_feedback
      : feedbackStatus.org_feedback;
  };

  const renderTrigger = () => {
    const existingFeedback = getExistingFeedback();
    
    if (trigger === "auto" && !canSubmitFeedback()) {
      return null;
    }

    if (trigger === "card") {
      return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <StarIcon className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Feedback</h3>
              <p className="text-sm text-gray-600">
                {userType === 'volunteer' 
                  ? 'Rate your experience with this organization'
                  : 'Rate this volunteer\'s performance'
                }
              </p>
            </div>
          </div>

          {existingFeedback ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIconSolid
                      key={star}
                      className={`w-5 h-5 ${
                        star <= existingFeedback.rating ? 'text-amber-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">({existingFeedback.rating}/5)</span>
              </div>
              {existingFeedback.comments && (
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                  {existingFeedback.comments}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Submitted on {new Date(existingFeedback.created_at).toLocaleDateString()}
              </p>
            </div>
          ) : canSubmitFeedback() ? (
            <button
              onClick={() => setShowFeedbackForm(true)}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <StarIcon className="w-4 h-4" />
              Provide Feedback
            </button>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">
                {feedbackStatus?.feedback_allowed 
                  ? 'Feedback already submitted'
                  : 'Feedback will be available after task completion'
                }
              </p>
            </div>
          )}
        </div>
      );
    }

    // Default button trigger
    if (!canSubmitFeedback()) {
      return null;
    }

    return (
      <button
        onClick={() => setShowFeedbackForm(true)}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors ${className}`}
      >
        <StarIcon className="w-4 h-4" />
        {existingFeedback ? 'Update Feedback' : 'Provide Feedback'}
      </button>
    );
  };

  const renderFeedbackModal = () => {
    if (!showFeedbackForm) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {userType === 'volunteer' ? 'Rate Organization' : 'Rate Volunteer'}
              </h3>
              <button
                onClick={() => setShowFeedbackForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <StarIconSolid
                        className={`w-8 h-8 transition-colors ${
                          star <= rating
                            ? "text-amber-400"
                            : "text-gray-300 hover:text-amber-200"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder={
                    userType === 'volunteer'
                      ? "Share your experience working with this organization..."
                      : "Share your experience working with this volunteer..."
                  }
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSubmitFeedback}
                  disabled={loading || rating === 0}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit Feedback"}
                </button>
                <button
                  onClick={() => setShowFeedbackForm(false)}
                  disabled={loading}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderTrigger()}
      {renderFeedbackModal()}
      
      {success && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5" />
            <span>{success}</span>
          </div>
        </div>
      )}
    </>
  );
}
