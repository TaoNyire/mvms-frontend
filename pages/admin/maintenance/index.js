import React, { useState, useEffect } from "react";
import Head from "next/head";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import {
  WrenchScrewdriverIcon,
  CircleStackIcon,
  CloudArrowUpIcon,
  ServerIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function SystemMaintenance() {
  const { token } = useAuth();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [loading, setLoading] = useState(true);
  const [maintenanceData, setMaintenanceData] = useState(null);
  const [apiError, setApiError] = useState("");

  // Load maintenance data from database
  useEffect(() => {
    if (!token) return;
    fetchMaintenanceData();
  }, [token]);

  const fetchMaintenanceData = async () => {
    try {
      setLoading(true);
      setApiError("");
      const response = await axios.get(`${API_BASE}/admin/maintenance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMaintenanceData(response.data);
      setMaintenanceMode(response.data.maintenanceMode || false);
    } catch (error) {
      console.error("Failed to load maintenance data:", error);
      setApiError("Failed to load maintenance data from server");
    } finally {
      setLoading(false);
    }
  };

  // Use data from API or fallback to empty objects
  const systemHealth = maintenanceData?.systemHealth || {};
  const maintenanceTasks = maintenanceData?.maintenanceTasks || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'running': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleBackup = async () => {
    setBackupInProgress(true);
    try {
      console.log("Starting backup process...");

      const response = await axios.post(`${API_BASE}/admin/maintenance/backup`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(`Backup completed successfully! Size: ${response.data.size}`);
      console.log("Backup completed:", response.data);

      // Refresh maintenance data to update last backup time
      await fetchMaintenanceData();
    } catch (error) {
      console.error("Backup failed:", error);
      alert("Backup failed. Please try again.");
    } finally {
      setBackupInProgress(false);
    }
  };

  const handleMaintenanceTask = async (task) => {
    try {
      console.log(`Running maintenance task: ${task.name}`);

      const response = await axios.post(`${API_BASE}/admin/maintenance/task/${task.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(`${task.name} completed successfully!`);
      console.log(`Task completed:`, response.data);

      // Refresh maintenance data to update task status
      await fetchMaintenanceData();
    } catch (error) {
      console.error(`Task failed: ${task.name}`, error);
      alert(`${task.name} failed. Please try again.`);
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>System Maintenance - Admin Dashboard</title>
          <meta name="description" content="Monitor system health and perform maintenance tasks" />
        </Head>
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
              Loading maintenance data...
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>System Maintenance - Admin Dashboard</title>
        <meta name="description" content="Monitor system health and perform maintenance tasks" />
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">System Maintenance</h1>
            <p className="text-gray-600 mt-1">Monitor system health and perform maintenance tasks</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleBackup}
              disabled={backupInProgress}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {backupInProgress ? "Backing up..." : "Run Backup"}
            </button>
            <button
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                maintenanceMode
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-yellow-600 text-white hover:bg-yellow-700"
              }`}
            >
              {maintenanceMode ? "Exit Maintenance" : "Maintenance Mode"}
            </button>
          </div>
        </div>

        {/* Maintenance Mode Alert */}
        {maintenanceMode && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              {ExclamationTriangleIcon ? (
                <ExclamationTriangleIcon className="w-5 h-5" />
              ) : (
                <span className="w-5 h-5 text-center">⚠️</span>
              )}
              <span className="font-medium">Maintenance Mode Active</span>
              <span className="text-sm">- The system is currently in maintenance mode</span>
            </div>
          </div>
        )}

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Database</h3>
              {CircleStackIcon ? (
                <CircleStackIcon className="w-5 h-5 text-gray-400" />
              ) : (
                <span className="w-5 h-5 text-center">🗄️</span>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemHealth.database.status)}`}>
                  {systemHealth.database.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Response</span>
                <span className="text-xs font-medium">{systemHealth.database.response}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Uptime</span>
                <span className="text-xs font-medium">{systemHealth.database.uptime}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">API Server</h3>
              {ServerIcon ? (
                <ServerIcon className="w-5 h-5 text-gray-400" />
              ) : (
                <span className="w-5 h-5 text-center">🖥️</span>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemHealth.api.status)}`}>
                  {systemHealth.api.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Response</span>
                <span className="text-xs font-medium">{systemHealth.api.response}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Uptime</span>
                <span className="text-xs font-medium">{systemHealth.api.uptime}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Storage</h3>
              {CloudArrowUpIcon ? (
                <CloudArrowUpIcon className="w-5 h-5 text-gray-400" />
              ) : (
                <span className="w-5 h-5 text-center">☁️</span>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemHealth.storage.status)}`}>
                  {systemHealth.storage.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Usage</span>
                <span className="text-xs font-medium">{systemHealth.storage.usage}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Available</span>
                <span className="text-xs font-medium">{systemHealth.storage.available}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Memory</h3>
              {ChartBarIcon ? (
                <ChartBarIcon className="w-5 h-5 text-gray-400" />
              ) : (
                <span className="w-5 h-5 text-center">📊</span>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemHealth.memory.status)}`}>
                  {systemHealth.memory.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Usage</span>
                <span className="text-xs font-medium">{systemHealth.memory.usage}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Available</span>
                <span className="text-xs font-medium">{systemHealth.memory.available}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            {WrenchScrewdriverIcon ? (
              <WrenchScrewdriverIcon className="w-5 h-5 text-gray-600" />
            ) : (
              <span className="w-5 h-5 text-center">🔧</span>
            )}
            Maintenance Tasks
          </h3>
          <div className="space-y-4">
            {maintenanceTasks.map((task) => (
              <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900">{task.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                    <div className="flex items-center gap-6 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        {CheckCircleIcon ? (
                          <CheckCircleIcon className="w-3 h-3" />
                        ) : (
                          <span className="w-3 h-3 text-center">✅</span>
                        )}
                        <span>Last: {task.lastRun}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {ClockIcon ? (
                          <ClockIcon className="w-3 h-3" />
                        ) : (
                          <span className="w-3 h-3 text-center">⏰</span>
                        )}
                        <span>Next: {task.nextRun}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleMaintenanceTask(task)}
                    className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm"
                  >
                    Run Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
