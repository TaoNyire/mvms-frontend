import React, { useState, useEffect } from "react";
import Head from "next/head";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import {
  ClipboardDocumentListIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
  StopIcon,
  StarIcon,
  PencilIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function OrganizationTasks() {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [statusFilter, setStatusFilter] = useState("accepted");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    status: '',
    completion_notes: '',
    feedback_rating: '',
    feedback_comment: ''
  });

  useEffect(() => {
    if (!token) return;
    fetchApplications();
  }, [token, statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setApiError("");

      console.log("Fetching applications...");
      console.log("API_BASE:", API_BASE);
      console.log("Token:", token ? "Present" : "Missing");
      console.log("Status Filter:", statusFilter);

      const response = await axios.get(`${API_BASE}/applications`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: statusFilter }
      });

      console.log("API Response:", response.data);
      setApplications(response.data.data || response.data.applications || []);
      setApiError(""); // Clear any previous errors

    } catch (error) {
      console.error("Failed to load applications:", error);
      console.error("Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });

      // Provide sample data for demonstration if API fails
      console.log("Using sample data due to API error");

      // Always use sample data for now until API is fixed
        setApplications([
          {
            id: 1,
            volunteer: {
              id: 1,
              name: "John Doe",
              email: "john@example.com"
            },
            opportunity: {
              id: 1,
              title: "Community Garden Project",
              location: "Downtown Community Center",
              start_date: "2024-01-15",
              end_date: "2024-02-15"
            },
            status: "accepted",
            applied_at: "2024-01-10T10:00:00Z",
            responded_at: "2024-01-12T14:30:00Z",
            feedback_rating: null,
            feedback_comment: null,
            task_status: null
          },
          {
            id: 2,
            volunteer: {
              id: 2,
              name: "Jane Smith",
              email: "jane@example.com"
            },
            opportunity: {
              id: 2,
              title: "Food Bank Assistance",
              location: "City Food Bank",
              start_date: "2024-01-20",
              end_date: "2024-02-20"
            },
            status: "accepted",
            applied_at: "2024-01-15T09:00:00Z",
            responded_at: "2024-01-16T11:00:00Z",
            feedback_rating: 5,
            feedback_comment: "Excellent volunteer!",
            task_status: {
              status: "completed",
              started_at: "2024-01-20T08:00:00Z",
              completed_at: "2024-02-15T17:00:00Z",
              completion_notes: "All tasks completed successfully",
              work_evidence: null
            }
          }
        ]);

        // Set appropriate error message based on the error type
        if (error.response?.status === 401) {
          setApiError("Authentication failed - using sample data for demonstration");
          console.log("Authentication error - user may need to log in again");
        } else if (error.response?.status === 403) {
          setApiError("Access denied - using sample data for demonstration");
        } else if (error.response?.status === 500) {
          setApiError("Server error - using sample data for demonstration");
        } else if (error.code === 'NETWORK_ERROR' || !error.response) {
          setApiError("Network error - using sample data for demonstration");
        } else {
          setApiError(`API error (${error.response?.status || 'Unknown'}) - using sample data for demonstration`);
        }

    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (applicationId, statusData) => {
    try {
      // For now, simulate the update locally since API has issues
      setApplications(prev => prev.map(app => {
        if (app.id === applicationId) {
          const updatedApp = { ...app };

          // Update feedback
          if (statusData.feedback_rating) {
            updatedApp.feedback_rating = parseInt(statusData.feedback_rating);
          }
          if (statusData.feedback_comment) {
            updatedApp.feedback_comment = statusData.feedback_comment;
          }

          // Update task status
          if (statusData.status) {
            updatedApp.task_status = {
              status: statusData.status,
              started_at: statusData.status === 'in_progress' ? new Date().toISOString() : updatedApp.task_status?.started_at,
              completed_at: statusData.status === 'completed' ? new Date().toISOString() : null,
              completion_notes: statusData.completion_notes || updatedApp.task_status?.completion_notes,
              work_evidence: null
            };
          }

          return updatedApp;
        }
        return app;
      }));

      setShowTaskModal(false);
      setSelectedApplication(null);
      setTaskFormData({
        status: '',
        completion_notes: '',
        feedback_rating: '',
        feedback_comment: ''
      });

      alert('Task status updated successfully! (Demo mode - changes are local only)');
    } catch (error) {
      console.error("Failed to update task status:", error);
      alert("Failed to update task status. Please try again.");
    }
  };

  const openTaskModal = (application, status) => {
    setSelectedApplication(application);
    setTaskFormData({
      status: status,
      completion_notes: application.task_status?.completion_notes || '',
      feedback_rating: application.feedback_rating || '',
      feedback_comment: application.feedback_comment || ''
    });
    setShowTaskModal(true);
  };

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    if (!selectedApplication) return;
    
    updateTaskStatus(selectedApplication.id, taskFormData);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'quit': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Task Management - Organization Dashboard</title>
          <meta name="description" content="Manage volunteer tasks and track progress" />
        </Head>
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              Loading tasks...
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Task Management - Organization Dashboard</title>
        <meta name="description" content="Manage volunteer tasks and track progress" />
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
              Task Management
            </h1>
            <p className="text-gray-600 mt-1">Manage volunteer tasks and track their progress</p>
          </div>
          
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="accepted">Accepted Applications</option>
              <option value="pending">Pending Applications</option>
              <option value="rejected">Rejected Applications</option>
            </select>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-blue-600">{applications.length}</p>
              </div>
              <UserGroupIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {applications.filter(app => app.task_status?.status === 'in_progress').length}
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {applications.filter(app => app.task_status?.status === 'completed').length}
                </p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-600">
                  {applications.filter(app => !app.task_status || app.task_status?.status === 'pending').length}
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Volunteer Applications</h2>
          </div>
          
          {applications.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">No applications found for the selected status.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Volunteer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Opportunity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((application) => (
                    <ApplicationRow 
                      key={application.id} 
                      application={application} 
                      onUpdateTask={openTaskModal}
                      formatDate={formatDate}
                      getStatusColor={getStatusColor}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Task Status Modal */}
        {showTaskModal && selectedApplication && (
          <TaskStatusModal
            application={selectedApplication}
            taskFormData={taskFormData}
            setTaskFormData={setTaskFormData}
            onSubmit={handleTaskSubmit}
            onClose={() => {
              setShowTaskModal(false);
              setSelectedApplication(null);
            }}
          />
        )}
      </div>
    </>
  );
}

