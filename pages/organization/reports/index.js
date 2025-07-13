import React, { useState, useEffect } from "react";
import Head from "next/head";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import OrgLayout from "../../../components/organization/OrgLayout";
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  TrophyIcon,
  MapPinIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function OrganizationReports() {
  const { token } = useAuth();
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [dateRange, setDateRange] = useState("30");
  const [reportType, setReportType] = useState("overview");
  const [customFilters, setCustomFilters] = useState({
    opportunity: "",
    volunteer: "",
    status: "all"
  });
  const [showExportModal, setShowExportModal] = useState(false);
  const [activeTab, setActiveTab] = useState("completed");

  useEffect(() => {
    if (!token) return;
    fetchReports();
  }, [token, dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setApiError("");

      // Set empty data - no sample data
      const emptyReports = {
        completed_opportunities: [],
        volunteer_performance: [],
        opportunity_statistics: {
          total_opportunities: 0,
          completed_opportunities: 0,
          completion_rate: 0,
          total_volunteers_engaged: 0,
          total_tasks_completed: 0,
          average_completion_time_days: 0
        },
        monthly_trends: [],
        date_range: dateRange,
        generated_at: new Date().toISOString()
      };

      setReports(emptyReports);
    } catch (error) {
      console.error("Failed to load reports:", error);
      setApiError("Failed to load reports from server. Error: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format = 'json') => {
    try {
      if (!reports) {
        alert('No report data to export. Please wait for reports to load.');
        return;
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const reportData = {
        report_type: reportType,
        date_range: dateRange,
        generated_at: new Date().toISOString(),
        organization: user?.name || 'Organization',
        ...reports
      };

      let dataUri, fileName, mimeType;

      switch (format) {
        case 'csv':
          const csvData = convertToCSV(reportData);
          dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvData);
          fileName = `${reportType}_report_${timestamp}.csv`;
          break;

        case 'pdf':
          // For PDF, we'll create a simple HTML version and let browser handle PDF conversion
          const htmlContent = generateHTMLReport(reportData);
          const printWindow = window.open('', '_blank');
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          printWindow.print();
          return;

        case 'excel':
          // For Excel, we'll use CSV format with .xlsx extension (simplified)
          const excelData = convertToCSV(reportData);
          dataUri = 'data:application/vnd.ms-excel;charset=utf-8,' + encodeURIComponent(excelData);
          fileName = `${reportType}_report_${timestamp}.xlsx`;
          break;

        default: // json
          dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2));
          fileName = `${reportType}_report_${timestamp}.json`;
      }

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', fileName);
      linkElement.click();

    } catch (error) {
      console.error("Failed to export report:", error);
      alert("Failed to export report. Please try again.");
    }
  };

  const convertToCSV = (data) => {
    const headers = ['Metric', 'Value', 'Description'];
    const rows = [headers.join(',')];

    // Add opportunity statistics
    if (data.opportunity_statistics) {
      rows.push(`Total Opportunities,${data.opportunity_statistics.total || 0},Total number of opportunities`);
      rows.push(`Active Opportunities,${data.opportunity_statistics.active || 0},Currently active opportunities`);
      rows.push(`Completed Opportunities,${data.opportunity_statistics.completed || 0},Successfully completed opportunities`);
    }

    // Add volunteer statistics
    if (data.volunteer_statistics) {
      rows.push(`Total Volunteers,${data.volunteer_statistics.total || 0},Total registered volunteers`);
      rows.push(`Active Volunteers,${data.volunteer_statistics.active || 0},Currently active volunteers`);
    }

    return rows.join('\n');
  };

  const generateHTMLReport = (data) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${data.report_type} Report - ${data.organization}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
          .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
          .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
          .stat-label { color: #666; margin-top: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${data.report_type.charAt(0).toUpperCase() + data.report_type.slice(1)} Report</h1>
          <p>Generated on: ${new Date(data.generated_at).toLocaleDateString()}</p>
          <p>Organization: ${data.organization}</p>
          <p>Date Range: ${data.date_range} days</p>
        </div>
        <div class="stats">
          ${data.opportunity_statistics ? `
            <div class="stat-card">
              <div class="stat-value">${data.opportunity_statistics.total || 0}</div>
              <div class="stat-label">Total Opportunities</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${data.opportunity_statistics.active || 0}</div>
              <div class="stat-label">Active Opportunities</div>
            </div>
          ` : ''}
          ${data.volunteer_statistics ? `
            <div class="stat-card">
              <div class="stat-value">${data.volunteer_statistics.total || 0}</div>
              <div class="stat-label">Total Volunteers</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${data.volunteer_statistics.active || 0}</div>
              <div class="stat-label">Active Volunteers</div>
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <OrgLayout>
        <Head>
          <title>Reports - Organization Dashboard</title>
          <meta name="description" content="View comprehensive reports on volunteer activities and completed opportunities" />
        </Head>
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              Loading reports...
            </div>
          </div>
        </div>
      </OrgLayout>
    );
  }

  return (
    <OrgLayout>
      <Head>
        <title>Reports - Organization Dashboard</title>
        <meta name="description" content="View comprehensive reports on volunteer activities and completed opportunities" />
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
              Organization Reports
            </h1>
            <p className="text-gray-600 mt-1">Track completed opportunities and volunteer performance</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="overview">Overview Report</option>
              <option value="volunteer">Volunteer Performance</option>
              <option value="opportunity">Opportunity Analysis</option>
              <option value="impact">Impact Measurement</option>
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            
            <div className="flex gap-2">
              <button
                onClick={() => exportReport('pdf')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <DocumentArrowDownIcon className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={() => exportReport('csv')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <DocumentArrowDownIcon className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={() => exportReport('excel')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <DocumentArrowDownIcon className="w-4 h-4" />
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {reports?.opportunity_statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Opportunities</p>
                  <p className="text-2xl font-bold text-blue-600">{reports.opportunity_statistics.total_opportunities}</p>
                </div>
                <BriefcaseIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Opportunities</p>
                  <p className="text-2xl font-bold text-green-600">{reports.opportunity_statistics.completed_opportunities}</p>
                  <p className="text-xs text-gray-500">{reports.opportunity_statistics.completion_rate}% completion rate</p>
                </div>
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Volunteers Engaged</p>
                  <p className="text-2xl font-bold text-purple-600">{reports.opportunity_statistics.total_volunteers_engaged}</p>
                </div>
                <UserGroupIcon className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
                  <p className="text-2xl font-bold text-indigo-600">{reports.opportunity_statistics.total_tasks_completed}</p>
                  <p className="text-xs text-gray-500">Avg {reports.opportunity_statistics.average_completion_time_days} days</p>
                </div>
                <TrophyIcon className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("completed")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "completed"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Completed Opportunities ({reports?.completed_opportunities?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("volunteers")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "volunteers"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Volunteer Performance ({reports?.volunteer_performance?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("trends")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "trends"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Monthly Trends
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "completed" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Completed Opportunities</h2>
              {reports?.completed_opportunities?.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">No completed opportunities in the selected time period.</div>
                </div>
              ) : (
                <div className="grid gap-6">
                  {reports?.completed_opportunities?.map((opportunity) => (
                    <CompletedOpportunityCard key={opportunity.id} opportunity={opportunity} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "volunteers" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Volunteer Performance</h2>
              {reports?.volunteer_performance?.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">No volunteer performance data available.</div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Volunteer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tasks Completed
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Avg Rating
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Avg Duration
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Performance Score
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reports?.volunteer_performance?.map((volunteer) => (
                          <VolunteerPerformanceRow key={volunteer.volunteer_id} volunteer={volunteer} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "trends" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Monthly Trends</h2>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="space-y-4">
                  {reports?.monthly_trends?.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-900">{trend.month}</span>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-green-600" />
                          <span className="text-gray-600">Completed Tasks:</span>
                          <span className="font-medium text-green-600">{trend.completed_tasks}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserGroupIcon className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-600">New Volunteers:</span>
                          <span className="font-medium text-blue-600">{trend.new_volunteers}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </OrgLayout>
  );
}

// Component for completed opportunity cards
function CompletedOpportunityCard({ opportunity }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'fully_completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'partially_completed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">{opportunity.title}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(opportunity.status)}`}>
              {opportunity.status.replace('_', ' ')}
            </span>
          </div>

          <p className="text-gray-600 mb-4">{opportunity.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPinIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{opportunity.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{formatDate(opportunity.start_date)} - {formatDate(opportunity.end_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserGroupIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{opportunity.completed_volunteers}/{opportunity.total_volunteers_needed} volunteers</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Avg {opportunity.average_duration?.toFixed(1) || 0} days</span>
            </div>
          </div>
        </div>

        <div className="lg:w-48">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{opportunity.completion_rate}%</div>
            <div className="text-xs text-gray-500">Completion Rate</div>
          </div>
        </div>
      </div>

      {opportunity.volunteers && opportunity.volunteers.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Volunteers ({opportunity.volunteers.length})</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {opportunity.volunteers.map((volunteer, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{volunteer.name}</div>
                  <div className="text-xs text-gray-500">{volunteer.duration_days} days</div>
                </div>
                {volunteer.feedback_rating && (
                  <div className="flex items-center gap-1">
                    <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{volunteer.feedback_rating}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Component for volunteer performance rows
function VolunteerPerformanceRow({ volunteer }) {
  const getPerformanceColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">{volunteer.volunteer_name}</div>
          <div className="text-sm text-gray-500">{volunteer.volunteer_email}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {volunteer.completed_tasks}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {volunteer.average_rating ? (
          <div className="flex items-center gap-1">
            <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
            {volunteer.average_rating}
          </div>
        ) : (
          'N/A'
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {volunteer.average_duration_days ? `${volunteer.average_duration_days} days` : 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPerformanceColor(volunteer.performance_score)}`}>
          {volunteer.performance_score}%
        </span>
      </td>
    </tr>
  );
}
