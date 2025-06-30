// pages/organization/opportunities/[id].js
import React, { useEffect, useState } from "react";
import OrgLayout from "../../../components/OrgLayout";

export default function OpportunityDetails({ token }) {
  const [opportunity, setOpportunity] = useState({
    title: "Community Clean-Up Drive",
    description: "Help clean up local parks and public spaces in Mzuzu.",
    location: "Mzuzu, Malawi",
    start_date: "2025-05-20",
    end_date: "2025-05-25",
    volunteers_needed: 10,
    required_skills: ["Leadership", "Communication", "Teamwork"]
  });

  const [applications, setApplications] = useState([
    {
      id: 1,
      volunteer: "Taonga Nyirenda",
      appliedOn: "Apr 5, 2025",
      status: "Pending"
    },
    {
      id: 2,
      volunteer: "John Doe",
      appliedOn: "Mar 28, 2025",
      status: "Accepted"
    }
  ]);

  const { query } = useRouter();
  const { id } = query;

  // Simulate fetching data from API based on ID
  useEffect(() => {
    if (!token) return;
    async function fetchOpportunity() {
      try {
        const res = await fetch(`/api/organization/opportunities/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setOpportunity(data);
      } catch (err) {
        console.error("Failed to load opportunity:", err);
      }
    }

    fetchOpportunity();
  }, [id, token]);

  return (
    <OrgLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{opportunity.title}</h1>

        {/* Description */}
        <section className="mb-6 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <p className="text-gray-700">{opportunity.description}</p>
        </section>

        {/* Opportunity Details */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-gray-800 mb-4">Basic Info</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><strong>Location:</strong> {opportunity.location}</li>
              <li><strong>Start Date:</strong> {new Date(opportunity.start_date).toLocaleDateString()}</li>
              <li><strong>End Date:</strong> {opportunity.end_date ? new Date(opportunity.end_date).toLocaleDateString() : "Ongoing"}</li>
              <li><strong>Volunteers Needed:</strong> {opportunity.volunteers_needed}</li>
            </ul>
          </div>

          {/* Required Skills */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-gray-800 mb-4">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {opportunity.required_skills.map((skill, index) => (
                <span key={index} className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Applications Section */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Volunteer Applications</h3>
            <button
              onClick={() => router.push(`/organization/opportunities/${id}/applications`)}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              View All Applications →
            </button>
          </div>

          {/* Application List */}
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="border-b border-gray-200 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{app.volunteer}</h4>
                    <p className="text-xs text-gray-500">Applied on: {app.appliedOn}</p>
                  </div>
                  <span className={`inline-block px-2 py-1 rounded text-xs ${
                    app.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : app.status === "Accepted"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </OrgLayout>
  );
}