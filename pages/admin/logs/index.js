import React, { useState, useEffect } from "react";
import Head from "next/head";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import {
  ClockIcon,
  UserIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function SystemLogs() {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState("");
  
  // Filters
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    days: 7,
    per_page: 50
  });

  // Load logs and statistics
  useEffect(() => {
    if (!token) return;
    fetchLogs();
    fetchStatistics();
  }, [token, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setApiError("");
      const response = await axios.get(`${API_BASE}/admin/logs`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters
      });
      setLogs(response.data.data || []);
    } catch (error) {
      console.error("Failed to load logs:", error);
      setApiError("Failed to load system logs from server");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${API_BASE}/admin/logs/statistics`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { days: filters.days }
      });
      setStatistics(response.data);
    } catch (error) {
      console.error("Failed to load log statistics:", error);
    }
  };

  const refreshLogs = async () => {
    setRefreshing(true);
    await fetchLogs();
    await fetchStatistics();
    setRefreshing(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case 'failed':
      case 'error':
        return <XCircleIcon className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'login':
        return 'bg-blue-100 text-blue-800';
      case 'logout':
        return 'bg-gray-100 text-gray-800';
      case 'user_action':
        return 'bg-green-100 text-green-800';
      case 'system':
        return 'bg-purple-100 text-purple-800';
      case 'security':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>System Logs - Admin Dashboard</title>
          <meta name="description" content="View and monitor system logs and activities" />
        </Head>
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
              Loading system logs...
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>System Logs - Admin Dashboard</title>
        <meta name="description" content="View and monitor system logs and activities" />
      </Head>

      <div className="space-y-6">
        {/* Error Message */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {apiError}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
            <p className="text-gray-600 mt-1">Monitor system activities and security events</p>
          </div>
          <button
            onClick={refreshLogs}
            disabled={refreshing}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Logs</h3>
            <p className="text-2xl font-bold text-indigo-600">{statistics.total_logs || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Last {filters.days} days</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Failed Logins</h3>
            <p className="text-2xl font-bold text-red-600">{statistics.recent_failed_logins || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Security events</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Active Users</h3>
            <p className="text-2xl font-bold text-green-600">{statistics.unique_users || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Unique users</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Security Events</h3>
            <p className="text-2xl font-bold text-yellow-600">{statistics.security_events || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Alerts & warnings</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FunnelIcon className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Log Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Types</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="user_action">User Actions</option>
                <option value="system">System Events</option>
                <option value="security">Security Events</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
              <select
                value={filters.days}
                onChange={(e) => setFilters({...filters, days: parseInt(e.target.value)})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={1}>Last 24 hours</option>
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Per Page</label>
              <select
                value={filters.per_page}
                onChange={(e) => setFilters({...filters, per_page: parseInt(e.target.value)})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-gray-600" />
              System Activity Logs
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No logs found for the selected criteria.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{log.formatted_time}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(log.type)}`}>
                          {log.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="font-medium">{log.user}</div>
                            {log.user_email && (
                              <div className="text-xs text-gray-500">{log.user_email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate" title={log.description}>
                          {log.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          {getStatusIcon(log.status)}
                          <span className="ml-2 capitalize">{log.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <ComputerDesktopIcon className="w-4 h-4 text-gray-400 mr-2" />
                          {log.ip_address || 'N/A'}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
