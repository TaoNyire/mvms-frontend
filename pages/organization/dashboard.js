// pages/organization/dashboard.js
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import OrgSidebar from "../../components/OrgSidebar";

export default function OrgDashboard() {
  const router = useRouter();
  const [user, setUser] = useState({
    role: "organization",
    name: "Green Earth Initiative",
    email: "greenearth@example.com"
  });

  const [opportunities, setOpportunities] = useState([
    {
      id: 1,
      title: "Community Clean-Up Drive",
      description: "Help clean up local parks and public spaces in Mzuzu.",
      location: "Mzuzu",
      start_date: "2025-05-20",
      volunteers_needed: 10,
      required_skills: ["Leadership", "Communication"]
    },
    {
      id: 2,
      title: "Teach Kids to Code",
      description: "Support children in learning basic programming skills.",
      location: "Lilongwe",
      start_date: "2025-06-01",
      volunteers_needed: 5,
      required_skills: ["Teaching", "Programming"]
    }
  ]);

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

  // Simulate auth check
  useEffect(() => {
    // Replace this with real useAuth() hook later
    const fakeUser = {
      role: "organization",
      name: "Green Earth Initiative",
      email: "greenearth@example.com"
    };
    setUser(fakeUser);
  }, []);

  if (!user || user.role !== "organization") {
    return <div className="text-center mt-10">Redirecting...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <OrgSidebar />

      {/* Main Content */}
      <main className="flex-1 p-6">
        <header className="bg-white shadow-md p-4 rounded-lg flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-indigo-700">Organization Dashboard</h1>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
          >
            Logout
          </button>
        </header>

        {/* Summary Cards */}
        <section className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-indigo-100 hover:bg-indigo-200 p-4 rounded-lg shadow transition cursor-pointer"
              onClick={() => router.push("/organization/opportunities/create")}>
            <h3 className="font-bold text-lg text-black">Post New Opportunity</h3>
            <p className="text-sm text-black mt-2">Create and publish new volunteering roles.</p>
          </div>

          <div className="bg-blue-100 hover:bg-blue-200 p-4 rounded-lg shadow transition cursor-pointer"
              onClick={() => router.push("/organization/applications")}>
            <h3 className="font-bold text-lg text-black">Applications Received</h3>
            <p className="text-sm text-black mt-2">Review and manage volunteer applications.</p>
          </div>

          <div className="bg-green-100 hover:bg-green-200 p-4 rounded-lg shadow transition cursor-pointer"
              onClick={() => router.push("/organization/profile")}>
            <h3 className="font-bold text-lg text-black">Update Profile</h3>
            <p className="text-sm text-black mt-2">Edit your organization details and visibility.</p>
          </div>

          <div className="bg-yellow-100 hover:bg-yellow-200 p-4 rounded-lg shadow transition cursor-pointer"
              onClick={() => router.push("/organization/messages")}>
            <h3 className="font-bold text-lg text-black">Send Message</h3>
            <p className="text-sm text-black mt-2">Contact selected volunteers or send updates.</p>
          </div>
        </section>

        {/* Posted Opportunities */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Posted Opportunities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {opportunities.map((opp) => (
              <div key={opp.id} className="bg-white p-4 rounded-lg shadow-md border-l-4 border-indigo-500">
                <h3 className="font-semibold">{opp.title}</h3>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{opp.description}</p>
                <p className="text-xs text-gray-500 mt-2">📍 {opp.location}</p>
                <p className="text-xs text-gray-500 mt-1">📅 Starts: {new Date(opp.start_date).toLocaleDateString()}</p>
                <p className="text-xs text-gray-500 mt-1">👥 Needed: {opp.volunteers_needed}</p>
                <p className="mt-2 text-xs">
                  {opp.required_skills.map((skill, i) => (
                    <span key={i} className="inline-block bg-gray-200 rounded-full px-2 py-1 mr-2">
                      {skill}
                    </span>
                  ))}
                </p>
                <a href={`/organization/opportunities/${opp.id}`} className="block mt-4 text-indigo-600 text-sm hover:underline">
                  View Details →
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Applications */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Volunteer Applications</h2>
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition">
                <h3 className="font-semibold">{app.volunteer}</h3>
                <p className="text-sm text-gray-600 mt-1">Applied to: {app.opportunity}</p>
                <p className="text-xs text-gray-500 mt-1">Skill Match: {app.matchedSkills}</p>
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
                <button
                  onClick={app.onViewDetails}
                  className="mt-2 text-indigo-600 text-sm hover:underline"
                >
                  View Application →
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}