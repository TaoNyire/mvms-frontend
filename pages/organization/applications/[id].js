// pages/organization/opportunities/applications/[id].js
import React, { useEffect, useState } from "react";
import OrgLayout from "../../../../components/OrgLayout";

export default function ViewApplication() {
  const [application, setApplication] = useState({
    id: 1,
    opportunityTitle: "Community Clean-Up Drive",
    volunteer: {
      name: "Taonga Nyirenda",
      email: "taonga@example.com",
      phone: "+265 888 000 000",
      bio: "Passionate about environmental sustainability and community development.",
      skills: ["Leadership", "Communication", "Teamwork", "Organizing"]
    },
    appliedOn: "2025-04-05T10:00:00Z",
    status: "Pending",
    opportunitySkills: ["Leadership", "Communication", "First Aid", "Project Management", "Teamwork"]
  });

  const router = useRouter();
  const { id } = router.query;

  // Simulate fetching data based on ID
  useEffect(() => {
    document.title = `Application #${id}`;
  }, [id]);

  // Calculate matched skills
  const matchedSkills = application.opportunitySkills.filter(skill =>
    application.volunteer.skills.includes(skill)
  );

  const matchPercentage = Math.round(
    (matchedSkills.length / application.opportunitySkills.length) * 100
  );

  return (
    <OrgLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold">Application Details</h1>
          <span className={`inline-block px-4 py-1 rounded-full text-xs ${
            application.status === "Pending"
              ? "bg-yellow-100 text-yellow-800"
              : application.status === "Accepted"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}>
            Status: {application.status}
          </span>
        </div>

        {/* Volunteer Info */}
        <section className="mb-6 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Volunteer Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p><strong>Name:</strong> {application.volunteer.name}</p>
              <p><strong>Email:</strong> {application.volunteer.email}</p>
              <p><strong>Phone:</strong> {application.volunteer.phone}</p>
              <p className="mt-4"><strong>Bio:</strong></p>
              <p className="text-gray-600 mt-1">{application.volunteer.bio}</p>
            </div>
            <div>
              <p><strong>Volunteer Skills</strong></p>
              <div className="mt-2 flex flex-wrap gap-2">
                {application.volunteer.skills.map((skill, index) => (
                  <span key={index} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    {skill}
                  </span>
                ))}
              </div>

              <p className="mt-4"><strong>Required Skills</strong></p>
              <div className="mt-2 flex flex-wrap gap-2">
                {application.opportunitySkills.map((skill, index) => (
                  <span
                    key={index}
                    className={`inline-block px-2 py-1 rounded-full text-xs ${
                      matchedSkills.includes(skill)
                        ? "bg-indigo-100 text-indigo-800"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${matchPercentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">{matchPercentage}% skill match</p>
              </div>
            </div>
          </div>
        </section>

        {/* Application Details */}
        <section className="mb-6 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Application Summary</h2>
          <p className="text-sm text-gray-600">
            Applied for opportunity: <strong>{application.opportunityTitle}</strong>
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Applied on: {new Date(application.appliedOn).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Location: Mzuzu City Center
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Duration: May 20 - May 25, 2025
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Required Volunteers: 10
          </p>
        </section>

        {/* Actions */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                // Handle accept logic here
                alert("Application accepted!");
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
            >
              Accept
            </button>
            <button
              onClick={() => {
                // Handle reject logic
                alert("Application rejected.");
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
            >
              Reject
            </button>
            <button
              onClick={() => router.push("/organization/messages")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
            >
              Send Message
            </button>
          </div>
        </section>
      </div>
    </OrgLayout>
  );
}