import { useRouter } from "next/router";
import { useAuth } from "../../../context/AuthContext";
import { useEffect, useState } from "react";
import { BriefcaseIcon, DocumentTextIcon, BellIcon, UserCircleIcon } from "@heroicons/react/24/outline";

export default function OpportunityView() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading } = useAuth();

  const [opportunity, setOpportunity] = useState(null);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const mockData = {
      1: {
        id: 1,
        title: "Community Health Outreach",
        description: "Assist with a community health campaign.",
        location: "Lilongwe",
        start_date: "2025-07-01",
        end_date: "2025-07-10",
        volunteers_needed: 10,
        skills_required: ["public speaking", "health education", "first aid"],
      },
      2: {
        id: 2,
        title: "Tree Planting Exercise",
        description: "Reforestation around the Mzuzu hills.",
        location: "Mzuzu",
        start_date: "2025-08-15",
        end_date: null,
        volunteers_needed: 25,
        skills_required: ["planting", "teamwork", "physical stamina"],
      },
      3: {
        id: 3,
        title: "Teaching Assistant",
        description: "Help teach English and Math at a rural school.",
        location: "Balaka",
        start_date: "2025-09-01",
        end_date: null,
        volunteers_needed: 5,
        skills_required: ["teaching", "english", "patience"],
      },
    };

    setOpportunity(mockData[id]);
  }, [id]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="text-center mt-10">Loading...</div>;

  if (!opportunity) return <div className="text-center mt-10">Loading opportunity...</div>;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Simulate API call
      await new Promise((r) => setTimeout(r, 1500));

      alert(`Application sent successfully for "${opportunity.title}"!`);
      router.push("/volunteer/applications");
    } catch (error) {
      alert("Failed to submit application: " + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6 hidden md:block">
        <h2 className="text-xl font-bold mb-8 text-indigo-600 flex items-center gap-2">
          <BriefcaseIcon className="w-6 h-6" />
          Volunteer Panel
        </h2>
        <NavItem label="Opportunities" link="/volunteer/opportunities" />
        <NavItem label="Applications" link="/volunteer/applications" />
        <NavItem label="Notifications" link="/volunteer/notifications" />
        <NavItem label="Profile" link="/volunteer/profile" />
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 max-w-3xl mx-auto w-full">
        <h2 className="text-2xl font-bold mb-4 text-black">Opportunity Details</h2>

        <h3 className="text-xl font-semibold text-indigo-600">{opportunity.title}</h3>
        <p className="text-black mt-2">{opportunity.description}</p>
        <p className="text-black mt-1">
          <strong>Location:</strong> {opportunity.location}
        </p>
        <p className="text-black mt-1">
          <strong>Start Date:</strong> {opportunity.start_date}
        </p>
        {opportunity.end_date && (
          <p className="text-black mt-1">
            <strong>End Date:</strong> {opportunity.end_date}
          </p>
        )}
        <p className="text-black mt-1">
          <strong>Volunteers Needed:</strong> {opportunity.volunteers_needed}
        </p>
        <p className="text-black mt-1">
          <strong>Skills Required:</strong> {opportunity.skills_required.join(", ")}
        </p>

        {!showApplyForm ? (
          <button
            onClick={() => setShowApplyForm(true)}
            className="mt-6 w-full py-2 px-4 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 focus:outline-none"
          >
            Apply Now
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6">
            <label className="block mb-4">
              <span className="text-black font-semibold">Your Message / Cover Letter</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="mt-1 block w-full rounded-md border border-indigo-300 p-2 focus:border-indigo-500 focus:ring-indigo-500 text-black"
                placeholder="Tell us why you're a good fit..."
                required
              />
            </label>

            <div className="flex justify-between items-center">
              <button
                type="submit"
                disabled={submitting}
                className={`py-2 px-4 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 focus:outline-none ${
                  submitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>

              <button
                type="button"
                onClick={() => setShowApplyForm(false)}
                className="ml-4 py-2 px-4 rounded bg-gray-300 text-gray-700 hover:bg-gray-400 focus:outline-none"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

function NavItem({ label, link }) {
  return (
    <a
      href={link}
      className="flex items-center gap-3 mb-4 cursor-pointer px-3 py-2 rounded text-gray-700 hover:text-indigo-600"
    >
      {label}
    </a>
  );
}
