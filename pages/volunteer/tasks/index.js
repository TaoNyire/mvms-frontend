import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
  PauseIcon,
} from "@heroicons/react/24/outline";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function VolunteerTasks() {
  const { token } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchMyAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setApiError("");

      const params = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await axios.get(`${API_BASE}/task-assignments`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      setAssignments(response.data.assignments || []);
      setApiError("");

    } catch (error) {
      console.error("Failed to load my assignments:", error);
      setAssignments([]);

      if (error.response?.status === 401) {
        setApiError("Authentication failed. Please log in again.");
      } else if (error.response?.status === 403) {
        setApiError("Access denied. Please check your permissions.");
      } else {
        setApiError("Failed to load your tasks. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter]);

  useEffect(() => {
    if (!token) return;
    fetchMyAssignments();
  }, [token, fetchMyAssignments]);

  const updateMyProgress = async (assignmentId, progressData) => {
    try {
      await axios.put(`${API_BASE}/task-assignments/${assignmentId}`, progressData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchMyAssignments();
      alert('Progress updated successfully!');
    } catch (error) {
      console.error("Failed to update progress:", error);
      alert("Failed to update progress. Please try again.");
    }
  };

  const startTask = (assignmentId) => {
    updateMyProgress(assignmentId, { status: 'in_progress' });
  };

  const completeTask = (assignmentId) => {
    const notes = prompt("Add completion notes (optional):");
    updateMyProgress(assignmentId, { 
      status: 'completed',
      completion_notes: notes || ''
    });
  };

  const updateProgress = (assignmentId) => {
    const percentage = prompt("Enter progress percentage (0-100):");
    if (percentage && !isNaN(percentage) && percentage >= 0 && percentage <= 100) {
      updateMyProgress(assignmentId, { 
        progress_percentage: parseInt(percentage)
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
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

  if (loading) {
    return (
      <>
        <Head>
          <title>My Tasks - Volunteer Dashboard</title>
          <meta name="description" content="View and manage your assigned tasks" />
        </Head>
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              Loading your tasks...
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>My Tasks - Volunteer Dashboard</title>
        <meta name="description" content="View and manage your assigned tasks" />
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
              <ClipboardDocumentListIcon className="w-8 h-8 text-blue-600" />
              My Tasks
            </h1>
            <p className="text-gray-600 mt-1">View and manage your assigned tasks</p>
          </div>
          
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Tasks</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-blue-600">{assignments.length}</p>
              </div>
              <ClipboardDocumentListIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {assignments.filter(a => a.status === 'in_progress').length}
                </p>
              </div>
              <PlayIcon className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {assignments.filter(a => a.status === 'completed').length}
                </p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-blue-600">
                  {assignments.filter(a => a.status === 'assigned').length}
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Assigned Tasks</h2>
          </div>
          
          {assignments.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-500 mb-2">No tasks assigned yet</div>
              <div className="text-sm text-gray-400">Tasks assigned to you will appear here</div>
            </div>
          ) : (
            <div className="space-y-4 p-6">
              {assignments.map((assignment) => (
                <TaskCard 
                  key={assignment.id} 
                  assignment={assignment} 
                  onStart={startTask}
                  onComplete={completeTask}
                  onUpdateProgress={updateProgress}
                  formatDate={formatDate}
                  getStatusColor={getStatusColor}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Component for task cards
function TaskCard({ assignment, onStart, onComplete, onUpdateProgress, formatDate, getStatusColor }) {
  const task = assignment.opportunity_task;
  const isOverdue = task?.due_date && new Date(task.due_date) < new Date() && assignment.status !== 'completed';

  return (
    <div className={`border rounded-lg p-6 ${isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{task?.title}</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(assignment.status)}`}>
              {assignment.status.replace('_', ' ')}
            </span>
            {isOverdue && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                Overdue
              </span>
            )}
          </div>

          <p className="text-gray-600 mb-3">{task?.description}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 mb-4">
            <div>
              <span className="font-medium">Organization:</span>
              <div>{task?.opportunity?.organization?.name || 'N/A'}</div>
            </div>
            <div>
              <span className="font-medium">Opportunity:</span>
              <div>{task?.opportunity?.title}</div>
            </div>
            <div>
              <span className="font-medium">Priority:</span>
              <div className="capitalize">{task?.priority}</div>
            </div>
            <div>
              <span className="font-medium">Due Date:</span>
              <div>{task?.due_date ? formatDate(task.due_date) : 'No due date'}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-600">{assignment.progress_percentage || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${assignment.progress_percentage || 0}%` }}
              ></div>
            </div>
          </div>

          {/* Assignment Details */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-4">
            <div>
              <span className="font-medium">Assigned:</span>
              <div>{formatDate(assignment.assigned_at)}</div>
            </div>
            <div>
              <span className="font-medium">Hours Logged:</span>
              <div>{assignment.hours_logged || 0} hours</div>
            </div>
            {assignment.started_at && (
              <div>
                <span className="font-medium">Started:</span>
                <div>{formatDate(assignment.started_at)}</div>
              </div>
            )}
            {assignment.completed_at && (
              <div>
                <span className="font-medium">Completed:</span>
                <div>{formatDate(assignment.completed_at)}</div>
              </div>
            )}
          </div>

          {/* Notes */}
          {assignment.assignment_notes && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="font-medium text-blue-900">Assignment Notes:</span>
              <p className="text-blue-800 mt-1">{assignment.assignment_notes}</p>
            </div>
          )}

          {assignment.completion_notes && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="font-medium text-green-900">Completion Notes:</span>
              <p className="text-green-800 mt-1">{assignment.completion_notes}</p>
            </div>
          )}

          {/* Instructions */}
          {task?.instructions && (
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <span className="font-medium text-gray-900">Instructions:</span>
              <p className="text-gray-700 mt-1">{task.instructions}</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        {assignment.status === 'assigned' && (
          <button
            onClick={() => onStart(assignment.id)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <PlayIcon className="w-4 h-4" />
            Start Task
          </button>
        )}

        {assignment.status === 'in_progress' && (
          <>
            <button
              onClick={() => onUpdateProgress(assignment.id)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <PauseIcon className="w-4 h-4" />
              Update Progress
            </button>
            <button
              onClick={() => onComplete(assignment.id)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <CheckCircleIcon className="w-4 h-4" />
              Mark Complete
            </button>
          </>
        )}

        {assignment.status === 'completed' && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircleIcon className="w-5 h-5" />
            <span className="font-medium">Task Completed</span>
          </div>
        )}
      </div>
    </div>
  );
}
