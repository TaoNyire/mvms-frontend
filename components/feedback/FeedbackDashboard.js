import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  StarIcon,
  ChartBarIcon,
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function FeedbackDashboard({ userType }) {
  const { token } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    recentTrend: 'neutral'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      fetchFeedback();
    }
  }, [token, userType]);

  const fetchFeedback = async () => {
    setLoading(true);
    setError('');

    try {
      const endpoint = userType === 'volunteer' 
        ? '/my-feedback-alt' 
        : '/organization/feedback-received-alt';

      const response = await axios.get(`${API_BASE}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const feedbackData = response.data.data || response.data || [];
      setFeedback(feedbackData);
      calculateStats(feedbackData);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setError('Failed to load feedback data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (feedbackData) => {
    if (feedbackData.length === 0) {
      setStats({
        total: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        recentTrend: 'neutral'
      });
      return;
    }

    const total = feedbackData.length;
    const totalRating = feedbackData.reduce((sum, item) => sum + (item.rating || 0), 0);
    const averageRating = total > 0 ? (totalRating / total).toFixed(1) : 0;

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedbackData.forEach(item => {
      if (item.rating >= 1 && item.rating <= 5) {
        ratingDistribution[item.rating]++;
      }
    });

    // Calculate recent trend (last 5 vs previous 5)
    let recentTrend = 'neutral';
    if (feedbackData.length >= 10) {
      const recent5 = feedbackData.slice(0, 5);
      const previous5 = feedbackData.slice(5, 10);
      
      const recentAvg = recent5.reduce((sum, item) => sum + item.rating, 0) / 5;
      const previousAvg = previous5.reduce((sum, item) => sum + item.rating, 0) / 5;
      
      if (recentAvg > previousAvg + 0.2) recentTrend = 'up';
      else if (recentAvg < previousAvg - 0.2) recentTrend = 'down';
    }

    setStats({ total, averageRating, ratingDistribution, recentTrend });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIconSolid
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-amber-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button 
            onClick={fetchFeedback}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Feedback</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Rating</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
                <div className="flex">
                  {renderStars(Math.round(stats.averageRating))}
                </div>
              </div>
            </div>
            <StarIcon className="w-8 h-8 text-amber-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Recent Trend</p>
              <div className="flex items-center gap-1">
                {stats.recentTrend === 'up' && (
                  <>
                    <ArrowUpIcon className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-green-600">Improving</span>
                  </>
                )}
                {stats.recentTrend === 'down' && (
                  <>
                    <ArrowDownIcon className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-medium text-red-600">Declining</span>
                  </>
                )}
                {stats.recentTrend === 'neutral' && (
                  <span className="text-sm font-medium text-gray-600">Stable</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">5-Star Reviews</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.ratingDistribution[5]}
              </p>
              <p className="text-xs text-gray-500">
                {stats.total > 0 ? Math.round((stats.ratingDistribution[5] / stats.total) * 100) : 0}%
              </p>
            </div>
            <StarIconSolid className="w-8 h-8 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-16">
                <span className="text-sm font-medium">{rating}</span>
                <StarIconSolid className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-amber-400 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: stats.total > 0 
                      ? `${(stats.ratingDistribution[rating] / stats.total) * 100}%` 
                      : '0%'
                  }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">
                {stats.ratingDistribution[rating]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Feedback */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Feedback</h3>
        {feedback.length === 0 ? (
          <div className="text-center py-8">
            <StarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No feedback received yet</p>
            <p className="text-sm text-gray-400 mt-1">
              {userType === 'volunteer' 
                ? 'Complete volunteer work to receive feedback from organizations'
                : 'Feedback from volunteers will appear here after task completion'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedback.slice(0, 5).map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {userType === 'volunteer' ? (
                      <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                    ) : (
                      <UserIcon className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="font-medium text-gray-900">
                      {userType === 'volunteer' 
                        ? (item.from_user?.name || 'Organization')
                        : (item.application?.volunteer?.name || 'Volunteer')
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(item.rating)}
                    <span className="text-sm text-gray-600 ml-1">({item.rating}/5)</span>
                  </div>
                </div>
                
                {item.comments && (
                  <p className="text-gray-700 text-sm mb-2">{item.comments}</p>
                )}
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                  {item.application?.opportunity?.title && (
                    <span>• {item.application.opportunity.title}</span>
                  )}
                </div>
              </div>
            ))}
            
            {feedback.length > 5 && (
              <div className="text-center pt-4">
                <button className="text-blue-600 hover:underline text-sm">
                  View all {feedback.length} feedback
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
