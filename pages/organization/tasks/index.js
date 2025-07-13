import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useAuth } from "../../../context/AuthContext";

import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  PlayIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  getApplications,
  getCurrentVolunteers,
  getRecentVolunteers,
  assignVolunteersToTask,
  completeTask,
  reassignVolunteers,
  getVolunteersWithTasks,
  getVolunteerTaskDetails
} from "../../../lib/api";

export default function OrganizationTasks() {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [volunteersWithTasks, setVolunteersWithTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [statusFilter, setStatusFilter] = useState("accepted");
  const [taskStatusFilter, setTaskStatusFilter] = useState("all");
  const [activeView, setActiveView] = useState("applications"); // applications or volunteers
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedVolunteerTask, setSelectedVolunteerTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showVolunteerDetailModal, setShowVolunteerDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [taskFormData, setTaskFormData] = useState({
    status: '',
    completion_notes: '',
    feedback_rating: '',
    feedback_comment: ''
  });

  useEffect(() => {
    if (!token) return;
    if (activeView === "applications") {
      fetchApplications();
    } else {
      fetchVolunteersWithTasks();
    }
  }, [token, statusFilter, taskStatusFilter, activeView, currentPage, searchTerm]);

  const fetchTasks = useCallback(async () => {
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setApiError("");

      console.log("Fetching applications...");
      console.log("Status Filter:", statusFilter);
      console.log("Opportunity Filter:", selectedOpportunity);

      const params = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (selectedOpportunity !== 'all') {
        params.opportunity_id = selectedOpportunity;
      }
      console.log("Opportunity Filter:", selectedOpportunity);

      const params = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (selectedOpportunity !== 'all') {
        params.opportunity_id = selectedOpportunity;
      }

      const response = await getApplications({
        params: { status: statusFilter }
      });

      console.log("API Response:", response.data);
      setTasks(response.data.tasks || []);
      setTasks(response.data.tasks || []);
      setApiError(""); // Clear any previous errors

    } catch (error) {
      console.error("Failed to load tasks:", error);
      console.error("Failed to load tasks:", error);
      console.error("Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });

      // Set empty data
      setTasks([]);
      // Set empty data
      setTasks([]);

      // Set appropriate error message based on the error type
      if (error.response?.status === 401) {
        setApiError("Authentication failed. Please log in again.");
        console.log("Authentication error - user may need to log in again");
      } else if (error.response?.status === 403) {
        setApiError("Access denied. Please check your permissions.");
      } else if (error.response?.status === 500) {
        setApiError("Server error. Please try again later.");
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        setApiError("Network error. Please check your connection and try again.");
      } else {
        setApiError(`Failed to load tasks (Error ${error.response?.status || 'Unknown'}). Please try again.`);
      }
      // Set appropriate error message based on the error type
      if (error.response?.status === 401) {
        setApiError("Authentication failed. Please log in again.");
        console.log("Authentication error - user may need to log in again");
      } else if (error.response?.status === 403) {
        setApiError("Access denied. Please check your permissions.");
      } else if (error.response?.status === 500) {
        setApiError("Server error. Please try again later.");
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        setApiError("Network error. Please check your connection and try again.");
      } else {
        setApiError(`Failed to load tasks (Error ${error.response?.status || 'Unknown'}). Please try again.`);
      }

    } finally {
      setLoading(false);
    }
  };

  const fetchVolunteersWithTasks = async () => {
    try {
      setLoading(true);
      setApiError("");

      const params = {
        page: currentPage,
        per_page: perPage,
        search: searchTerm,
        task_status: taskStatusFilter !== "all" ? taskStatusFilter : undefined
      };

      const response = await getVolunteersWithTasks(params);

      if (response?.data?.success) {
        setVolunteersWithTasks(response.data.data || []);
        setTotalCount(response.data.total || 0);
        setTotalPages(response.data.last_page || 1);
      } else {
        setVolunteersWithTasks([]);
        setTotalCount(0);
        setTotalPages(1);
      }

    } catch (error) {
      console.error("Failed to load volunteers with tasks:", error);
      setApiError("Failed to load volunteers with tasks. Please try again.");
      setVolunteersWithTasks([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleViewVolunteerTaskDetails = async (applicationId) => {
    try {
      const response = await getVolunteerTaskDetails(applicationId);
      if (response?.data?.success) {
        setSelectedVolunteerTask(response.data.data);
        setShowVolunteerDetailModal(true);
      } else {
        alert('Failed to load volunteer task details');
      }
    } catch (error) {
      console.error('Error loading volunteer task details:', error);
      alert('Failed to load volunteer task details');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    if (activeView === "applications") {
      fetchApplications();
    } else {
      fetchVolunteersWithTasks();
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
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
    if (!taskFormData.opportunity_id || !taskFormData.title) {
      alert('Please fill in required fields');
      return;
    }

    // Clean up the data before sending
    const cleanedData = {
      ...taskFormData,
      // Convert empty strings to null for optional fields
      due_date: taskFormData.due_date || null,
      estimated_hours: taskFormData.estimated_hours ? parseInt(taskFormData.estimated_hours) : null,
      max_volunteers: parseInt(taskFormData.max_volunteers) || 1,
      description: taskFormData.description || null,
      instructions: taskFormData.instructions || null,
      deliverables: taskFormData.deliverables.length > 0 ? taskFormData.deliverables : null
    };

    createTask(cleanedData);
  };

  const handleTaskFormChange = (field, value) => {
    setTaskFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (!taskFormData.opportunity_id || !taskFormData.title) {
      alert('Please fill in required fields');
      return;
    }

    // Clean up the data before sending
    const cleanedData = {
      ...taskFormData,
      // Convert empty strings to null for optional fields
      due_date: taskFormData.due_date || null,
      estimated_hours: taskFormData.estimated_hours ? parseInt(taskFormData.estimated_hours) : null,
      max_volunteers: parseInt(taskFormData.max_volunteers) || 1,
      description: taskFormData.description || null,
      instructions: taskFormData.instructions || null,
      deliverables: taskFormData.deliverables.length > 0 ? taskFormData.deliverables : null
    };

    createTask(cleanedData);
  };

  const handleTaskFormChange = (field, value) => {
    setTaskFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
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
        </div>

        {/* View Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => {
                setActiveView("applications");
                setCurrentPage(1);
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeView === "applications"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Applications View
            </button>
            <button
              onClick={() => {
                setActiveView("volunteers");
                setCurrentPage(1);
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeView === "volunteers"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Volunteers with Tasks
            </button>
          </nav>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            {activeView === "volunteers" && (
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search volunteers by name or task..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </form>
            )}

            {/* Filters */}
            <div className="flex gap-3">
              {activeView === "applications" ? (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="accepted">Accepted Applications</option>
                  <option value="pending">Pending Applications</option>
                  <option value="rejected">Rejected Applications</option>
                </select>
              ) : (
                <select
                  value={taskStatusFilter}
                  onChange={(e) => setTaskStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Task Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {activeView === "applications" ? "Total Applications" : "Total Volunteers"}
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {activeView === "applications" ? applications.length : totalCount}
                </p>
              </div>
              <UserGroupIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {activeView === "applications"
                    ? applications.filter(app => app.task_status?.status === 'in_progress').length
                    : volunteersWithTasks.filter(vol => vol.task_status?.status === 'in_progress').length
                  }
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
                  {activeView === "applications"
                    ? applications.filter(app => app.task_status?.status === 'completed').length
                    : volunteersWithTasks.filter(vol => vol.task_status?.status === 'completed').length
                  }
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
                  {activeView === "applications"
                    ? applications.filter(app => !app.task_status || app.task_status?.status === 'pending').length
                    : volunteersWithTasks.filter(vol => !vol.task_status || vol.task_status?.status === 'pending').length
                  }
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Content based on active view */}
        {activeView === "applications" ? (
          /* Applications List */
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
        ) : (
          /* Volunteers with Tasks List */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Volunteers with Assigned Tasks</h2>
            </div>

            {volunteersWithTasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">No volunteers with tasks found.</div>
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
                        Task
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Opportunity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {volunteersWithTasks.map((volunteerTask) => (
                      <VolunteerTaskRow
                        key={volunteerTask.application_id}
                        volunteerTask={volunteerTask}
                        onViewDetails={handleViewVolunteerTaskDetails}
                        formatDate={formatDate}
                        getStatusColor={getStatusColor}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Pagination for volunteers view */}
        {activeView === "volunteers" && totalPages > 1 && (
          <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
            <div className="flex items-center text-sm text-gray-700">
              <span>
                Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalCount)} of {totalCount} volunteers
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
              >
                ←
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNum > totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md ${
                      pageNum === currentPage
                        ? 'bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
              >
                →
              </button>
            </div>
          </div>
        )}

        {/* Task Status Modal */}
        {showTaskModal && selectedApplication && (
          <TaskStatusModal
            application={selectedApplication}
            taskFormData={taskFormData}
            onFormChange={handleTaskFormChange}
            onSubmit={handleCreateTask}
            onFormChange={handleTaskFormChange}
            onSubmit={handleCreateTask}
            onClose={() => {
              setShowCreateModal(false);
              resetTaskForm();
              setShowCreateModal(false);
              resetTaskForm();
            }}
          />
        )}

        {/* Volunteer Task Detail Modal */}
        {showVolunteerDetailModal && selectedVolunteerTask && (
          <VolunteerTaskDetailModal
            volunteerTask={selectedVolunteerTask}
            onClose={() => {
              setShowVolunteerDetailModal(false);
              setSelectedVolunteerTask(null);
            }}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
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

// Component for volunteer task rows
function VolunteerTaskRow({ volunteerTask, onViewDetails, formatDate, getStatusColor }) {
  const taskStatus = volunteerTask.task_status?.status || 'pending';

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">{volunteerTask.volunteer.name}</div>
          <div className="text-sm text-gray-500">{volunteerTask.volunteer.email}</div>
          {volunteerTask.volunteer.skills && volunteerTask.volunteer.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {volunteerTask.volunteer.skills.slice(0, 2).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                >
                  {skill.name}
                </span>
              ))}
              {volunteerTask.volunteer.skills.length > 2 && (
                <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                  +{volunteerTask.volunteer.skills.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div>
          {volunteerTask.task ? (
            <>
              <div className="text-sm font-medium text-gray-900">{volunteerTask.task.title}</div>
              <div className="text-sm text-gray-500">{volunteerTask.task.description}</div>
              <div className="text-xs text-gray-400">
                {formatDate(volunteerTask.task.start_date)} - {formatDate(volunteerTask.task.end_date)}
              </div>
            </>
          ) : (
            <span className="text-sm text-gray-500">No task assigned</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div>
          <div className="text-sm font-medium text-gray-900">{volunteerTask.opportunity.title}</div>
          <div className="text-sm text-gray-500">{volunteerTask.opportunity.location}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(taskStatus)}`}>
          {taskStatus.replace('_', ' ')}
        </span>
        {volunteerTask.task_status?.started_at && (
          <div className="text-xs text-gray-500 mt-1">
            Started: {formatDate(volunteerTask.task_status.started_at)}
          </div>
        )}
        {volunteerTask.task_status?.completed_at && (
          <div className="text-xs text-gray-500 mt-1">
            Completed: {formatDate(volunteerTask.task_status.completed_at)}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${volunteerTask.progress || 0}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-600">{volunteerTask.progress || 0}%</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button
          onClick={() => onViewDetails(volunteerTask.application_id)}
          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
          title="View Details"
        >
          <EyeIcon className="w-4 h-4" />
          View Details
        </button>
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
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
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

// Component for volunteer task detail modal
function VolunteerTaskDetailModal({ volunteerTask, onClose, formatDate, getStatusColor }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Volunteer Task Details</h2>
              <p className="text-gray-600">{volunteerTask.volunteer.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Volunteer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Volunteer Information</h3>

              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{volunteerTask.volunteer.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{volunteerTask.volunteer.email}</p>
                </div>

                {volunteerTask.volunteer.profile && (
                  <>
                    {volunteerTask.volunteer.profile.location && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <p className="text-gray-900">{volunteerTask.volunteer.profile.location}</p>
                      </div>
                    )}

                    {volunteerTask.volunteer.profile.availability && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Availability</label>
                        <p className="text-gray-900">{volunteerTask.volunteer.profile.availability}</p>
                      </div>
                    )}
                  </>
                )}

                {/* Skills */}
                {volunteerTask.volunteer.skills && volunteerTask.volunteer.skills.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                    <div className="flex flex-wrap gap-2">
                      {volunteerTask.volunteer.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Task Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Task Information</h3>

              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                {volunteerTask.task ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Task Title</label>
                      <p className="text-gray-900">{volunteerTask.task.title}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <p className="text-gray-900">{volunteerTask.task.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                        <p className="text-gray-900">{formatDate(volunteerTask.task.start_date)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">End Date</label>
                        <p className="text-gray-900">{formatDate(volunteerTask.task.end_date)}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(volunteerTask.task.status)}`}>
                        {volunteerTask.task.status}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500">No task assigned</p>
                )}
              </div>
            </div>
          </div>

          {/* Opportunity Information */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Opportunity Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <p className="text-gray-900">{volunteerTask.opportunity.title}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-900">{volunteerTask.opportunity.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <p className="text-gray-900">{volunteerTask.opportunity.location}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(volunteerTask.opportunity.status)}`}>
                    {volunteerTask.opportunity.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Task Status and Progress */}
          {volunteerTask.task_status && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Progress</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-600">{volunteerTask.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${volunteerTask.progress || 0}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {volunteerTask.task_status.started_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Started At</label>
                      <p className="text-gray-900">{formatDate(volunteerTask.task_status.started_at)}</p>
                    </div>
                  )}
                  {volunteerTask.task_status.completed_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Completed At</label>
                      <p className="text-gray-900">{formatDate(volunteerTask.task_status.completed_at)}</p>
                    </div>
                  )}
                </div>

                {volunteerTask.task_status.completion_notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Completion Notes</label>
                    <p className="text-gray-900">{volunteerTask.task_status.completion_notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          {volunteerTask.timeline && volunteerTask.timeline.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
              <div className="space-y-3">
                {volunteerTask.timeline.map((event, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1 ${
                      event.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{event.event}</p>
                      <p className="text-sm text-gray-600">{event.description}</p>
                      <p className="text-xs text-gray-500">{formatDate(event.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
