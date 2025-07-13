import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useAuth } from "../../context/AuthContext";
import {
  getMyTasks,
  startTask,
  completeVolunteerTask,
  quitTask,
  updateTaskProgress
} from "../../lib/api";
import {
  ClipboardDocumentListIcon,
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

export default function VolunteerTasks() {
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debug: Log user and token status
  console.log('VolunteerTasks - User:', user ? user.name : 'No user');
  console.log('VolunteerTasks - Token:', token ? 'Token exists' : 'No token');
  const [actionLoading, setActionLoading] = useState({});
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [completionData, setCompletionData] = useState({
    completion_notes: "",
    work_evidence: []
  });

  useEffect(() => {
    console.log('useEffect triggered, token:', token ? 'exists' : 'missing');

    // Ensure tasks is always an array
    if (!Array.isArray(tasks)) {
      console.log('Initializing tasks as empty array');
      setTasks([]);
    }

    if (!token) {
      console.log('No token available, skipping fetch');
      setLoading(false);
      return;
    }

    fetchTasks();
  }, [token]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getMyTasks();
      console.log('Tasks API response:', response); // Debug log
      console.log('Response data:', response.data); // Debug log

      // The API returns { tasks: [...], total_tasks: ..., etc }
      const tasksData = response.data?.tasks || response.data || [];

      console.log('Extracted tasks data:', tasksData); // Debug log
      console.log('Is tasks data an array?', Array.isArray(tasksData)); // Debug log

      // Ensure we have an array
      if (Array.isArray(tasksData)) {
        setTasks(tasksData);
        console.log('Tasks set successfully:', tasksData.length, 'tasks'); // Debug log
      } else {
        console.error('Tasks data is not an array:', tasksData);
        console.error('Type of tasksData:', typeof tasksData);
        setTasks([]);
        setError('Invalid data format received from server');
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      setTasks([]); // Ensure tasks is always an array
      setError(error.response?.data?.message || error.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async (applicationId) => {
    try {
      setActionLoading({ ...actionLoading, [applicationId]: true });
      await startTask(applicationId);
      fetchTasks();
    } catch (error) {
      console.error("Error starting task:", error);
    } finally {
      setActionLoading({ ...actionLoading, [applicationId]: false });
    }
  };

  const handleCompleteTask = async () => {
    if (!selectedTask) return;
    
    try {
      await completeVolunteerTask(selectedTask.id, completionData);
      setShowCompleteModal(false);
      setSelectedTask(null);
      setCompletionData({ completion_notes: "", work_evidence: [] });
      fetchTasks();
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const handleQuitTask = async (applicationId) => {
    if (!confirm("Are you sure you want to quit this task?")) return;
    
    try {
      setActionLoading({ ...actionLoading, [applicationId]: true });
      await quitTask(applicationId, { completion_notes: "Volunteer quit task" });
      fetchTasks();
    } catch (error) {
      console.error("Error quitting task:", error);
    } finally {
      setActionLoading({ ...actionLoading, [applicationId]: false });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "quit":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <ClockIcon className="h-5 w-5" />;
      case "in_progress":
        return <PlayIcon className="h-5 w-5" />;
      case "completed":
        return <CheckCircleIcon className="h-5 w-5" />;
      case "quit":
        return <XCircleIcon className="h-5 w-5" />;
      default:
        return <ClipboardDocumentListIcon className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>My Tasks - Volunteer Dashboard</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
              <p className="mt-2 text-gray-600">
                Manage your assigned volunteer tasks
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={fetchTasks}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh Tasks'}
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your tasks...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-red-800 mb-2">Error loading tasks</h3>
              <p className="text-sm text-red-600 mb-3">
                {error}
              </p>
              <button
                onClick={fetchTasks}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        ) : !Array.isArray(tasks) ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">Unexpected data format</h3>
              <p className="text-sm text-yellow-600 mb-3">
                The tasks data is not in the expected format. Please try refreshing the page.
              </p>
              <button
                onClick={fetchTasks}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
              >
                Retry
              </button>
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <ClipboardDocumentListIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks assigned</h3>
            <p className="text-gray-600">
              You don't have any tasks assigned yet. Apply to opportunities to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Array.isArray(tasks) && tasks.map((task) => (
              <div key={task.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {task.opportunity?.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.task_status?.status || 'pending')}`}>
                        {getStatusIcon(task.task_status?.status || 'pending')}
                        <span className="ml-1">{task.task_status?.status || 'pending'}</span>
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                        {task.opportunity?.organization?.name || 'Organization'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Applied: {new Date(task.applied_at).toLocaleDateString()}
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">
                      {task.opportunity?.description}
                    </p>

                    {task.task && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Task Details</h4>
                        <p className="text-sm text-gray-700 mb-2">{task.task.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Start: {new Date(task.task.start_date).toLocaleDateString()}</span>
                          <span>End: {new Date(task.task.end_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}

                    {task.task_status?.started_at && (
                      <div className="text-sm text-gray-600 mb-4">
                        <strong>Started:</strong> {new Date(task.task_status.started_at).toLocaleString()}
                      </div>
                    )}

                    {task.task_status?.completed_at && (
                      <div className="text-sm text-gray-600 mb-4">
                        <strong>Completed:</strong> {new Date(task.task_status.completed_at).toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 ml-6">
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setShowTaskDetailsModal(true);
                      }}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
                    >
                      <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
                      View Details
                    </button>

                    {(!task.task_status || task.task_status.status === 'pending') && (
                      <button
                        onClick={() => handleStartTask(task.id)}
                        disabled={actionLoading[task.id]}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                      >
                        <PlayIcon className="h-4 w-4 mr-2" />
                        {actionLoading[task.id] ? 'Starting...' : 'Start Task'}
                      </button>
                    )}

                    {task.task_status?.status === 'in_progress' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setShowCompleteModal(true);
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-2" />
                          Complete
                        </button>
                        <button
                          onClick={() => handleQuitTask(task.id)}
                          disabled={actionLoading[task.id]}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
                        >
                          <XCircleIcon className="h-4 w-4 mr-2" />
                          {actionLoading[task.id] ? 'Quitting...' : 'Quit'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Complete Task Modal */}
        {showCompleteModal && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Complete Task
              </h3>
              <p className="text-gray-600 mb-4">
                Please provide details about your completed work.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Completion Notes *
                  </label>
                  <textarea
                    value={completionData.completion_notes}
                    onChange={(e) => setCompletionData({
                      ...completionData,
                      completion_notes: e.target.value
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="4"
                    placeholder="Describe what you accomplished..."
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleCompleteTask}
                  disabled={!completionData.completion_notes.trim()}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Complete Task
                </button>
                <button
                  onClick={() => {
                    setShowCompleteModal(false);
                    setSelectedTask(null);
                    setCompletionData({ completion_notes: "", work_evidence: [] });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Task Details Modal */}
        {showTaskDetailsModal && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Task Details</h2>
                  <button
                    onClick={() => {
                      setShowTaskDetailsModal(false);
                      setSelectedTask(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Opportunity Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Opportunity Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Title:</span>
                      <span className="ml-2 text-gray-900">{selectedTask.opportunity?.title}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Organization:</span>
                      <span className="ml-2 text-gray-900">{selectedTask.opportunity?.organization}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Location:</span>
                      <span className="ml-2 text-gray-900">{selectedTask.opportunity?.location}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Description:</span>
                      <p className="mt-1 text-gray-900">{selectedTask.opportunity?.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium text-gray-700">Start Date:</span>
                        <span className="ml-2 text-gray-900">
                          {selectedTask.opportunity?.start_date ? new Date(selectedTask.opportunity.start_date).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">End Date:</span>
                        <span className="ml-2 text-gray-900">
                          {selectedTask.opportunity?.end_date ? new Date(selectedTask.opportunity.end_date).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Task Information */}
                {selectedTask.task && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Task Information</h3>
                    <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                      <div>
                        <span className="font-medium text-gray-700">Task Title:</span>
                        <span className="ml-2 text-gray-900">{selectedTask.task.title}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Description:</span>
                        <p className="mt-1 text-gray-900">{selectedTask.task.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="font-medium text-gray-700">Task Start:</span>
                          <span className="ml-2 text-gray-900">
                            {new Date(selectedTask.task.start_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Task End:</span>
                          <span className="ml-2 text-gray-900">
                            {new Date(selectedTask.task.end_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Task Status:</span>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedTask.task.status)}`}>
                          {selectedTask.task.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Progress Information</h3>
                  <div className="bg-green-50 rounded-lg p-4 space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Current Status:</span>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedTask.task_status?.status || 'pending')}`}>
                        {getStatusIcon(selectedTask.task_status?.status || 'pending')}
                        <span className="ml-1">{selectedTask.task_status?.status || 'pending'}</span>
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Applied On:</span>
                      <span className="ml-2 text-gray-900">
                        {new Date(selectedTask.applied_at).toLocaleDateString()}
                      </span>
                    </div>
                    {selectedTask.task_status?.started_at && (
                      <div>
                        <span className="font-medium text-gray-700">Started On:</span>
                        <span className="ml-2 text-gray-900">
                          {new Date(selectedTask.task_status.started_at).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedTask.task_status?.completed_at && (
                      <div>
                        <span className="font-medium text-gray-700">Completed On:</span>
                        <span className="ml-2 text-gray-900">
                          {new Date(selectedTask.task_status.completed_at).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedTask.task_status?.completion_notes && (
                      <div>
                        <span className="font-medium text-gray-700">Completion Notes:</span>
                        <p className="mt-1 text-gray-900">{selectedTask.task_status.completion_notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  {(!selectedTask.task_status || selectedTask.task_status.status === 'pending') && (
                    <button
                      onClick={() => {
                        setShowTaskDetailsModal(false);
                        handleStartTask(selectedTask.id);
                      }}
                      disabled={actionLoading[selectedTask.id]}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                      <PlayIcon className="h-4 w-4 mr-2" />
                      {actionLoading[selectedTask.id] ? 'Starting...' : 'Start Task'}
                    </button>
                  )}

                  {selectedTask.task_status?.status === 'in_progress' && (
                    <button
                      onClick={() => {
                        setShowTaskDetailsModal(false);
                        setShowCompleteModal(true);
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Complete Task
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowTaskDetailsModal(false);
                      setSelectedTask(null);
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
