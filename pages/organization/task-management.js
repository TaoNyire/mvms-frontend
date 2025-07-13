import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useAuth } from "../../context/AuthContext";
import {
  getOpportunities,
  getOpportunityTasks,
  createTask,
  updateTask,
  completeTask,
  assignVolunteersToTask,
  reassignVolunteers,
  getCurrentVolunteers
} from "../../lib/api";
import {
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

export default function TaskManagement() {
  const { token } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    if (!token) return;
    fetchOpportunities();
    fetchVolunteers();
  }, [token]);

  useEffect(() => {
    if (selectedOpportunity) {
      fetchTasks(selectedOpportunity.id);
    }
  }, [selectedOpportunity]);

  const fetchOpportunities = async () => {
    try {
      const response = await getOpportunities();
      setOpportunities(response.data.data || response.data || []);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
    }
  };

  const fetchTasks = async (opportunityId) => {
    try {
      const response = await getOpportunityTasks(opportunityId);
      setTasks(response.data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const fetchVolunteers = async () => {
    try {
      const response = await getCurrentVolunteers();
      setVolunteers(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!selectedOpportunity) return;

    try {
      await createTask(selectedOpportunity.id, newTask);
      setNewTask({ title: "", description: "", start_date: "", end_date: "" });
      setShowCreateTask(false);
      fetchTasks(selectedOpportunity.id);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await completeTask(taskId, { completion_notes: "Completed by organization" });
      fetchTasks(selectedOpportunity.id);
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading task management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Task Management - Organization Dashboard</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="mt-2 text-gray-600">
            Create and manage tasks for your opportunities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Opportunities List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Your Opportunities
              </h2>
              <div className="space-y-3">
                {opportunities.map((opportunity) => (
                  <div
                    key={opportunity.id}
                    onClick={() => setSelectedOpportunity(opportunity)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedOpportunity?.id === opportunity.id
                        ? "bg-blue-50 border-2 border-blue-200"
                        : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                    }`}
                  >
                    <h3 className="font-medium text-gray-900">{opportunity.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {opportunity.volunteers_needed} volunteers needed
                    </p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                      opportunity.status === 'active' ? 'bg-green-100 text-green-800' :
                      opportunity.status === 'recruitment_closed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {opportunity.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tasks Management */}
          <div className="lg:col-span-2">
            {selectedOpportunity ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Tasks for "{selectedOpportunity.title}"
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Manage tasks and assign volunteers
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCreateTask(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create Task
                  </button>
                </div>

                {/* Create Task Form */}
                {showCreateTask && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-4">Create New Task</h3>
                    <form onSubmit={handleCreateTask} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Task Title
                          </label>
                          <input
                            type="text"
                            value={newTask.title}
                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={newTask.description}
                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="2"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={newTask.start_date}
                            onChange={(e) => setNewTask({ ...newTask, start_date: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                          </label>
                          <input
                            type="date"
                            value={newTask.end_date}
                            onChange={(e) => setNewTask({ ...newTask, end_date: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                          Create Task
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCreateTask(false)}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Tasks List */}
                <div className="space-y-4">
                  {tasks.length === 0 ? (
                    <div className="text-center py-8">
                      <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No tasks created yet</p>
                      <p className="text-sm text-gray-500">Create your first task to get started</p>
                    </div>
                  ) : (
                    tasks.map((task) => (
                      <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{task.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>Start: {new Date(task.start_date).toLocaleDateString()}</span>
                              <span>End: {new Date(task.end_date).toLocaleDateString()}</span>
                              <span className="flex items-center">
                                <UserGroupIcon className="h-4 w-4 mr-1" />
                                {task.assigned_volunteers || 0} volunteers
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                            {task.status === 'active' && (
                              <button
                                onClick={() => handleCompleteTask(task.id)}
                                className="text-green-600 hover:text-green-800"
                                title="Complete Task"
                              >
                                <CheckCircleIcon className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-8">
                  <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Select an opportunity to manage its tasks</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
