// pages/organization/applications/index.js
import React, { useEffect, useState } from "react";
import OrgLayout from "../../../components/OrgLayout";

export default function ApplicationsIndex() {
  const [applications, setApplications] = useState([
    {
      id: 1,
      volunteer: "Taonga Nyirenda",
      opportunity: "Community Clean-Up",
      appliedOn: "Apr 5, 2025",
      matchedSkills: "4/5",
      status: "Pending"
    },
    {
      id: 2,
      volunteer: "John Doe",
      opportunity: "Teach Kids to Code",
      appliedOn: "Mar 28, 2025",
      matchedSkills: "5/5",
      status: "Accepted"
    }
  ]);

  return (
    <OrgLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Volunteer Applications</h1>

        {/* Application List */}
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition border-l-4 border-blue-500">
              <h3 className="font-semibold">{app.volunteer}</h3>
              <p className="text-sm text-gray-600 mt-1">Applied to: {app.opportunity}</p>
              <p className="text-xs text-gray-500 mt-1">Skill match: {app.matchedSkills}</p>
              <p className="text-xs text-gray-500 mt-1">Applied on: {app.appliedOn}</p>
              <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
                app.status === "Pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : app.status === "Accepted"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}>
                Status: {app.status}
              </span>
              <a
                href={`/organization/opportunities/${app.id}/applications`}
                className="text-indigo-600 text-sm hover:underline ml-4"
              >
                View Details →
              </a>
            </div>
          ))}
        </div>
      </div>
    </OrgLayout>
  );
}