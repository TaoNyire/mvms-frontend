import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";
import Head from "next/head";
import FeedbackDashboard from "../../components/feedback/FeedbackDashboard";
import axios from "axios";


const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function VolunteerDashboard() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  // State for all dashboard data
  const [profile, setProfile] = useState(null);
  const [matchedOpportunities, setMatchedOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [myFeedback, setMyFeedback] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [assigningRole, setAssigningRole] = useState(false);
  const [stats, setStats] = useState({
    totalApplications: 0,
    acceptedApplications: 0,
    pendingApplications: 0,
    matchedOpportunities: 0,
    totalFeedback: 0,
    unreadMessages: 0
  });


  // Fetch all dashboard data from backend
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!token) return;
    setApiLoading(true);
    setApiError("");

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    // Fetch dashboard data individually to identify which endpoint fails
    const fetchDashboardData = async () => {
      try {
        // Test each endpoint individually
        console.log("Fetching dashboard data...");
        console.log("User:", user);
        console.log("Token:", token ? "Present" : "Missing");

        // Test authentication and role
        try {
          const authRes = await axios.get(`${API_BASE}/test-auth`, authHeaders);
          console.log("✅ Auth test success:", authRes.data);
          setUserInfo(authRes.data);

          // If user doesn't have volunteer role, show role assignment option
          if (!authRes.data.has_volunteer_role) {
            setApiError("You need the volunteer role to access this dashboard.");
            setApiLoading(false);
            return;
          }
        } catch (error) {
          console.error("❌ Auth test failed:", error.response?.status, error.response?.data);
          // Don't show authentication error - user is already logged in
          // Just continue with the API calls
        }

        // Test volunteer endpoints without role middleware
        try {
          const testDashRes = await axios.get(`${API_BASE}/test-volunteer-dashboard`, authHeaders);
          console.log("✅ Test dashboard (no role) success:", testDashRes.data);
        } catch (error) {
          console.error("❌ Test dashboard (no role) failed:", error.response?.status, error.response?.data);
        }

        try {
          const testProfileRes = await axios.get(`${API_BASE}/test-volunteer-profile`, authHeaders);
          console.log("✅ Test profile (no role) success:", testProfileRes.data);
        } catch (error) {
          console.error("❌ Test profile (no role) failed:", error.response?.status, error.response?.data);
        }

        // 1. Dashboard stats
        let dashboardData = {};
        try {
          const dashRes = await axios.get(`${API_BASE}/volunteer/dashboard`, authHeaders);
          dashboardData = dashRes.data;
          console.log("✅ Dashboard endpoint success:", dashboardData);
        } catch (error) {
          console.error("❌ Dashboard endpoint failed:", error.response?.status, error.response?.data);
        }

        // 2. Profile data
        let profileData = null;
        try {
          const profileRes = await axios.get(`${API_BASE}/volunteer/profile`, authHeaders);
          profileData = profileRes.data;
          console.log("✅ Profile endpoint success:", profileData);
        } catch (error) {
          console.error("❌ Profile endpoint failed:", error.response?.status, error.response?.data);
        }

        // 3. Opportunities (try recommended first, fallback to public)
        let matchedData = [];
        try {
          // Try recommended opportunities first
          const matchedRes = await axios.get(`${API_BASE}/volunteer/recommended`, authHeaders);
          const rawData = matchedRes.data?.data || matchedRes.data || [];
          matchedData = Array.isArray(rawData) ? rawData : [];
          console.log("✅ Recommended endpoint success:", matchedData);
        } catch (error) {
          console.error("❌ Recommended endpoint failed:", error.response?.status, error.response?.data);

          // Fallback to public opportunities
          try {
            const publicRes = await axios.get(`${API_BASE}/opportunities/public`);
            const publicData = publicRes.data?.data || publicRes.data || [];
            matchedData = Array.isArray(publicData) ? publicData.slice(0, 5) : []; // Take first 5
            console.log("✅ Public opportunities fallback success:", matchedData);
          } catch (publicError) {
            console.error("❌ Public opportunities also failed:", publicError.response?.status, publicError.response?.data);

            // Set empty array - no sample data
            matchedData = [];
            console.log("❌ All opportunities endpoints failed");
          }
        }

        console.log("Final matchedData for dashboard:", matchedData);

        // 4. Applications
        let applicationsData = [];
        try {
          const appsRes = await axios.get(`${API_BASE}/my-applications`, authHeaders);
          const rawData = appsRes.data?.data || appsRes.data || [];
          applicationsData = Array.isArray(rawData) ? rawData : [];
          console.log("✅ Applications endpoint success:", applicationsData);
        } catch (error) {
          console.error("❌ Applications endpoint failed:", error.response?.status, error.response?.data);
          // Set empty array - no sample data
          applicationsData = [];
          console.log("❌ Applications endpoint failed");
        }

        // 5. Skills
        let skillsData = [];
        try {
          const skillsRes = await axios.get(`${API_BASE}/my-skills`, authHeaders);
          const rawSkillsData = skillsRes.data?.skills || skillsRes.data || [];
          skillsData = Array.isArray(rawSkillsData) ? rawSkillsData.map(skill => ({
            id: skill.id,
            name: skill.name,
            level: skill.pivot?.proficiency_level || 'beginner',
            years_experience: skill.pivot?.years_experience || 0,
            notes: skill.pivot?.notes || '',
            category: skill.category || 'other'
          })) : [];
          console.log("✅ Skills endpoint success:", skillsData);
        } catch (error) {
          console.error("❌ Skills endpoint failed:", error.response?.status, error.response?.data);
          // Set empty array - no sample data
          skillsData = [];
          console.log("❌ Skills endpoint failed");
        }

        // 6. Feedback
        let feedbackData = [];
        try {
          const feedbackRes = await axios.get(`${API_BASE}/my-feedback`, authHeaders);
          const rawData = feedbackRes.data?.data || feedbackRes.data || [];
          feedbackData = Array.isArray(rawData) ? rawData : [];
          console.log("✅ Feedback endpoint success:", feedbackData);
        } catch (error) {
          console.error("❌ Feedback endpoint failed:", error.response?.status, error.response?.data);
          feedbackData = [];
        }

        // 6. Unread messages
        let unreadCount = 0;
        try {
          const unreadRes = await axios.get(`${API_BASE}/messages/unread-count`, authHeaders);
          unreadCount = unreadRes.data?.unread_count || unreadRes.data?.count || 0;
          console.log("✅ Unread count endpoint success:", unreadCount);
        } catch (error) {
          console.error("❌ Unread count endpoint failed:", error.response?.status, error.response?.data);
        }

        // Calculate stats from the data
        const calculatedStats = {
          totalApplications: applicationsData.length,
          acceptedApplications: applicationsData.filter(app => app.status === 'accepted').length,
          pendingApplications: applicationsData.filter(app => app.status === 'pending').length,
          matchedOpportunities: matchedData.length,
          totalFeedback: feedbackData.length,
          totalSkills: skillsData.length,
          unreadMessages: unreadCount
        };

        // Set the data
        setProfile(profileData);
        setMatchedOpportunities(matchedData);
        setApplications(applicationsData);
        setMyFeedback(feedbackData);
        setNotifications([{ unread_count: unreadCount }]);
        setStats(calculatedStats);

      } catch (error) {
        console.error("General dashboard error:", error);
        setApiError("Failed to load your dashboard data.");
      } finally {
        setApiLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  // Function to assign volunteer role
  const assignVolunteerRole = async () => {
    setAssigningRole(true);
    try {
      const response = await axios.post(`${API_BASE}/assign-volunteer-role`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Role assignment response:", response.data);

      // Refresh the page to reload with new role
      window.location.reload();
    } catch (error) {
      console.error("Failed to assign volunteer role:", error);
      alert("Failed to assign volunteer role. Please try again.");
    } finally {
      setAssigningRole(false);
    }
  };

  // Use stats from state with fallback calculations for safety
  const safeMatchedOpportunities = Array.isArray(matchedOpportunities) ? matchedOpportunities : [];
  const safeApplications = Array.isArray(applications) ? applications : [];
  const safeFeedback = Array.isArray(myFeedback) ? myFeedback : [];

  const totalMatched = stats.matchedOpportunities || safeMatchedOpportunities.length;
  const totalApplications = stats.totalApplications || safeApplications.length;
  const totalFeedback = stats.totalFeedback || safeFeedback.length;
  const unreadMessages = stats.unreadMessages || notifications[0]?.unread_count || 0;
  const pendingApplications = stats.pendingApplications || safeApplications.filter(app => app.status === 'pending').length;
  const acceptedApplications = stats.acceptedApplications || safeApplications.filter(app => app.status === 'accepted').length;

  if (loading || !user) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <div className="text-indigo-600 text-xl font-semibold">Loading your dashboard...</div>
      </div>
    );
  }

  if (apiLoading) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <div className="text-indigo-600 text-xl font-semibold">Loading your dashboard...</div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="flex min-h-screen justify-center items-center bg-gray-50 px-4">
        <div className="text-center bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
          <div className="text-yellow-600 font-semibold text-lg sm:text-xl mb-4">🔐 Role Required</div>
          <div className="text-gray-700 mb-6 text-sm sm:text-base">{apiError}</div>
          {userInfo && !userInfo.has_volunteer_role && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg text-left">
                <p className="text-xs sm:text-sm text-gray-600 mb-1 break-words">
                  <strong>Current user:</strong> {userInfo.user_name}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mb-1 break-words">
                  <strong>Email:</strong> {userInfo.user_email}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  <strong>Current roles:</strong> {userInfo.roles?.join(', ') || 'None'}
                </p>
              </div>
              <button
                onClick={assignVolunteerRole}
                disabled={assigningRole}
                className="w-full bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
              >
                {assigningRole ? 'Assigning Volunteer Role...' : '✅ Assign Volunteer Role'}
              </button>
              <p className="text-xs text-gray-500 px-2">
                This will add the volunteer role to your account so you can access the volunteer dashboard.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Volunteer Dashboard | YourAppName</title>
      </Head>
      <div className="space-y-6 sm:space-y-8">
        {/* API Status Indicator */}
        {(matchedOpportunities.length === 0 && applications.length === 0) && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Some API endpoints may be unavailable - showing sample data for demonstration</span>
          </div>
        )}

          {/* Dashboard Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
            <CounterCard
              label="Matched Opportunities"
              value={totalMatched}
              color="bg-blue-600"
              icon="🎯"
            />
            <CounterCard
              label="My Applications"
              value={totalApplications}
              color="bg-green-600"
              icon="📝"
            />
            <CounterCard
              label="My Skills"
              value={stats.totalSkills || 0}
              color="bg-indigo-600"
              icon="🎓"
            />
            <CounterCard
              label="Pending Applications"
              value={pendingApplications}
              color="bg-yellow-500"
              icon="⏳"
            />
            <CounterCard
              label="Unread Messages"
              value={unreadMessages}
              color="bg-purple-600"
              icon="💬"
            />
          </div>

          {/* Matched Opportunities */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-blue-700">Matched Opportunities</h3>
              <button
                className="text-blue-600 hover:text-blue-700 hover:underline text-left text-sm sm:text-base transition-colors"
                onClick={() => router.push("/volunteer/opportunities")}
              >
                See all opportunities &rarr;
              </button>
            </div>
            {safeMatchedOpportunities.length === 0 ? (
              <div className="text-gray-500 bg-white p-4 sm:p-6 rounded-xl shadow-sm text-center">
                <div className="text-3xl sm:text-4xl mb-2">🎯</div>
                <p className="text-sm sm:text-base">No recommended opportunities yet.</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">Complete your profile to get personalized matches!</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                {safeMatchedOpportunities.slice(0, 3).map((opp) => (
                  <div key={opp.id} className="p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-blue-700 text-sm sm:text-base mb-1 truncate">{opp.title}</div>
                      <div className="text-gray-600 text-xs sm:text-sm mb-2">{opp.organization?.name}</div>
                      <div className="text-gray-500 text-xs sm:text-sm line-clamp-2">{opp.description?.slice(0, 120)}...</div>
                    </div>
                    <button
                      className="w-full lg:w-auto px-4 sm:px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm sm:text-base transition-colors"
                      onClick={() => router.push(`/volunteer/opportunities`)}
                    >
                      View / Apply
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Your Applications */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-blue-700">My Applications</h3>
              <button
                className="text-blue-600 hover:text-blue-700 hover:underline text-left text-sm sm:text-base transition-colors"
                onClick={() => router.push("/volunteer/applications")}
              >
                See all applications &rarr;
              </button>
            </div>
            {safeApplications.length === 0 ? (
              <div className="text-gray-500 bg-white p-4 sm:p-6 rounded-xl shadow-sm text-center">
                <div className="text-3xl sm:text-4xl mb-2">📝</div>
                <p className="text-sm sm:text-base">You have not applied for any opportunities yet.</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">Browse opportunities to get started!</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                {safeApplications.slice(0, 3).map((app) => (
                  <div key={app.id} className="p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-blue-700 text-sm sm:text-base mb-1 truncate">{app.opportunity?.title}</div>
                      <div className="text-gray-600 text-xs sm:text-sm mb-2">{app.opportunity?.organization?.name}</div>
                      <div className="text-gray-500 text-xs sm:text-sm">
                        Status: <span className={`font-medium ${
                          app.status === 'accepted' ? 'text-green-600' :
                          app.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                        }`}>{app.status}</span>
                      </div>
                    </div>
                    <button
                      className="w-full lg:w-auto px-4 sm:px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium text-sm sm:text-base transition-colors"
                      onClick={() => router.push(`/volunteer/applications/${app.id}`)}
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Enhanced Feedback Section */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-green-700">My Feedback</h3>
              <button
                className="text-green-600 hover:text-green-700 hover:underline text-left text-sm sm:text-base transition-colors"
                onClick={() => router.push("/volunteer/feedback")}
              >
                See all feedback &rarr;
              </button>
            </div>
            <FeedbackDashboard userType="volunteer" />
          </section>
      </div>
    </>
  );
}

// CounterCard component for summary counters
function CounterCard({ label, value, color, icon }) {
  return (
    <div className={`rounded-xl shadow-sm bg-white flex flex-col items-center justify-center py-4 sm:py-6 lg:py-8 border-t-4 ${color} hover:shadow-md transition-all duration-200`}>
      {icon && <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{icon}</div>}
      <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-1 sm:mb-2 text-gray-800">{value}</div>
      <div className="text-xs sm:text-sm font-semibold text-gray-600 text-center px-2 leading-tight">{label}</div>
    </div>
  );
}