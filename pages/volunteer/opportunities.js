import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";

import Sidebar from "../../components/Sidebar";

function OpportunityCard({ opp, matchedSkills, onViewDetails }) {
  return (
    <article
      className="bg-white p-4 rounded shadow border border-gray-200"
      aria-label={`Opportunity: ${opp.title}`}
    >
      <h2 className="text-xl font-semibold text-indigo-600">{opp.title}</h2>
      <p className="text-black mt-2">{opp.description}</p>

      <div className="mt-2 text-sm text-black space-y-1">
        <p>
          <strong>Location:</strong> {opp.location}
        </p>
        <p>
          <strong>Start Date:</strong> {opp.start_date}
        </p>
        {opp.end_date && (
          <p>
            <strong>End Date:</strong> {opp.end_date}
          </p>
        )}
        <p>
          <strong>Volunteers Needed:</strong> {opp.volunteers_needed}
        </p>
      </div>

      <div className="mt-3 text-sm text-black">
        <strong>Skills Required:</strong>
        <ul className="list-disc list-inside mt-1 flex flex-wrap gap-2" aria-label="Skills required">
          {opp.skills_required.map((skill, i) => {
            const isMatched = matchedSkills.some(
              (ms) => ms.toLowerCase() === skill.toLowerCase()
            );
            return (
              <li
                key={i}
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  isMatched ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-700"
                }`}
              >
                {skill}
              </li>
            );
          })}
        </ul>
      </div>

      <button
        onClick={() => onViewDetails(opp.id)}
        aria-label={`View details and apply for ${opp.title}`}
        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        View Details / Apply
      </button>
    </article>
  );
}

function FilterControls({ filter, setFilter, searchTerm, setSearchTerm }) {
  // Debounce search input
  const [localSearch, setLocalSearch] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => setSearchTerm(localSearch), 300);
    return () => clearTimeout(handler);
  }, [localSearch, setSearchTerm]);

  return (
    <fieldset className="mb-6">
      <legend className="sr-only">Filter opportunities</legend>
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6">
        <div className="flex space-x-6 mb-4 sm:mb-0" role="radiogroup" aria-label="Opportunity filter">
          <label className="inline-flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="filter"
              value="matched"
              checked={filter === "matched"}
              onChange={() => setFilter("matched")}
              className="form-radio text-indigo-600"
              aria-checked={filter === "matched"}
            />
            <span className="text-black font-semibold">Matched Only</span>
          </label>
          <label className="inline-flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="filter"
              value="all"
              checked={filter === "all"}
              onChange={() => setFilter("all")}
              className="form-radio text-indigo-600"
              aria-checked={filter === "all"}
            />
            <span className="text-black font-semibold">All Opportunities</span>
          </label>
        </div>

        <input
          type="search"
          placeholder="Search by title or location..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          aria-label="Search opportunities by title or location"
          className="w-full max-w-sm rounded border border-gray-300 p-2 text-black focus:border-indigo-600 focus:ring-indigo-600"
        />
      </div>
    </fieldset>
  );
}

export default function Opportunities() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [opportunities, setOpportunities] = useState([]);
  const [filter, setFilter] = useState("matched"); // "matched" or "all"
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  // Mock data for opportunities
  useEffect(() => {
    // Simulate fetch delay & error handling
    const fetchOpportunities = async () => {
      try {
        // Simulate fetch delay
        await new Promise((r) => setTimeout(r, 500));
        // Replace this with real API fetch later
        const mockData = [
          {
            id: 1,
            title: "Community Health Outreach",
            description: "Assist with a community health campaign.",
            location: "Lilongwe",
            start_date: "2025-07-01",
            end_date: "2025-07-10",
            volunteers_needed: 10,
            skills_required: ["public speaking", "health education", "first aid"],
          },
          {
            id: 2,
            title: "Tree Planting Exercise",
            description: "Reforestation around the Mzuzu hills.",
            location: "Mzuzu",
            start_date: "2025-08-15",
            end_date: null,
            volunteers_needed: 25,
            skills_required: ["planting", "teamwork", "physical stamina"],
          },
          {
            id: 3,
            title: "Teaching Assistant",
            description: "Help teach English and Math at a rural school.",
            location: "Balaka",
            start_date: "2025-09-01",
            end_date: null,
            volunteers_needed: 5,
            skills_required: ["teaching", "english", "patience"],
          },
        ];
        setOpportunities(mockData);
      } catch (e) {
        setError("Failed to load opportunities. Please try again later.");
      }
    };

    fetchOpportunities();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  // Memoize filtered opportunities for performance
  const filteredOpportunities = useMemo(() => {
    if (!user || !user.skills) {
      return opportunities
        .filter((opp) => filter === "all" || false)
        .filter(
          (opp) =>
            opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            opp.location.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    const lowerUserSkills = user.skills.map((s) => s.toLowerCase());
    const lowerSearch = searchTerm.toLowerCase();

    let filtered = filter === "all" ? opportunities : opportunities.filter((opp) =>
      opp.skills_required.some((skill) => lowerUserSkills.includes(skill.toLowerCase()))
    );

    filtered = filtered.filter(
      (opp) =>
        opp.title.toLowerCase().includes(lowerSearch) ||
        opp.location.toLowerCase().includes(lowerSearch)
    );

    return filtered;
  }, [filter, opportunities, user, searchTerm]);

  function handleViewDetails(id) {
    router.push(`/volunteer/apply/${id}`);
  }

  if (loading || !user) {
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

  if (error) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Volunteer Opportunities | YourAppName</title>
        <meta
          name="description"
          content="Browse volunteer opportunities that match your skills or explore all available opportunities."
        />
      </Head>

      <div className="flex min-h-screen bg-gray-100">
        <Sidebar active="opportunities" />

        <main className="flex-1 p-6">
          <h1 className="text-3xl font-bold text-black mb-4">Volunteer Opportunities</h1>
          <p className="text-black mb-6">
            Browse and apply for volunteering opportunities that match your skills.
          </p>

          <FilterControls
            filter={filter}
            setFilter={setFilter}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          {filteredOpportunities.length === 0 ? (
            <p className="text-red-600 font-semibold text-center mt-12">
              No opportunities found matching your criteria.
            </p>
          ) : (
            <section
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              aria-label="List of volunteer opportunities"
            >
              {filteredOpportunities.map((opp) => {
                const matchedSkills = user.skills
                  ? opp.skills_required.filter((skill) =>
                      user.skills.some(
                        (userSkill) => userSkill.toLowerCase() === skill.toLowerCase()
                      )
                    )
                  : [];

                return (
                  <OpportunityCard
                    key={opp.id}
                    opp={opp}
                    matchedSkills={matchedSkills}
                    onViewDetails={handleViewDetails}
                  />
                );
              })}
            </section>
          )}
        </main>
      </div>
    </>
  );
}
