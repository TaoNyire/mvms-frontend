import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";

import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  PlayIcon,
  PlusIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function OrganizationTasks() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [selectedOpportunity, setSelectedOpportunity] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [availableVolunteers, setAvailableVolunteers] = useState([]);
  const [volunteerAssignments, setVolunteerAssignments] = useState([]);
  const [activeView, setActiveView] = useState('tasks'); // 'tasks' or 'assignments'
  const [taskTemplates, setTaskTemplates] = useState([]);
  const [taskFormData, setTaskFormData] = useState({
    opportunity_id: '',
    title: '',
    description: '',
    due_date: '',
    estimated_hours: '',
    priority: 'medium',
    max_volunteers: 1,
    instructions: '',
    deliverables: []
  });

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setApiError("");

      console.log("Fetching tasks...");
      console.log("API_BASE:", API_BASE);
      console.log("Token:", token ? "Present" : "Missing");
      console.log("Status Filter:", statusFilter);
      console.log("Opportunity Filter:", selectedOpportunity);

      const params = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (selectedOpportunity !== 'all') {
        params.opportunity_id = selectedOpportunity;
      }

      const response = await axios.get(`${API_BASE}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      console.log("API Response:", response.data);
      setTasks(response.data.tasks || []);
      setApiError(""); // Clear any previous errors

    } catch (error) {
      console.error("Failed to load tasks:", error);
      console.error("Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });

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

    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, selectedOpportunity]);

  const fetchOpportunities = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/opportunities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOpportunities(response.data.opportunities || response.data || []);
    } catch (error) {
      console.error("Failed to load opportunities:", error);
    }
  }, [token]);

  const fetchVolunteerAssignments = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/task-assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const assignments = response.data.assignments || [];

      // Group assignments by opportunity
      const groupedAssignments = assignments.reduce((acc, assignment) => {
        const opportunityId = assignment.opportunity_task?.opportunity?.id;
        const opportunityTitle = assignment.opportunity_task?.opportunity?.title || 'Unknown Opportunity';

        if (!acc[opportunityId]) {
          acc[opportunityId] = {
            opportunity: {
              id: opportunityId,
              title: opportunityTitle
            },
            assignments: []
          };
        }

        acc[opportunityId].assignments.push(assignment);
        return acc;
      }, {});

      setVolunteerAssignments(Object.values(groupedAssignments));
    } catch (error) {
      console.error("Failed to load volunteer assignments:", error);
      setVolunteerAssignments([]);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchTasks();
    fetchOpportunities();
    fetchVolunteerAssignments();
    fetchTaskTemplates();
  }, [token, fetchTasks, fetchOpportunities, fetchVolunteerAssignments, fetchTaskTemplates]);

  const createTask = async (taskData) => {
    try {
      console.log("Creating task with data:", taskData);

      const response = await axios.post(`${API_BASE}/tasks`, taskData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Task created successfully:", response.data);
      setTasks(prev => [...prev, response.data.task]);
      setShowCreateModal(false);
      resetTaskForm();
      alert('Task created successfully!');
    } catch (error) {
      console.error("Failed to create task:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      if (error.response?.status === 422) {
        const errorMessage = error.response.data?.message || 'Validation failed';
        const errors = error.response.data?.errors;

        if (errors) {
          const errorList = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n');
          alert(`Validation errors:\n${errorList}`);
        } else {
          alert(`Validation error: ${errorMessage}`);
        }
      } else if (error.response?.data?.error === 'PROFILE_INCOMPLETE') {
        alert("Please complete your organization profile before creating tasks.");
      } else {
        alert("Failed to create task. Please try again.");
      }
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const response = await axios.put(`${API_BASE}/tasks/${taskId}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTasks(prev => prev.map(task =>
        task.id === taskId ? response.data.task : task
      ));
      alert('Task updated successfully!');
    } catch (error) {
      console.error("Failed to update task:", error);
      alert("Failed to update task. Please try again.");
    }
  };

  const deleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await axios.delete(`${API_BASE}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTasks(prev => prev.filter(task => task.id !== taskId));
      alert('Task deleted successfully!');
    } catch (error) {
      console.error("Failed to delete task:", error);
      alert("Failed to delete task. Please try again.");
    }
  };

  const resetTaskForm = () => {
    setTaskFormData({
      opportunity_id: '',
      title: '',
      description: '',
      due_date: '',
      estimated_hours: '',
      priority: 'medium',
      max_volunteers: 1,
      instructions: '',
      deliverables: []
    });
  };

  // Task template functions
  const fetchTaskTemplates = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/task-templates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTaskTemplates(response.data.templates || []);
    } catch (error) {
      console.error("Failed to load task templates:", error);
      // Set default templates if API fails
      setTaskTemplates([
        {
          id: 1,
          name: "Event Setup",
          tasks: [
            { title: "Venue Preparation", description: "Set up tables, chairs, and decorations", estimated_hours: 3, priority: "high" },
            { title: "Registration Setup", description: "Prepare registration desk and materials", estimated_hours: 1, priority: "medium" },
            { title: "Equipment Check", description: "Test all audio/visual equipment", estimated_hours: 1, priority: "high" }
          ]
        },
        {
          id: 2,
          name: "Community Outreach",
          tasks: [
            { title: "Door-to-Door Canvassing", description: "Visit households to share information", estimated_hours: 4, priority: "medium" },
            { title: "Flyer Distribution", description: "Distribute promotional materials", estimated_hours: 2, priority: "low" },
            { title: "Survey Collection", description: "Collect community feedback surveys", estimated_hours: 3, priority: "medium" }
          ]
        },
        {
          id: 3,
          name: "Food Distribution",
          tasks: [
            { title: "Food Sorting", description: "Sort and organize donated food items", estimated_hours: 2, priority: "high" },
            { title: "Package Preparation", description: "Prepare food packages for families", estimated_hours: 3, priority: "high" },
            { title: "Distribution Assistance", description: "Help distribute packages to beneficiaries", estimated_hours: 4, priority: "medium" }
          ]
        }
      ]);
    }
  }, [token]);

  const createTasksFromTemplate = async (templateId, opportunityId) => {
    try {
      const template = taskTemplates.find(t => t.id === templateId);
      if (!template) return;

      const tasksToCreate = template.tasks.map(task => ({
        ...task,
        opportunity_id: opportunityId
      }));

      const response = await axios.post(`${API_BASE}/tasks/bulk`, {
        opportunity_id: opportunityId,
        tasks: tasksToCreate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchTasks();
      alert(`Created ${tasksToCreate.length} tasks from template!`);
      setShowTemplateModal(false);
    } catch (error) {
      console.error("Failed to create tasks from template:", error);
      alert("Failed to create tasks from template. Please try again.");
    }
  };

  // Task assignment functions
  const fetchAvailableVolunteers = async (taskId) => {
    try {
      // Get volunteers who have applied to the opportunity
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        console.error("Task not found:", taskId);
        setAvailableVolunteers([]);
        return;
      }

      console.log("Fetching volunteers for task:", task);

      // Get opportunity ID from task or task.opportunity
      const opportunityId = task.opportunity_id || task.opportunity?.id;
      if (!opportunityId) {
        console.error("No opportunity ID found for task:", task);
        setAvailableVolunteers([]);
        return;
      }

      console.log("Opportunity ID:", opportunityId);

      let response;
      let useGeneralEndpoint = false;

      try {
        // Try the opportunity-specific applications endpoint first
        response = await axios.get(`${API_BASE}/opportunities/${opportunityId}/applications`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { status: 'accepted' }
        });
      } catch (error) {
        console.log("Opportunity applications endpoint failed, trying general applications endpoint");
        useGeneralEndpoint = true;
        // Fallback to general applications endpoint
        response = await axios.get(`${API_BASE}/applications`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { status: 'accepted' }
        });
      }

      console.log("Available volunteers response:", response.data);

      // Handle different response formats
      let acceptedApplications = [];
      if (response.data.applications) {
        acceptedApplications = response.data.applications;
      } else if (response.data.data) {
        acceptedApplications = response.data.data;
      } else if (Array.isArray(response.data)) {
        acceptedApplications = response.data;
      } else {
        console.warn("Unexpected response format:", response.data);
        acceptedApplications = [];
      }

      // Filter applications for the specific opportunity only if we used the general endpoint
      if (useGeneralEndpoint && Array.isArray(acceptedApplications)) {
        console.log("Using general endpoint - filtering applications for opportunity:", opportunityId);
        console.log("Before filtering - applications:", acceptedApplications);

        acceptedApplications = acceptedApplications.filter(app => {
          const appOpportunityId = app.opportunity_id || app.opportunity?.id;
          console.log("App opportunity ID:", appOpportunityId, typeof appOpportunityId);

          // Compare both as strings and numbers to handle type mismatches
          return appOpportunityId == opportunityId ||
                 String(appOpportunityId) === String(opportunityId) ||
                 Number(appOpportunityId) === Number(opportunityId);
        });

        console.log("After filtering - applications:", acceptedApplications);
      } else if (!useGeneralEndpoint) {
        console.log("Using opportunity-specific endpoint - no filtering needed");
      }

      console.log("Processed applications:", acceptedApplications);
      setAvailableVolunteers(Array.isArray(acceptedApplications) ? acceptedApplications : []);
    } catch (error) {
      console.error("Failed to fetch available volunteers:", error);
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      setAvailableVolunteers([]);
    }
  };

  const assignTaskToVolunteer = async (taskId, volunteerId, applicationId, notes = '') => {
    try {
      console.log("Assigning task:", {
        taskId,
        volunteerId,
        applicationId,
        notes,
        task: tasks.find(t => t.id === taskId)
      });

      const response = await axios.post(`${API_BASE}/task-assignments`, {
        opportunity_task_id: taskId,
        volunteer_id: volunteerId,
        application_id: applicationId,
        assignment_notes: notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Assignment successful:", response.data);

      // Refresh tasks and volunteer assignments to show updated data
      fetchTasks();
      fetchVolunteerAssignments();
      alert('Task assigned successfully!');
      setShowAssignModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Failed to assign task:", error);
      console.error("Error response:", error.response?.data);

      if (error.response?.status === 422) {
        const errorMessage = error.response.data?.message || 'Assignment failed';
        alert(`Assignment error: ${errorMessage}`);
      } else {
        alert("Failed to assign task. Please try again.");
      }
    }
  };

  const openAssignModal = (task) => {
    setSelectedTask(task);
    setShowAssignModal(true);
    fetchAvailableVolunteers(task.id);
  };

  // Bulk assignment functions
  const toggleTaskSelection = (taskId) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const selectAllTasks = () => {
    const activeTasks = tasks.filter(task => task.status === 'active').map(task => task.id);
    setSelectedTasks(activeTasks);
  };

  const clearTaskSelection = () => {
    setSelectedTasks([]);
  };

  const openBulkAssignModal = () => {
    if (selectedTasks.length === 0) {
      alert('Please select tasks to assign');
      return;
    }
    setShowBulkAssignModal(true);
    // Fetch volunteers for the first selected task's opportunity
    const firstTask = tasks.find(t => t.id === selectedTasks[0]);
    if (firstTask) {
      fetchAvailableVolunteers(firstTask.id);
    }
  };

  const bulkAssignTasks = async (volunteerId, applicationId, notes = '') => {
    try {
      const assignmentPromises = selectedTasks.map(taskId =>
        axios.post(`${API_BASE}/task-assignments`, {
          opportunity_task_id: taskId,
          volunteer_id: volunteerId,
          application_id: applicationId,
          assignment_notes: notes
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
      );

      await Promise.all(assignmentPromises);

      fetchTasks();
      fetchVolunteerAssignments();
      alert(`Successfully assigned ${selectedTasks.length} tasks!`);
      setShowBulkAssignModal(false);
      setSelectedTasks([]);
    } catch (error) {
      console.error("Failed to bulk assign tasks:", error);
      alert("Failed to assign some tasks. Please try again.");
    }
  };

  // Debug function to test applications endpoint
  const debugApplications = async (opportunityId) => {
    try {
      console.log("=== DEBUG: Testing applications endpoints ===");

      // Test opportunity-specific endpoint
      try {
        const response1 = await axios.get(`${API_BASE}/opportunities/${opportunityId}/applications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Opportunity applications (all statuses):", response1.data);
      } catch (error) {
        console.log("Opportunity applications endpoint failed:", error.response?.status, error.response?.data);
      }

      // Test general applications endpoint
      try {
        const response2 = await axios.get(`${API_BASE}/applications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("General applications:", response2.data);
      } catch (error) {
        console.log("General applications endpoint failed:", error.response?.status, error.response?.data);
      }

    } catch (error) {
      console.error("Debug failed:", error);
    }
  };

  const handleCreateTask = (e) => {
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
  };

  const getStatusColor = (status) => {
    switch (status) {
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
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ClipboardDocumentListIcon className="w-8 h-8 text-blue-600" />
                Task Management
              </h1>
              <p className="text-gray-600 mt-1">Create and manage tasks within your opportunities</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowTemplateModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Use Template
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Create Task
              </button>
            </div>
          </div>

          {/* View Toggle and Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveView('tasks')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === 'tasks'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tasks View
              </button>
              <button
                onClick={() => setActiveView('assignments')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === 'assignments'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Volunteer Assignments
              </button>
            </div>

            <div className="flex gap-3">
              <select
                value={selectedOpportunity}
                onChange={(e) => setSelectedOpportunity(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="all">All Opportunities</option>
                {opportunities.map(opp => (
                  <option key={opp.id} value={opp.id}>{opp.title}</option>
                ))}
              </select>

              {activeView === 'tasks' && (
                <>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="all">All Tasks</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  {selectedTasks.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {selectedTasks.length} selected
                      </span>
                      <button
                        onClick={openBulkAssignModal}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                      >
                        Bulk Assign
                      </button>
                      <button
                        onClick={clearTaskSelection}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {activeView === 'tasks' ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-blue-600">{tasks.length}</p>
                </div>
                <ClipboardDocumentListIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {tasks.filter(task => task.status === 'active').length}
                  </p>
                </div>
                <PlayIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {tasks.filter(task => task.status === 'completed').length}
                  </p>
                </div>
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">
                    {tasks.filter(task => task.is_overdue).length}
                  </p>
                </div>
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {volunteerAssignments.reduce((total, group) => total + group.assignments.length, 0)}
                  </p>
                </div>
                <ClipboardDocumentListIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Volunteers</p>
                  <p className="text-2xl font-bold text-green-600">
                    {new Set(volunteerAssignments.flatMap(group =>
                      group.assignments
                        .filter(a => ['assigned', 'in_progress'].includes(a.status))
                        .map(a => a.volunteer?.id)
                    )).size}
                  </p>
                </div>
                <PlayIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                  <p className="text-2xl font-bold text-green-600">
                    {volunteerAssignments.reduce((total, group) =>
                      total + group.assignments.filter(a => a.status === 'completed').length, 0
                    )}
                  </p>
                </div>
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Opportunities</p>
                  <p className="text-2xl font-bold text-purple-600">{volunteerAssignments.length}</p>
                </div>
                <ExclamationTriangleIcon className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        {activeView === 'tasks' ? (
          /* Tasks List */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-500 mb-2">No tasks found</div>
                <div className="text-sm text-gray-400">Create your first task to get started</div>
              </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedTasks.length === tasks.filter(t => t.status === 'active').length && tasks.filter(t => t.status === 'active').length > 0}
                          onChange={(e) => e.target.checked ? selectAllTasks() : clearTaskSelection()}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>Task</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Opportunity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Volunteers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          {task.status === 'active' && (
                            <input
                              type="checkbox"
                              checked={selectedTasks.includes(task.id)}
                              onChange={() => toggleTaskSelection(task.id)}
                              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          )}
                          <div className={task.status !== 'active' ? 'ml-6' : ''}>
                            <div className="text-sm font-medium text-gray-900">{task.title}</div>
                            <div className="text-sm text-gray-500">{task.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{task.opportunity?.title || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task.due_date ? formatDate(task.due_date) : 'No due date'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task.assigned_volunteers_count || 0} / {task.max_volunteers}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openAssignModal(task)}
                            className="text-green-600 hover:text-green-900"
                            title="Assign to Volunteer"
                          >
                            Assign
                          </button>
                          <button
                            onClick={() => updateTask(task.id, { status: task.status === 'active' ? 'paused' : 'active' })}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {task.status === 'active' ? 'Pause' : 'Activate'}
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        ) : (
          /* Volunteer Assignments View */
          <VolunteerAssignmentsView
            volunteerAssignments={volunteerAssignments}
            selectedOpportunity={selectedOpportunity}
            onRefresh={fetchVolunteerAssignments}
          />
        )}

        {/* Create Task Modal */}
        {showCreateModal && (
          <CreateTaskModal
            opportunities={opportunities}
            taskFormData={taskFormData}
            onFormChange={handleTaskFormChange}
            onSubmit={handleCreateTask}
            onClose={() => {
              setShowCreateModal(false);
              resetTaskForm();
            }}
          />
        )}

        {/* Assign Task Modal */}
        {showAssignModal && selectedTask && (
          <AssignTaskModal
            task={selectedTask}
            volunteers={availableVolunteers}
            onAssign={assignTaskToVolunteer}
            onClose={() => {
              setShowAssignModal(false);
              setSelectedTask(null);
              setAvailableVolunteers([]);
            }}
          />
        )}

        {/* Bulk Assign Modal */}
        {showBulkAssignModal && (
          <BulkAssignModal
            tasks={tasks.filter(t => selectedTasks.includes(t.id))}
            volunteers={availableVolunteers}
            onAssign={bulkAssignTasks}
            onClose={() => {
              setShowBulkAssignModal(false);
              setAvailableVolunteers([]);
            }}
          />
        )}

        {/* Task Template Modal */}
        {showTemplateModal && (
          <TaskTemplateModal
            templates={taskTemplates}
            opportunities={opportunities}
            onCreateFromTemplate={createTasksFromTemplate}
            onClose={() => setShowTemplateModal(false)}
          />
        )}
      </div>
    </>
  );
}

// Component for create task modal
function CreateTaskModal({ opportunities, taskFormData, onFormChange, onSubmit, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Create New Task</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Opportunity *
            </label>
            <select
              value={taskFormData.opportunity_id}
              onChange={(e) => onFormChange('opportunity_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              required
            >
              <option value="">Select Opportunity</option>
              {opportunities.map(opp => (
                <option key={opp.id} value={opp.id}>{opp.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              value={taskFormData.title}
              onChange={(e) => onFormChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={taskFormData.description}
              onChange={(e) => onFormChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={taskFormData.due_date}
                onChange={(e) => onFormChange('due_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={taskFormData.priority}
                onChange={(e) => onFormChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                value={taskFormData.estimated_hours}
                onChange={(e) => onFormChange('estimated_hours', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Volunteers
              </label>
              <input
                type="number"
                value={taskFormData.max_volunteers}
                onChange={(e) => onFormChange('max_volunteers', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructions
            </label>
            <textarea
              value={taskFormData.instructions}
              onChange={(e) => onFormChange('instructions', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              rows="3"
              placeholder="Detailed instructions for volunteers..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Task
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

// Component for assign task modal
function AssignTaskModal({ task, volunteers = [], onAssign, onClose }) {
  const [selectedVolunteer, setSelectedVolunteer] = React.useState('');
  const [assignmentNotes, setAssignmentNotes] = React.useState('');

  // Ensure volunteers is always an array
  const volunteerList = Array.isArray(volunteers) ? volunteers : [];

  const handleAssign = (e) => {
    e.preventDefault();
    if (!selectedVolunteer) {
      alert('Please select a volunteer');
      return;
    }

    const volunteer = volunteerList.find(v => v.volunteer?.id?.toString() === selectedVolunteer);
    if (!volunteer) {
      alert('Selected volunteer not found');
      return;
    }

    onAssign(task.id, volunteer.volunteer.id, volunteer.id, assignmentNotes);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Assign Task to Volunteer</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900">{task.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span>Opportunity: {task.opportunity?.title}</span>
            <span>Priority: {task.priority}</span>
            {task.due_date && <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
          </div>
        </div>

        {volunteerList.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">No volunteers available for assignment</div>
            <div className="text-sm text-gray-400 mb-4">
              Make sure volunteers have applied and been accepted for this opportunity
            </div>
            <div className="text-xs text-gray-500 bg-gray-100 p-3 rounded mb-4">
              <strong>Debug Info:</strong><br/>
              Task ID: {task.id}<br/>
              Opportunity: {task.opportunity?.title || 'Not loaded'}<br/>
              Opportunity ID: {task.opportunity_id || task.opportunity?.id || 'Not found'}<br/>
              Volunteers fetched: {volunteers ? (Array.isArray(volunteers) ? volunteers.length : 'Not array') : 'null/undefined'}
            </div>
            <button
              onClick={() => debugApplications(task.opportunity_id || task.opportunity?.id)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Debug Applications (Check Console)
            </button>
          </div>
        ) : (
          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Volunteer *
              </label>
              <select
                value={selectedVolunteer}
                onChange={(e) => setSelectedVolunteer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                required
              >
                <option value="">Choose a volunteer...</option>
                {volunteerList.map((application) => (
                  <option key={application.id} value={application.volunteer?.id}>
                    {application.volunteer?.name} ({application.volunteer?.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Notes
              </label>
              <textarea
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                rows="3"
                placeholder="Add any specific instructions or notes for this assignment..."
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">Available Volunteers ({volunteerList.length})</h5>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {volunteerList.map((application) => (
                  <div key={application.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium text-gray-900">{application.volunteer?.name}</span>
                      <span className="text-gray-500 ml-2">({application.volunteer?.email})</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Applied: {application.applied_at ? new Date(application.applied_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Assign Task
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
        )}
      </div>
    </div>
  );
}

// Component for volunteer assignments view
function VolunteerAssignmentsView({ volunteerAssignments, selectedOpportunity, onRefresh }) {
  // Filter assignments by selected opportunity
  const filteredAssignments = selectedOpportunity === 'all'
    ? volunteerAssignments
    : volunteerAssignments.filter(group => group.opportunity.id.toString() === selectedOpportunity);

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

  if (filteredAssignments.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Volunteer Assignments</h2>
        </div>
        <div className="text-center py-12">
          <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-500 mb-2">No volunteer assignments found</div>
          <div className="text-sm text-gray-400">Assign tasks to volunteers to see them here</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {filteredAssignments.map((group) => (
        <div key={group.opportunity.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{group.opportunity.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {group.assignments.length} volunteer{group.assignments.length !== 1 ? 's' : ''} assigned
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span>In Progress: {group.assignments.filter(a => a.status === 'in_progress').length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>Completed: {group.assignments.filter(a => a.status === 'completed').length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid gap-4">
              {group.assignments.map((assignment) => (
                <VolunteerAssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  getStatusColor={getStatusColor}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Component for individual volunteer assignment cards
function VolunteerAssignmentCard({ assignment, getStatusColor, formatDate }) {
  const task = assignment.opportunity_task;
  const volunteer = assignment.volunteer;

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{task?.title}</h4>
              <p className="text-sm text-gray-600">{volunteer?.name} ({volunteer?.email})</p>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(assignment.status)}`}>
              {assignment.status.replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
            <div>
              <span className="font-medium text-gray-700">Task Priority:</span>
              <div className="capitalize">{task?.priority || 'N/A'}</div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Due Date:</span>
              <div>{task?.due_date ? formatDate(task.due_date) : 'No due date'}</div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Assigned:</span>
              <div>{formatDate(assignment.assigned_at)}</div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Progress:</span>
              <div>{assignment.progress_percentage || 0}%</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${assignment.progress_percentage || 0}%` }}
              ></div>
            </div>
          </div>

          {/* Task Description */}
          {task?.description && (
            <p className="text-sm text-gray-600 mb-3">{task.description}</p>
          )}

          {/* Assignment Notes */}
          {assignment.assignment_notes && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
              <span className="font-medium text-blue-900 text-sm">Assignment Notes:</span>
              <p className="text-blue-800 text-sm mt-1">{assignment.assignment_notes}</p>
            </div>
          )}

          {/* Completion Notes */}
          {assignment.completion_notes && (
            <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
              <span className="font-medium text-green-900 text-sm">Completion Notes:</span>
              <p className="text-green-800 text-sm mt-1">{assignment.completion_notes}</p>
            </div>
          )}

          {/* Additional Info */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {assignment.hours_logged && (
              <span>Hours Logged: {assignment.hours_logged}</span>
            )}
            {assignment.started_at && (
              <span>Started: {formatDate(assignment.started_at)}</span>
            )}
            {assignment.completed_at && (
              <span>Completed: {formatDate(assignment.completed_at)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Component for bulk assign modal
function BulkAssignModal({ tasks, volunteers = [], onAssign, onClose }) {
  const [selectedVolunteer, setSelectedVolunteer] = React.useState('');
  const [assignmentNotes, setAssignmentNotes] = React.useState('');

  const volunteerList = Array.isArray(volunteers) ? volunteers : [];

  const handleAssign = (e) => {
    e.preventDefault();
    if (!selectedVolunteer) {
      alert('Please select a volunteer');
      return;
    }

    const volunteer = volunteerList.find(v => v.volunteer?.id?.toString() === selectedVolunteer);
    if (!volunteer) {
      alert('Selected volunteer not found');
      return;
    }

    onAssign(volunteer.volunteer.id, volunteer.id, assignmentNotes);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Bulk Assign Tasks</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
        </div>

        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Selected Tasks ({tasks.length})</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {tasks.map((task) => (
              <div key={task.id} className="text-sm text-blue-800">
                • {task.title}
              </div>
            ))}
          </div>
        </div>

        {volunteerList.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">No volunteers available</div>
            <div className="text-sm text-gray-400">Make sure volunteers have applied and been accepted</div>
          </div>
        ) : (
          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Volunteer *</label>
              <select
                value={selectedVolunteer}
                onChange={(e) => setSelectedVolunteer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                required
              >
                <option value="">Choose a volunteer...</option>
                {volunteerList.map((application) => (
                  <option key={application.id} value={application.volunteer?.id}>
                    {application.volunteer?.name} ({application.volunteer?.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Notes</label>
              <textarea
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                rows="3"
                placeholder="Add notes for all task assignments..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Assign All Tasks
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
        )}
      </div>
    </div>
  );
}

// Component for task template modal
function TaskTemplateModal({ templates, opportunities, onCreateFromTemplate, onClose }) {
  const [selectedTemplate, setSelectedTemplate] = React.useState('');
  const [selectedOpportunity, setSelectedOpportunity] = React.useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!selectedTemplate || !selectedOpportunity) {
      alert('Please select both template and opportunity');
      return;
    }

    onCreateFromTemplate(parseInt(selectedTemplate), parseInt(selectedOpportunity));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Create Tasks from Template</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
        </div>

        <form onSubmit={handleCreate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Opportunity *</label>
            <select
              value={selectedOpportunity}
              onChange={(e) => setSelectedOpportunity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              required
            >
              <option value="">Choose an opportunity...</option>
              {opportunities.map((opp) => (
                <option key={opp.id} value={opp.id}>{opp.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Template *</label>
            <div className="space-y-3">
              {templates.map((template) => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      id={`template-${template.id}`}
                      name="template"
                      value={template.id}
                      checked={selectedTemplate === template.id.toString()}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <label htmlFor={`template-${template.id}`} className="font-medium text-gray-900 cursor-pointer">
                        {template.name}
                      </label>
                      <div className="mt-2 space-y-1">
                        {template.tasks.map((task, index) => (
                          <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                            <span className="font-medium">{task.title}</span>
                            <span className="text-gray-400">•</span>
                            <span>{task.estimated_hours}h</span>
                            <span className="text-gray-400">•</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              task.priority === 'high' ? 'bg-red-100 text-red-800' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Tasks from Template
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
