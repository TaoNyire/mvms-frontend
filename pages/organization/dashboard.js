import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

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