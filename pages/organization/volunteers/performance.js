import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import {
  UserIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  TrophyIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function VolunteerPerformance() {
  const { token } = useAuth();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [sortBy, setSortBy] = useState('overall_rating');
  const [filterBy, setFilterBy] = useState('all');

  const fetchVolunteerPerformance = useCallback(async () => {
    try {
      setLoading(true);
      setApiError("");

      // Fetch task assignments with volunteer performance data
      const response = await axios.get(`${API_BASE}/task-assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const assignments = response.data.assignments || [];
      
      // Group assignments by volunteer and calculate performance metrics
      const volunteerMetrics = assignments.reduce((acc, assignment) => {
        const volunteerId = assignment.volunteer?.id;
        const volunteerName = assignment.volunteer?.name;
        const volunteerEmail = assignment.volunteer?.email;
        
        if (!volunteerId) return acc;

        if (!acc[volunteerId]) {
          acc[volunteerId] = {
            id: volunteerId,
            name: volunteerName,
            email: volunteerEmail,
            totalTasks: 0,
            completedTasks: 0,
            onTimeTasks: 0,
            totalHours: 0,
            averageRating: 0,
            ratings: [],
            recentTasks: [],
            skills: new Set(),
            reliability: 0,
            efficiency: 0
          };
        }

        const volunteer = acc[volunteerId];
        volunteer.totalTasks++;
        volunteer.totalHours += parseFloat(assignment.hours_logged || 0);
        volunteer.recentTasks.push(assignment);

        if (assignment.status === 'completed') {
          volunteer.completedTasks++;
          
          // Check if completed on time
          const dueDate = assignment.opportunity_task?.due_date;
          const completedDate = assignment.completed_at;
          if (dueDate && completedDate && new Date(completedDate) <= new Date(dueDate)) {
            volunteer.onTimeTasks++;
          }

          // Add quality rating if available
          if (assignment.quality_rating) {
            const ratingValue = getRatingValue(assignment.quality_rating);
            volunteer.ratings.push(ratingValue);
          }
        }

        return acc;
      }, {});

      // Calculate derived metrics
      const volunteerList = Object.values(volunteerMetrics).map(volunteer => {
        volunteer.completionRate = volunteer.totalTasks > 0 ? 
          (volunteer.completedTasks / volunteer.totalTasks * 100) : 0;
        
        volunteer.reliability = volunteer.completedTasks > 0 ? 
          (volunteer.onTimeTasks / volunteer.completedTasks * 100) : 0;
        
        volunteer.averageRating = volunteer.ratings.length > 0 ? 
          volunteer.ratings.reduce((sum, rating) => sum + rating, 0) / volunteer.ratings.length : 0;
        
        volunteer.efficiency = volunteer.totalHours > 0 ? 
          (volunteer.completedTasks / volunteer.totalHours * 10) : 0;

        // Calculate overall performance score
        volunteer.overall_rating = (
          volunteer.completionRate * 0.3 +
          volunteer.reliability * 0.3 +
          volunteer.averageRating * 20 * 0.25 +
          volunteer.efficiency * 0.15
        );

        return volunteer;
      });

      setVolunteers(volunteerList);
      setApiError("");

    } catch (error) {
      console.error("Failed to load volunteer performance:", error);
      setVolunteers([]);
      setApiError("Failed to load volunteer performance data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchVolunteerPerformance();
  }, [token, fetchVolunteerPerformance]);

  const getRatingValue = (rating) => {
    switch (rating) {
      case 'excellent': return 5;
      case 'good': return 4;
      case 'fair': return 3;
      case 'poor': return 2;
      default: return 3;
    }
  };

  const getRatingText = (rating) => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 3.5) return 'Good';
    if (rating >= 2.5) return 'Fair';
    return 'Needs Improvement';
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600 bg-green-100';
    if (rating >= 3.5) return 'text-blue-600 bg-blue-100';
    if (rating >= 2.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const sortedVolunteers = [...volunteers].sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'completion_rate': return b.completionRate - a.completionRate;
      case 'reliability': return b.reliability - a.reliability;
      case 'total_hours': return b.totalHours - a.totalHours;
      case 'overall_rating': 
      default: return b.overall_rating - a.overall_rating;
    }
  });

  const filteredVolunteers = sortedVolunteers.filter(volunteer => {
    switch (filterBy) {
      case 'high_performers': return volunteer.overall_rating >= 80;
      case 'active': return volunteer.totalTasks >= 3;
      case 'new': return volunteer.totalTasks < 3;
      case 'all':
      default: return true;
    }
  });

  if (loading) {
    return (
      <>
        <Head>
          <title>Volunteer Performance - Organization Dashboard</title>
          <meta name="description" content="Track volunteer performance and analytics" />
        </Head>
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              Loading performance data...
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Volunteer Performance - Organization Dashboard</title>
        <meta name="description" content="Track volunteer performance and analytics" />
      </Head>

      <div className="space-y-6">
        {/* Error Message */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {apiError}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ChartBarIcon className="w-8 h-8 text-blue-600" />
              Volunteer Performance Analytics
            </h1>
            <p className="text-gray-600 mt-1">Track volunteer performance, ratings, and engagement metrics</p>
          </div>
          
          <div className="flex gap-3">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="all">All Volunteers</option>
              <option value="high_performers">High Performers</option>
              <option value="active">Active (3+ tasks)</option>
              <option value="new">New Volunteers</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="overall_rating">Overall Rating</option>
              <option value="name">Name</option>
              <option value="completion_rate">Completion Rate</option>
              <option value="reliability">Reliability</option>
              <option value="total_hours">Total Hours</option>
            </select>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Volunteers</p>
                <p className="text-2xl font-bold text-blue-600">{volunteers.length}</p>
              </div>
              <UserIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Performers</p>
                <p className="text-2xl font-bold text-green-600">
                  {volunteers.filter(v => v.overall_rating >= 80).length}
                </p>
              </div>
              <TrophyIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Completion Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {volunteers.length > 0 ? 
                    Math.round(volunteers.reduce((sum, v) => sum + v.completionRate, 0) / volunteers.length) : 0}%
                </p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round(volunteers.reduce((sum, v) => sum + v.totalHours, 0))}
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Volunteer Performance List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Volunteer Performance</h2>
          </div>

          {filteredVolunteers.length === 0 ? (
            <div className="text-center py-12">
              <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-500 mb-2">No volunteer performance data found</div>
              <div className="text-sm text-gray-400">Volunteers need to complete tasks to generate performance metrics</div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredVolunteers.map((volunteer) => (
                <VolunteerPerformanceCard
                  key={volunteer.id}
                  volunteer={volunteer}
                  getRatingText={getRatingText}
                  getRatingColor={getRatingColor}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Component for individual volunteer performance cards
function VolunteerPerformanceCard({ volunteer, getRatingText, getRatingColor }) {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{volunteer.name}</h3>
              <p className="text-sm text-gray-600">{volunteer.email}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRatingColor(volunteer.averageRating)}`}>
              {getRatingText(volunteer.averageRating)}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{Math.round(volunteer.overall_rating)}</div>
              <div className="text-xs text-gray-500">Overall Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{volunteer.completedTasks}</div>
              <div className="text-xs text-gray-500">Tasks Done</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{Math.round(volunteer.completionRate)}%</div>
              <div className="text-xs text-gray-500">Completion</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{Math.round(volunteer.reliability)}%</div>
              <div className="text-xs text-gray-500">On-Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{Math.round(volunteer.totalHours)}</div>
              <div className="text-xs text-gray-500">Hours</div>
            </div>
          </div>

          {/* Performance Bars */}
          <div className="space-y-2 mb-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-medium">{Math.round(volunteer.completionRate)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(volunteer.completionRate, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Reliability (On-Time)</span>
                <span className="font-medium">{Math.round(volunteer.reliability)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(volunteer.reliability, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {showDetails && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Recent Tasks</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {volunteer.recentTasks.slice(0, 5).map((task, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{task.opportunity_task?.title}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      {task.quality_rating && (
                        <div className="flex items-center gap-1">
                          <StarIcon className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs">{task.quality_rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
    </div>
  );
}