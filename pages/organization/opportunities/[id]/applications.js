import React, { useEffect, useState } from "react";
import Head from "next/head";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function OpportunityApplications() {
  const { token } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  const [opportunity, setOpportunity] = useState(null);
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!id || !token) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    setApiError("");

    try {
      const [oppRes, appsRes] = await Promise.all([
        axios.get(`${API_BASE}/opportunities/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/opportunities/${id}/applications`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setOpportunity(oppRes.data.data || oppRes.data);
      setApplications(appsRes.data.data || appsRes.data || []);
    } catch (error) {
      console.error("Failed to load data:", error);
      setApiError("Failed to load applications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(app =>
        (app.volunteer_name || app.volunteer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.volunteer_email || app.volunteer?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  };

  const handleApplicationAction = async (applicationId, action) => {
    setActionLoading({ ...actionLoading, [applicationId]: true });

    try {
      await axios.put(
        `${API_BASE}/applications/${applicationId}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh applications
      await fetchData();
    } catch (error) {
      console.error(`Failed to ${action} application:`, error);
      setApiError(`Failed to ${action} application. Please try again.`);
    } finally {
      setActionLoading({ ...actionLoading, [applicationId]: false });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Applications - Organization Dashboard</title>
        </Head>
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              Loading applications...
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Applications for {opportunity?.title || 'Opportunity'} - Organization Dashboard</title>
        <meta name="description" content="Manage applications for your volunteer opportunity" />
      </Head>

      <div className="space-y-6">
        {/* Back Navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <nav className="text-sm text-gray-600">
            <Link href="/organization/opportunities" className="hover:text-gray-900">
              Opportunities
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/organization/opportunities/${id}`} className="hover:text-gray-900">
              {opportunity?.title || 'Details'}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Applications</span>
          </nav>
        </div>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Applications for "{opportunity?.title}"
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and review volunteer applications for this opportunity
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <UserGroupIcon className="w-5 h-5" />
              <span>{applications.length} total applications</span>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search volunteers by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {apiError && (
            <div className="p-4 bg-red-50 border-b border-red-200 text-red-700">
              {apiError}
            </div>
          )}
          
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== "all" ? "No matching applications" : "No applications yet"}
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "Applications will appear here once volunteers apply for this opportunity"
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredApplications.map((app) => (
                <div key={app.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserGroupIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {app.volunteer_name || app.volunteer?.name || 'Unknown Volunteer'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                          {app.volunteer_email && (
                            <div className="flex items-center gap-1">
                              <EnvelopeIcon className="w-4 h-4" />
                              <span>{app.volunteer_email}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            <span>
                              Applied {app.created_at 
                                ? new Date(app.created_at).toLocaleDateString()
                                : 'Unknown date'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(app.status)}`}>
                        {app.status || 'Pending'}
                      </span>
                      
                      {app.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApplicationAction(app.id, 'accept')}
                            disabled={actionLoading[app.id]}
                            className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleApplicationAction(app.id, 'reject')}
                            disabled={actionLoading[app.id]}
                            className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                          >
                            <XCircleIcon className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      )}
                      
                      <Link
                        href={`/organization/applications/${app.id}`}
                        className="flex items-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <EyeIcon className="w-4 h-4" />
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
