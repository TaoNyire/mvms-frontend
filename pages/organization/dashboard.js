import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import FeedbackDashboard from "../../components/feedback/FeedbackDashboard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function OrgDashboard() {
  const router = useRouter();
  const { user, token, loading: authLoading, logout } = useAuth();

  const [orgProfile, setOrgProfile] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [volunteerCount, setVolunteerCount] = useState(0);
  const [recentVolunteers, setRecentVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [trends, setTrends] = useState({
    volunteerGrowth: 0,
    applicationTrend: 0,
    completionRate: 0,
    engagementScore: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);


  useEffect(() => {
    if (!authLoading && (!user || user.role !== "organization")) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setApiError("");

    // Fetch org dashboard data, profile, opportunities, applications, and volunteer stats in parallel
    Promise.all([
      axios.get(`${API_BASE}/organization/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${API_BASE}/organization/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${API_BASE}/opportunities`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${API_BASE}/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${API_BASE}/org/current-volunteers`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${API_BASE}/org/recent-volunteers`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([dashboardRes, profileRes, oppsRes, appsRes, currentVolRes, recentVolRes]) => {
        // Dashboard stats are available in dashboardRes.data if needed
        setOrgProfile(profileRes.data);
        setOpportunities(oppsRes.data.data || oppsRes.data || []);
        setApplications(appsRes.data.data || appsRes.data || []);
        setVolunteerCount(currentVolRes.data.data ? currentVolRes.data.data.length : (currentVolRes.data.length || 0));
        setRecentVolunteers(recentVolRes.data.data || recentVolRes.data || []);
      })
      .catch((e) => {
        setApiError("Failed to load dashboard data. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Derive additional stats
  const pendingApplications = applications.filter(a => (a.status || a.application_status || '').toLowerCase() === "pending");
  const acceptedApplications = applications.filter(a => (a.status || a.application_status || '').toLowerCase() === "accepted");
  const rejectedApplications = applications.filter(a => (a.status || a.application_status || '').toLowerCase() === "rejected");

  // Calculate enhanced analytics
  React.useEffect(() => {
    if (applications.length > 0 && recentVolunteers.length > 0) {
      // Calculate trends (simplified for demo)
      const currentMonth = new Date().getMonth();
      const lastMonth = currentMonth - 1;

      const currentMonthApps = applications.filter(app =>
        new Date(app.created_at || app.application_date).getMonth() === currentMonth
      ).length;

      const lastMonthApps = applications.filter(app =>
        new Date(app.created_at || app.application_date).getMonth() === lastMonth
      ).length;

      const applicationTrend = lastMonthApps > 0 ?
        ((currentMonthApps - lastMonthApps) / lastMonthApps * 100) : 0;

      const completionRate = applications.length > 0 ?
        (acceptedApplications.length / applications.length * 100) : 0;

      setTrends({
        volunteerGrowth: recentVolunteers.length * 5, // Simplified calculation
        applicationTrend: Math.round(applicationTrend),
        completionRate: Math.round(completionRate),
        engagementScore: Math.round((acceptedApplications.length / Math.max(applications.length, 1)) * 100)
      });

      // Set recent activity (simplified)
      setRecentActivity([
        { type: 'application', message: `${pendingApplications.length} new applications received`, time: '2 hours ago' },
        { type: 'volunteer', message: `${recentVolunteers.length} volunteers joined recently`, time: '1 day ago' },
        { type: 'opportunity', message: `${opportunities.length} opportunities active`, time: '3 days ago' }
      ]);

      // Set top performers (simplified)
      setTopPerformers(
        acceptedApplications.slice(0, 3).map((app, index) => ({
          id: index + 1,
          name: app.volunteer?.name || 'Volunteer',
          score: 95 - (index * 5),
          tasks: 8 - index,
          hours: 24 - (index * 4)
        }))
      );
    }
  }, [applications, recentVolunteers, acceptedApplications, pendingApplications, opportunities]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-blue-600 font-semibold">Loading dashboard…</p>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600 font-semibold">{apiError}</p>
      </div>
    );
  }

  return (
    <div>

        {/* Welcome Section */}
        {orgProfile && (
          <div className="bg-white shadow-md p-4 rounded-lg mb-6">
            <div className="text-lg text-gray-700">
              Welcome back, <span className="font-semibold text-blue-700">{orgProfile.org_name || orgProfile.name}</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">{orgProfile.email}</div>
          </div>
        )}

        {/* Summary Cards */}
        <section className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard
            color="indigo"
            title="Opportunities"
            count={opportunities.length}
            onClick={() => router.push("/organization/opportunities")}
            description="Total volunteering opportunities posted."
          />
          <SummaryCard
            color="blue"
            title="Applications"
            count={applications.length}
            onClick={() => router.push("/organization/applications")}
            description="Total applications received."
          />
          <SummaryCard
            color="green"
            title="Current Volunteers"
            count={volunteerCount}
            onClick={() => router.push("/organization/applications?status=accepted")}
            description="Volunteers currently working with you."
          />
          <SummaryCard
            color="yellow"
            title="Pending Applications"
            count={pendingApplications.length}
            onClick={() => router.push("/organization/applications?status=pending")}
            description="Applications awaiting your response."
          />
        </section>

        {/* Enhanced Analytics */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Performance Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <TrendCard
              title="Volunteer Growth"
              value={`+${trends.volunteerGrowth}%`}
              trend="up"
              description="This month vs last month"
              color="green"
            />
            <TrendCard
              title="Application Rate"
              value={`${trends.applicationTrend >= 0 ? '+' : ''}${trends.applicationTrend}%`}
              trend={trends.applicationTrend >= 0 ? "up" : "down"}
              description="Monthly application trend"
              color={trends.applicationTrend >= 0 ? "green" : "red"}
            />
            <TrendCard
              title="Completion Rate"
              value={`${trends.completionRate}%`}
              trend="up"
              description="Application acceptance rate"
              color="blue"
            />
            <TrendCard
              title="Engagement Score"
              value={`${trends.engagementScore}%`}
              trend="up"
              description="Overall volunteer engagement"
              color="purple"
            />
          </div>

          {/* Recent Activity & Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'application' ? 'bg-blue-500' :
                      activity.type === 'volunteer' ? 'bg-green-500' : 'bg-purple-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
              <div className="space-y-3">
                {topPerformers.map((performer, index) => (
                  <div key={performer.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{performer.name}</p>
                        <p className="text-xs text-gray-500">{performer.tasks} tasks • {performer.hours}h</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{performer.score}%</p>
                      <p className="text-xs text-gray-500">Score</p>
                    </div>
                  </div>
                ))}
                {topPerformers.length === 0 && (
                  <p className="text-gray-500 text-sm">No performance data available yet</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Posted Opportunities */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Posted Opportunities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {opportunities.length === 0 ? (
              <div className="text-gray-500">No opportunities posted yet.</div>
            ) : (
              opportunities.map((opp) => (
                <div key={opp.id} className="bg-white p-4 rounded-lg shadow-md border-l-4 border-indigo-500">
                  <h3 className="font-semibold">{opp.title}</h3>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{opp.description}</p>
                  <p className="text-xs text-gray-500 mt-2">📍 {opp.location}</p>
                  <p className="text-xs text-gray-500 mt-1">📅 Starts: {new Date(opp.start_date).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500 mt-1">👥 Needed: {opp.volunteers_needed}</p>
                  <p className="mt-2 text-xs">
                    {(opp.required_skills || []).map((skill, i) => (
                      <span key={i} className="inline-block bg-gray-200 rounded-full px-2 py-1 mr-2">
                        {skill}
                      </span>
                    ))}
                  </p>
                  <a href={`/organization/opportunities/${opp.id}`} className="block mt-4 text-indigo-600 text-sm hover:underline">
                    View Details →
                  </a>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Recent Volunteers */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recently Assigned Volunteers</h2>
          <div className="space-y-4">
            {recentVolunteers.length === 0 ? (
              <div className="text-gray-500">No recent volunteers assigned.</div>
            ) : (
              recentVolunteers.slice(0, 5).map((vol, idx) => (
                <div key={vol.id || idx} className="bg-white p-4 rounded-lg shadow-md flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div>
                    <div className="font-semibold">{vol.name || vol.full_name}</div>
                    <div className="text-xs text-gray-600">{vol.email}</div>
                    <div className="text-xs text-gray-500">Assigned: {vol.assigned_at ? new Date(vol.assigned_at).toLocaleDateString() : 'N/A'}</div>
                  </div>
                  <div className="sm:ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded mt-2 sm:mt-0">{vol.opportunity_title || vol.opportunity?.title}</div>
                </div>
              ))
            )}
          </div>
        </section>
    </div>
  );
}

function SummaryCard({ color, title, count, onClick, description }) {
  const colors = {
    indigo: "bg-indigo-100 hover:bg-indigo-200 border-indigo-500",
    blue: "bg-blue-100 hover:bg-blue-200 border-blue-500",
    green: "bg-green-100 hover:bg-green-200 border-green-500",
    yellow: "bg-yellow-100 hover:bg-yellow-200 border-yellow-500",
  };
  return (
    <div
      className={`${colors[color]} p-4 rounded-lg shadow transition cursor-pointer border-l-4`}
      onClick={onClick}
    >
      <h3 className="font-bold text-lg text-black flex justify-between items-center">
        {title}
        <span className="text-2xl font-extrabold">{count}</span>
      </h3>
      <p className="text-sm text-black mt-2">{description}</p>
    </div>
  );
}

// Component for trend cards
function TrendCard({ title, value, trend, description, color }) {
  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800'
  };

  const trendIcon = trend === 'up' ? '↗️' : '↘️';

  return (
    <div className={`p-6 rounded-xl border-2 ${colorClasses[color]} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="text-lg">{trendIcon}</span>
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <p className="text-sm opacity-75">{description}</p>
    </div>
  );
}