// Report utility functions for formatting and exporting

/**
 * Format report data for display
 */
export const formatReportData = (reportData, reportType) => {
  if (!reportData) return null;

  const formatters = {
    completed_tasks: formatCompletedTasksReport,
    failed_tasks: formatFailedTasksReport,
    current_volunteers: formatCurrentVolunteersReport,
    comprehensive: formatComprehensiveReport,
  };

  const formatter = formatters[reportType];
  return formatter ? formatter(reportData) : reportData;
};

/**
 * Format completed tasks report
 */
const formatCompletedTasksReport = (data) => {
  return {
    ...data,
    formattedTasks: data.tasks?.map(task => ({
      ...task,
      completedDate: new Date(task.updated_at).toLocaleDateString(),
      volunteerNames: task.applications?.map(app => app.user?.name).join(', ') || 'N/A',
    })) || []
  };
};

/**
 * Format failed tasks report
 */
const formatFailedTasksReport = (data) => {
  return {
    ...data,
    formattedTasks: data.tasks?.map(task => ({
      ...task,
      failedDate: new Date(task.updated_at).toLocaleDateString(),
      volunteerNames: task.applications?.map(app => app.user?.name).join(', ') || 'N/A',
      statusReason: getStatusReason(task.status),
    })) || []
  };
};

/**
 * Format current volunteers report
 */
const formatCurrentVolunteersReport = (data) => {
  return {
    ...data,
    formattedVolunteers: data.volunteers?.map(volunteer => ({
      ...volunteer,
      joinedDate: new Date(volunteer.user?.created_at).toLocaleDateString(),
      taskProgress: `${volunteer.task_progress || 0}%`,
    })) || []
  };
};

/**
 * Format comprehensive report
 */
const formatComprehensiveReport = (data) => {
  return {
    ...data,
    charts: {
      taskDistribution: {
        labels: ['Completed', 'Failed', 'Active'],
        data: [
          data.overall_summary?.completed_tasks || 0,
          data.overall_summary?.failed_tasks || 0,
          data.overall_summary?.active_tasks || 0,
        ]
      }
    }
  };
};

/**
 * Get human-readable status reason
 */
const getStatusReason = (status) => {
  const reasons = {
    cancelled: 'Task was cancelled',
    failed: 'Task failed to complete',
    overdue: 'Task is overdue',
  };
  return reasons[status] || status;
};

/**
 * Export data to CSV format
 */
export const exportToCSV = (data, filename) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    alert('No data available to export');
    return;
  }

  try {
    // Get headers from the first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','), // Header row
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle nested objects and arrays
          const cellValue = typeof value === 'object' && value !== null 
            ? JSON.stringify(value).replace(/"/g, '""')
            : String(value || '').replace(/"/g, '""');
          return `"${cellValue}"`;
        }).join(',')
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Error exporting CSV:', error);
    alert('Failed to export CSV file');
  }
};

/**
 * Export data to JSON format
 */
export const exportToJSON = (data, filename) => {
  if (!data) {
    alert('No data available to export');
    return;
  }

  try {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Error exporting JSON:', error);
    alert('Failed to export JSON file');
  }
};

/**
 * Print report with custom styling
 */
export const printReport = (elementId = 'report-content') => {
  const printContent = document.getElementById(elementId);
  if (!printContent) {
    alert('Report content not found');
    return;
  }

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Report</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          color: #333;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 20px 0;
        }
        th, td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left;
        }
        th { 
          background-color: #f5f5f5; 
          font-weight: bold;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin: 20px 0;
        }
        .summary-item {
          border: 1px solid #ddd;
          padding: 15px;
          border-radius: 5px;
        }
        .summary-label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
        }
        .summary-value {
          font-size: 24px;
          font-weight: bold;
          margin-top: 5px;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      ${printContent.innerHTML}
    </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  
  // Wait for content to load then print
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

/**
 * Generate report summary statistics
 */
export const generateSummaryStats = (reportData, reportType) => {
  if (!reportData) return {};

  const stats = {};

  switch (reportType) {
    case 'completed_tasks':
      stats.totalTasks = reportData.tasks?.length || 0;
      stats.totalVolunteers = new Set(
        reportData.tasks?.flatMap(task => 
          task.applications?.map(app => app.user?.id) || []
        )
      ).size;
      break;

    case 'failed_tasks':
      stats.totalFailed = reportData.tasks?.length || 0;
      stats.cancelledTasks = reportData.tasks?.filter(t => t.status === 'cancelled').length || 0;
      stats.failedTasks = reportData.tasks?.filter(t => t.status === 'failed').length || 0;
      stats.overdueTasks = reportData.tasks?.filter(t => t.status === 'overdue').length || 0;
      break;

    case 'current_volunteers':
      stats.activeVolunteers = reportData.volunteers?.length || 0;
      stats.averageProgress = reportData.volunteers?.reduce((sum, v) => 
        sum + (v.task_progress || 0), 0) / (reportData.volunteers?.length || 1);
      break;

    case 'comprehensive':
      stats.completionRate = reportData.overall_summary?.completion_rate || 0;
      stats.totalTasks = reportData.overall_summary?.total_tasks || 0;
      stats.totalVolunteers = reportData.overall_summary?.total_volunteers || 0;
      break;
  }

  return stats;
};

/**
 * Format date for display
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Format percentage for display
 */
export const formatPercentage = (value) => {
  if (typeof value !== 'number') return '0%';
  return `${Math.round(value * 100) / 100}%`;
};

/**
 * Get report type display name
 */
export const getReportTypeDisplayName = (reportType) => {
  const names = {
    completed_tasks: 'Completed Tasks Report',
    failed_tasks: 'Failed Tasks Report',
    current_volunteers: 'Current Volunteers Report',
    comprehensive: 'Comprehensive Monthly Report',
  };
  return names[reportType] || reportType;
};
