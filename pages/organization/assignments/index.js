import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import {
  ClipboardDocumentListIcon,
  UserIcon,
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
  XMarkIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function TaskAssignments() {
  const { token } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchAssignments = useCallback(async () => {
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
      console.error("Failed to load assignments:", error);
      setAssignments([]);

      if (error.response?.status === 401) {
        setApiError("Authentication failed. Please log in again.");
      } else if (error.response?.status === 403) {
        setApiError("Access denied. Please check your permissions.");
      } else {
        setApiError("Failed to load assignments. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter]);

  useEffect(() => {
    if (!token) return;
    fetchAssignments();
  }, [token, fetchAssignments]);

  const updateAssignmentStatus = async (assignmentId, status, notes = '') => {
    try {
      await axios.put(`${API_BASE}/task-assignments/${assignmentId}`, {
        status,
        completion_notes: notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchAssignments();
      alert('Assignment status updated successfully!');
    } catch (error) {
      console.error("Failed to update assignment:", error);
      alert("Failed to update assignment. Please try again.");
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openDetailsModal = (assignment) => {
    setSelectedAssignment(assignment);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Task Assignments - Organization Dashboard</title>
          <meta name="description" content="Manage volunteer task assignments" />
        </Head>
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              Loading assignments...
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Task Assignments - Organization Dashboard</title>
        <meta name="description" content="Manage volunteer task assignments" />
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
              Task Assignments
            </h1>
            <p className="text-gray-600 mt-1">Monitor and manage volunteer task assignments</p>
          </div>
          
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Assignments</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assignments</p>
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
                <p className="text-sm font-medium text-gray-600">Assigned</p>
                <p className="text-2xl font-bold text-blue-600">
                  {assignments.filter(a => a.status === 'assigned').length}
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Assignments List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Task Assignments</h2>
          </div>
          
          {assignments.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-500 mb-2">No assignments found</div>
              <div className="text-sm text-gray-400">Assign tasks to volunteers to see them here</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task & Volunteer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignments.map((assignment) => (
                    <AssignmentRow 
                      key={assignment.id} 
                      assignment={assignment} 
                      onStatusUpdate={updateAssignmentStatus}
                      onViewDetails={openDetailsModal}
                      formatDate={formatDate}
                      getStatusColor={getStatusColor}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Assignment Details Modal */}
        {showDetailsModal && selectedAssignment && (
          <AssignmentDetailsModal
            assignment={selectedAssignment}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedAssignment(null);
            }}
            formatDate={formatDate}
          />
        )}
      </div>
    </>
  );
}

// Component for assignment rows
function AssignmentRow({ assignment, onStatusUpdate, onViewDetails, formatDate, getStatusColor }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div>
          <div className="text-sm font-medium text-gray-900">{assignment.opportunity_task?.title}</div>
          <div className="text-sm text-gray-500">
            Volunteer: {assignment.volunteer?.name} ({assignment.volunteer?.email})
          </div>
          <div className="text-xs text-gray-400">
            Opportunity: {assignment.opportunity_task?.opportunity?.title}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(assignment.status)}`}>
          {assignment.status.replace('_', ' ')}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${assignment.progress_percentage || 0}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-600">{assignment.progress_percentage || 0}%</span>
        </div>
        {assignment.hours_logged && (
          <div className="text-xs text-gray-500 mt-1">
            {assignment.hours_logged} hours logged
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatDate(assignment.assigned_at)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetails(assignment)}
            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
            title="View Details"
          >
            <EyeIcon className="w-4 h-4" />
            Details
          </button>

          {assignment.status === 'assigned' && (
            <button
              onClick={() => onStatusUpdate(assignment.id, 'in_progress')}
              className="text-green-600 hover:text-green-900"
              title="Mark In Progress"
            >
              Start
            </button>
          )}

          {assignment.status === 'in_progress' && (
            <button
              onClick={() => onStatusUpdate(assignment.id, 'completed')}
              className="text-green-600 hover:text-green-900"
              title="Mark Complete"
            >
              Complete
            </button>
          )}

          {assignment.status !== 'completed' && assignment.status !== 'cancelled' && (
            <button
              onClick={() => onStatusUpdate(assignment.id, 'cancelled')}
              className="text-red-600 hover:text-red-900"
              title="Cancel Assignment"
            >
              Cancel
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// Component for assignment details modal
function AssignmentDetailsModal({ assignment, onClose, formatDate }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Assignment Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Task Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Task Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Title:</span>
                <span className="ml-2 text-gray-900">{assignment.opportunity_task?.title}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Priority:</span>
                <span className="ml-2 text-gray-900">{assignment.opportunity_task?.priority}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Due Date:</span>
                <span className="ml-2 text-gray-900">
                  {assignment.opportunity_task?.due_date ? formatDate(assignment.opportunity_task.due_date) : 'No due date'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Estimated Hours:</span>
                <span className="ml-2 text-gray-900">{assignment.opportunity_task?.estimated_hours || 'Not specified'}</span>
              </div>
            </div>
            {assignment.opportunity_task?.description && (
              <div className="mt-3">
                <span className="font-medium text-gray-700">Description:</span>
                <p className="mt-1 text-gray-900">{assignment.opportunity_task.description}</p>
              </div>
            )}
          </div>

          {/* Volunteer Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Volunteer Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Name:</span>
                <span className="ml-2 text-gray-900">{assignment.volunteer?.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <span className="ml-2 text-gray-900">{assignment.volunteer?.email}</span>
              </div>
            </div>
          </div>

          {/* Assignment Status */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Assignment Status</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className="ml-2 text-gray-900">{assignment.status.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Progress:</span>
                <span className="ml-2 text-gray-900">{assignment.progress_percentage || 0}%</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Assigned:</span>
                <span className="ml-2 text-gray-900">{formatDate(assignment.assigned_at)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Hours Logged:</span>
                <span className="ml-2 text-gray-900">{assignment.hours_logged || 0} hours</span>
              </div>
            </div>

            {assignment.started_at && (
              <div className="mt-2 text-sm">
                <span className="font-medium text-gray-700">Started:</span>
                <span className="ml-2 text-gray-900">{formatDate(assignment.started_at)}</span>
              </div>
            )}

            {assignment.completed_at && (
              <div className="mt-2 text-sm">
                <span className="font-medium text-gray-700">Completed:</span>
                <span className="ml-2 text-gray-900">{formatDate(assignment.completed_at)}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          {(assignment.assignment_notes || assignment.completion_notes) && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
              {assignment.assignment_notes && (
                <div className="mb-2">
                  <span className="font-medium text-gray-700">Assignment Notes:</span>
                  <p className="mt-1 text-gray-900">{assignment.assignment_notes}</p>
                </div>
              )}
              {assignment.completion_notes && (
                <div>
                  <span className="font-medium text-gray-700">Completion Notes:</span>
                  <p className="mt-1 text-gray-900">{assignment.completion_notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-6">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