// Component for application rows
function ApplicationRow({ application, onUpdateTask, formatDate, getStatusColor }) {
  const taskStatus = application.task_status?.status || 'pending';

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">{application.volunteer.name}</div>
          <div className="text-sm text-gray-500">{application.volunteer.email}</div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div>
          <div className="text-sm font-medium text-gray-900">{application.opportunity.title}</div>
          <div className="text-sm text-gray-500">{application.opportunity.location}</div>
          <div className="text-xs text-gray-400">
            {formatDate(application.opportunity.start_date)} - {formatDate(application.opportunity.end_date)}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(taskStatus)}`}>
          {taskStatus.replace('_', ' ')}
        </span>
        {application.task_status?.started_at && (
          <div className="text-xs text-gray-500 mt-1">
            Started: {formatDate(application.task_status.started_at)}
          </div>
        )}
        {application.task_status?.completed_at && (
          <div className="text-xs text-gray-500 mt-1">
            Completed: {formatDate(application.task_status.completed_at)}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatDate(application.applied_at)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {application.feedback_rating ? (
          <div className="flex items-center gap-1">
            <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{application.feedback_rating}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-500">No rating</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center gap-2">
          {(!application.task_status || application.task_status.status === 'pending') && (
            <button
              onClick={() => onUpdateTask(application, 'in_progress')}
              className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
              title="Start Task"
            >
              <PlayIcon className="w-4 h-4" />
              Start
            </button>
          )}

          {application.task_status?.status === 'in_progress' && (
            <button
              onClick={() => onUpdateTask(application, 'completed')}
              className="text-green-600 hover:text-green-900 flex items-center gap-1"
              title="Mark Complete"
            >
              <CheckCircleIcon className="w-4 h-4" />
              Complete
            </button>
          )}

          {application.task_status?.status !== 'quit' && (
            <button
              onClick={() => onUpdateTask(application, 'quit')}
              className="text-red-600 hover:text-red-900 flex items-center gap-1"
              title="Mark as Quit"
            >
              <StopIcon className="w-4 h-4" />
              Quit
            </button>
          )}

          <button
            onClick={() => onUpdateTask(application, 'edit')}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
            title="Edit Details"
          >
            <PencilIcon className="w-4 h-4" />
            Edit
          </button>
        </div>
      </td>
    </tr>
  );
}

// Component for task status modal
function TaskStatusModal({ application, taskFormData, setTaskFormData, onSubmit, onClose }) {
  const handleInputChange = (field, value) => {
    setTaskFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Update Task Status</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <strong>Volunteer:</strong> {application.volunteer.name}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Opportunity:</strong> {application.opportunity.title}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Status
            </label>
            <select
              value={taskFormData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="quit">Quit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Completion Notes
            </label>
            <textarea
              value={taskFormData.completion_notes}
              onChange={(e) => handleInputChange('completion_notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Add notes about the task progress or completion..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Feedback Rating (1-5)
            </label>
            <select
              value={taskFormData.feedback_rating}
              onChange={(e) => handleInputChange('feedback_rating', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">No Rating</option>
              <option value="1">1 - Poor</option>
              <option value="2">2 - Fair</option>
              <option value="3">3 - Good</option>
              <option value="4">4 - Very Good</option>
              <option value="5">5 - Excellent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Feedback Comment
            </label>
            <textarea
              value={taskFormData.feedback_comment}
              onChange={(e) => handleInputChange('feedback_comment', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="2"
              placeholder="Add feedback about the volunteer's performance..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Update Status
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
