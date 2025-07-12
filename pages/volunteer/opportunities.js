import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";
import Head from "next/head";
import axios from "axios";
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  StarIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function OpportunityCard({ opp, userSkills = [], onApply, isApplying, hasApplied }) {
  // Calculate skill match - handle both string and object skills
  const userSkillNames = userSkills.map(skill => {
    if (typeof skill === 'string') return skill.toLowerCase();
    if (skill && skill.name) return skill.name.toLowerCase();
    return '';
  }).filter(name => name); // Remove empty strings

  const skillsRequired = Array.isArray(opp.skills) ? opp.skills : (Array.isArray(opp.skills_required) ? opp.skills_required : []);

  const matchedSkills = skillsRequired.filter(skill => {
    const skillName = typeof skill === 'string' ? skill : (skill?.name || '');
    return skillName && userSkillNames.includes(skillName.toLowerCase());
  });

  const matchPercentage = skillsRequired.length > 0 ? Math.round((matchedSkills.length / skillsRequired.length) * 100) : 0;

  return (
    <article className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 h-full flex flex-col" aria-label={`Opportunity: ${opp.title}`}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-blue-700 mb-2 line-clamp-2">{opp.title}</h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-2 truncate">
            {opp.organization?.name || "Organization"}
          </p>
        </div>
        {matchPercentage > 0 && (
          <div className="flex items-center space-x-1 bg-blue-100 px-2 py-1 rounded-full self-start shrink-0">
            <StarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">{matchPercentage}% match</span>
          </div>
        )}
      </div>

      <p className="text-gray-700 mb-4 text-xs sm:text-sm line-clamp-3 flex-grow">{opp.description}</p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-xs sm:text-sm text-gray-600">
          <MapPinIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2 shrink-0" />
          <span className="truncate">{opp.location}</span>
        </div>
        <div className="flex items-center text-xs sm:text-sm text-gray-600">
          <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2 shrink-0" />
          <span className="truncate">{opp.start_date} {opp.end_date && `- ${opp.end_date}`}</span>
        </div>
        <div className="flex items-center text-xs sm:text-sm text-gray-600">
          <UserGroupIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2 shrink-0" />
          <span>{opp.volunteers_needed} volunteers needed</span>
        </div>
      </div>

      {skillsRequired.length > 0 && (
        <div className="mb-4">
          <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Skills Required:</p>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {skillsRequired.map((skill, i) => {
              const skillName = typeof skill === 'string' ? skill : (skill?.name || '');
              const isMatched = matchedSkills.some((ms) => {
                const msName = typeof ms === 'string' ? ms : (ms?.name || '');
                return msName.toLowerCase() === skillName.toLowerCase();
              });

              return (
                <span
                  key={i}
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                    isMatched ? "bg-blue-100 text-blue-800 border border-blue-200" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {isMatched && <CheckCircleIcon className="w-3 h-3 inline mr-1" />}
                  <span className="truncate">{skillName}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={() => onApply(opp.id)}
        disabled={hasApplied || isApplying}
        aria-label={`Apply for ${opp.title}`}
        className={`w-full px-4 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-auto
          ${hasApplied
            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
            : isApplying
            ? "bg-blue-400 text-white cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"}
        `}
      >
        {hasApplied ? "✓ Applied" : (isApplying ? "Applying..." : "Apply Now")}
      </button>
    </article>
  );
}

function FilterControls({ filter, setFilter, searchTerm, setSearchTerm }) {
  const [localSearch, setLocalSearch] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => setSearchTerm(localSearch), 300);
    return () => clearTimeout(handler);
  }, [localSearch, setSearchTerm]);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6">
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-4">
        {/* Search */}
        <div className="relative flex-1 max-w-full lg:max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search opportunities..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All Opportunities
          </button>
          <button
            onClick={() => setFilter("matched")}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              filter === "matched"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            ⭐ Skill Matches Only
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Opportunities() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [allOpportunities, setAllOpportunities] = useState([]);
  const [matchedOpportunities, setMatchedOpportunities] = useState([]);
  const [appliedOpportunityIds, setAppliedOpportunityIds] = useState([]);
  const [currentApplications, setCurrentApplications] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [applyingId, setApplyingId] = useState(null); // Opportunity ID currently being applied for
  const [filter, setFilter] = useState("matched");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [apiLoading, setApiLoading] = useState(true);

  // Fetch opportunities and applications from backend
  useEffect(() => {
    if (!token) return;
    setError(null);
    setApiLoading(true);

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    console.log('🔄 Fetching opportunities from backend...');
    console.log('API Base URL:', API_BASE);
    console.log('Auth token present:', !!token);
    console.log('Full token:', token?.substring(0, 20) + '...');

    // Try multiple public endpoints
    const fetchAll = axios.get(`${API_BASE}/opportunities/public`).catch(async (error) => {
      console.log('Primary public endpoint failed, trying alternatives...');
      if (error.response?.status === 401) {
        console.log('Trying alternative public endpoint...');
        return axios.get(`${API_BASE}/public/opportunities`).catch(async (altError) => {
          console.log('Alternative endpoint also failed, trying with auth...');
          return axios.get(`${API_BASE}/opportunities/public`, authHeaders);
        });
      }
      throw error;
    });

    const fetchMatched = axios.get(`${API_BASE}/volunteer/recommended`, authHeaders);
    const fetchMyApplications = axios.get(`${API_BASE}/my-applications`, authHeaders);

    // Try skills endpoint with fallback
    const fetchUserSkills = axios.get(`${API_BASE}/my-skills`, authHeaders).catch(async (error) => {
      console.log('Primary skills endpoint failed, trying test endpoint...');
      return axios.get(`${API_BASE}/test-my-skills`, authHeaders).catch((testError) => {
        console.log('Test skills endpoint also failed, returning empty skills');
        return { data: { skills: [], total_skills: 0, categories: [] } };
      });
    });

    Promise.allSettled([fetchAll, fetchMatched, fetchMyApplications, fetchUserSkills])
      .then((results) => {
        console.log("📊 API Results:", results);

        // Process all opportunities
        const allResult = results[0];
        if (allResult.status === 'fulfilled') {
          const allOppsData = allResult.value.data?.data || allResult.value.data || [];
          console.log("✅ All opportunities loaded:", allOppsData.length);
          setAllOpportunities(allOppsData);
        } else {
          console.error("❌ Failed to load all opportunities:", allResult.reason);
          setAllOpportunities([]);
        }

        // Process matched opportunities
        const matchedResult = results[1];
        if (matchedResult.status === 'fulfilled') {
          const matchedOppsData = matchedResult.value.data?.data || matchedResult.value.data || [];
          console.log("✅ Matched opportunities loaded:", matchedOppsData.length);
          setMatchedOpportunities(matchedOppsData);
        } else {
          console.error("❌ Failed to load matched opportunities:", matchedResult.reason);
          setMatchedOpportunities([]);
        }

        // Process applications
        const appsResult = results[2];
        if (appsResult.status === 'fulfilled') {
          const applicationsData = appsResult.value.data?.data || appsResult.value.data || [];
          console.log("✅ Applications loaded:", applicationsData.length);

          // Track all applications
          setCurrentApplications(Array.isArray(applicationsData) ? applicationsData : []);

          // Track applied opportunity IDs
          setAppliedOpportunityIds(
            Array.isArray(applicationsData)
              ? applicationsData.map((app) => app.opportunity?.id || app.opportunity_id)
              : []
          );
        } else {
          console.error("❌ Failed to load applications:", appsResult.reason);
          setAppliedOpportunityIds([]);
          setCurrentApplications([]);
        }

        // Process user skills
        const skillsResult = results[3];
        if (skillsResult.status === 'fulfilled') {
          const userSkillsData = skillsResult.value.data?.skills || skillsResult.value.data || [];
          console.log("✅ User skills loaded:", userSkillsData.length);
          setUserSkills(userSkillsData);
        } else {
          console.error("❌ Failed to load user skills:", skillsResult.reason);
          setUserSkills([]);
        }

        // Check if any critical endpoints failed
        const criticalFailures = results.slice(0, 2).filter(r => r.status === 'rejected');
        if (criticalFailures.length > 0) {
          const failedEndpoints = [];
          if (results[0].status === 'rejected') failedEndpoints.push('All Opportunities');
          if (results[1].status === 'rejected') failedEndpoints.push('Matched Opportunities');

          setError(`Failed to load: ${failedEndpoints.join(', ')}. Please refresh the page.`);
        }
      })
      .catch((error) => {
        console.error("❌ Critical error in Promise.allSettled:", error);

        // Set empty arrays
        setAllOpportunities([]);
        setMatchedOpportunities([]);
        setUserSkills([]);
        setAppliedOpportunityIds([]);

        // Show generic error for unexpected failures
        setError("Unexpected error occurred. Please refresh the page or contact support.");
      })
      .finally(() => setApiLoading(false));
  }, [token]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const displayedOpportunities = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    let opps;

    if (filter === "matched") {
      // Show only matched opportunities
      opps = matchedOpportunities;
      console.log(`🎯 Showing matched opportunities only: ${opps?.length || 0} opportunities`);
    } else {
      // Show all opportunities (including matched ones)
      // Combine all opportunities with matched opportunities, removing duplicates
      const allOppsArray = Array.isArray(allOpportunities) ? allOpportunities : [];
      const matchedOppsArray = Array.isArray(matchedOpportunities) ? matchedOpportunities : [];

      // Create a Set of IDs from allOpportunities to avoid duplicates
      const allOppsIds = new Set(allOppsArray.map(opp => opp.id));

      // Add matched opportunities that aren't already in allOpportunities
      const additionalMatched = matchedOppsArray.filter(opp => !allOppsIds.has(opp.id));

      opps = [...allOppsArray, ...additionalMatched];

      console.log(`📋 Showing all opportunities: ${allOppsArray.length} all + ${additionalMatched.length} additional matched = ${opps.length} total`);
    }

    if (!Array.isArray(opps)) return [];

    const filtered = opps.filter(
      (opp) =>
        opp.title?.toLowerCase().includes(lowerSearch) ||
        opp.location?.toLowerCase().includes(lowerSearch)
    );

    console.log(`🔍 After search filter "${searchTerm}": ${filtered.length} opportunities`);

    return filtered;
  }, [filter, allOpportunities, matchedOpportunities, searchTerm]);

  function getUserSkills() {
    if (!Array.isArray(user?.skills)) return [];

    return user.skills.map((s) => {
      if (typeof s === 'string') return s.toLowerCase();
      if (s && s.name) return s.name.toLowerCase();
      return '';
    }).filter(name => name); // Remove empty strings
  }

  // Handles application to an opportunity
  async function handleApply(opportunityId) {
    if (!token) return;

    // Check if CV is uploaded before allowing application
    try {
      const profileResponse = await axios.get(`${API_BASE}/volunteer/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!profileResponse.data.cv_url) {
        if (confirm("You must upload your CV before applying for opportunities. Would you like to go to your profile page to upload it now?")) {
          router.push('/volunteer/profile');
        }
        return;
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      alert("Unable to verify your profile. Please try again.");
      return;
    }

    // Check application limit before applying
    const activeApplications = currentApplications.filter(app =>
      app.status === 'pending' || app.status === 'accepted'
    );

    if (activeApplications.length >= 2) {
      alert("You can only apply to a maximum of 2 opportunities at a time. Please withdraw from an existing application or wait for a response before applying to new opportunities.");
      return;
    }

    setApplyingId(opportunityId);
    try {
      const response = await axios.post(
        `${API_BASE}/opportunities/${opportunityId}/apply`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update both applied IDs and current applications
      setAppliedOpportunityIds((prev) => [...prev, opportunityId]);
      setCurrentApplications((prev) => [...prev, response.data]);

      alert("Application submitted successfully!");
    } catch (e) {
      const errorMessage = e?.response?.data?.message;
      if (e?.response?.data?.error_code === 'APPLICATION_LIMIT_REACHED') {
        alert(errorMessage || "You have reached the maximum number of applications (2). Please withdraw from an existing application first.");
      } else {
        alert(errorMessage || "Failed to submit application. Please try again.");
      }
    } finally {
      setApplyingId(null);
    }
  }

  if (loading || !user || apiLoading) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <div
          role="status"
          aria-live="polite"
          className="text-indigo-600 text-xl font-semibold"
        >
          Loading opportunities...
        </div>
      </div>
    );
  }

  // Don't show error page if we have sample data, show warning in main content instead

  return (
    <>
      <Head>
        <title>Volunteer Opportunities - Volunteer Panel</title>
        <meta
          name="description"
          content="Browse volunteer opportunities that match your skills or explore all available opportunities."
        />
      </Head>

      <div className="space-y-4 sm:space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-blue-700">Volunteer Opportunities</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Discover opportunities that match your skills and interests
            </p>
          </div>
          <div className="text-xs sm:text-sm text-gray-500 self-end">
            {displayedOpportunities.length} opportunities found
          </div>
        </div>

        {/* Application Limit Indicator */}
        {(() => {
          const activeApplications = currentApplications.filter(app =>
            app.status === 'pending' || app.status === 'accepted'
          );
          const applicationCount = activeApplications.length;

          return (
            <div className={`p-4 rounded-lg border ${
              applicationCount >= 2
                ? 'bg-red-50 border-red-200 text-red-800'
                : applicationCount >= 1
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    applicationCount >= 2 ? 'bg-red-500' : applicationCount >= 1 ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <span className="font-medium">
                    Applications: {applicationCount}/2
                  </span>
                </div>
                {applicationCount >= 2 && (
                  <span className="text-sm">
                    Application limit reached. Withdraw from an existing application to apply for new opportunities.
                  </span>
                )}
                {applicationCount === 1 && (
                  <span className="text-sm">
                    You can apply to 1 more opportunity.
                  </span>
                )}
                {applicationCount === 0 && (
                  <span className="text-sm">
                    You can apply to up to 2 opportunities.
                  </span>
                )}
              </div>
            </div>
          );
        })()}

        <FilterControls
          filter={filter}
          setFilter={setFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {displayedOpportunities.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-base sm:text-lg px-4">
              No opportunities found matching your criteria.
            </p>
            {filter === "matched" && (
              <p className="text-gray-400 text-xs sm:text-sm mt-2 px-4">
                No opportunities match your current skills. Try viewing all opportunities or update your skills in your profile.
              </p>
            )}
            {filter === "all" && (
              <p className="text-gray-400 text-xs sm:text-sm mt-2 px-4">
                No opportunities available at the moment. Please check back later.
              </p>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {displayedOpportunities.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opp={opp}
                userSkills={userSkills}
                onApply={handleApply}
                isApplying={applyingId === opp.id}
                hasApplied={appliedOpportunityIds.includes(opp.id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}