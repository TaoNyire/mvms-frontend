// pages/organization/opportunities/index.js
import React, { useEffect, useState } from "react";
import OrgLayout from "../../../components/OrgLayout";

export default function OpportunitiesIndex() {
  const [opportunities, setOpportunities] = useState([
    {
      id: 1,
      title: "Community Clean-Up Drive",
      description: "Help clean up local parks and public spaces in Mzuzu.",
      location: "Mzuzu",
      start_date: "2025-05-20",
      end_date: "2025-05-25",
      volunteers_needed: 10,
      required_skills: ["Leadership", "Communication"]
    },
    {
      id: 2,
      title: "Teach Kids to Code",
      description: "Support children in learning basic programming skills.",
      location: "Lilongwe",
      start_date: "2025-06-01",
      end_date: "2025-06-30",
      volunteers_needed: 5,
      required_skills: ["Teaching", "Programming"]
    }
  ]);

  return (
    <OrgLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Posted Opportunities</h1>

        {/* Add New Button */}
        <div className="flex justify-end mb-4">
          <a
            href="/organization/opportunities/create"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
          >
            + New Opportunity
          </a>
        </div>

        {/* Opportunities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opp) => (
            <div key={opp.id} className="bg-white shadow-md rounded-lg p-4 border-l-4 border-indigo-500 hover:shadow-lg transition">
              <h3 className="font-semibold text-lg">{opp.title}</h3>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{opp.description}</p>
              <p className="text-xs text-gray-500 mt-2">📍 Location: {opp.location}</p>
              <p className="text-xs text-gray-500 mt-1">📅 Starts: {new Date(opp.start_date).toLocaleDateString()}</p>
              <p className="text-xs text-gray-500 mt-1">👥 Needed: {opp.volunteers_needed} volunteers</p>
              <p className="mt-2 text-xs">
                {opp.required_skills.map((skill, i) => (
                  <span key={i} className="inline-block bg-gray-200 rounded-full px-2 py-1 mr-2">
                    {skill}
                  </span>
                ))}
              </p>
              <a href={`/organization/opportunities/${opp.id}`} className="text-indigo-600 text-sm hover:underline mt-4 inline-block">
                View Details →
              </a>
            </div>
          ))}
        </div>
      </div>
    </OrgLayout>
  );
}