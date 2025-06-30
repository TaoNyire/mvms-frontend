import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/router";
import {
  BriefcaseIcon,
} from "@heroicons/react/24/outline";

export default function Applications() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Mock applications data
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Mock: Replace with your API call to fetch user applications
    const mockApplications = [
      {
        id: 101,
        opportunity: {
          id: 1,
          title: "Community Health Outreach",
          location: "Lilongwe",
          start_date: "2025-07-01",
        },
        status: "Pending",
        applied_on: "2025-06-10",
      },
      {
        id: 102,
        opportunity: {
          id: 3,
          title: "Teaching Assistant",
          location: "Balaka",
          start_date: "2025-09-01",
        },
        status: "Accepted",
        applied_on: "2025-06-12",
      },
    ];
    setApplications(mockApplications);
  }, []);

  if (loading || !user) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6 hidden md:block">
        <h2 className="text-xl font-bold mb-8 text-indigo-600 flex items-center gap-2">
          <BriefcaseIcon className="w-6 h-6" />
          Volunteer Panel
        </h2>
        <NavItem label="Opportunities" link="/volunteer/opportunities" />
        <NavItem label="Applications" link="/volunteer/applications" active />
        <NavItem label="Notifications" link="/volunteer/notifications" />
        <NavItem label="Profile" link="/volunteer/profile" />
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-6 text-black">My Applications</h1>

        {applications.length === 0 ? (
          <p className="text-black">You have not applied to any opportunities yet.</p>
        ) : (
          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-indigo-100 text-indigo-700">
                <th className="border border-gray-300 px-4 py-2 text-left">Opportunity</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Location</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Start Date</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Applied On</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 cursor-pointer">
                  <td
  className="border border-gray-300 px-4 py-2 text-indigo-600 underline"
  onClick={() => router.push(`/volunteer/apply/${app.opportunity.id}`)}
>
  {app.opportunity.title}
</td>
                  <td className="border border-gray-300 px-4 py-2 text-black">{app.opportunity.location}</td>
                  <td className="border border-gray-300 px-4 py-2 text-black">{app.opportunity.start_date}</td>
                  <td
                    className={`border border-gray-300 px-4 py-2 font-semibold ${
                      app.status === "Accepted"
                        ? "text-green-600"
                        : app.status === "Rejected"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {app.status}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-black">{app.applied_on}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      onClick={() => alert("Withdraw application feature coming soon!")}
                      className="text-red-600 hover:underline"
                    >
                      Withdraw
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

function NavItem({ label, link, active = false }) {
  return (
    <a
      href={link}
      className={`flex items-center gap-3 mb-4 cursor-pointer px-3 py-2 rounded ${
        active
          ? "bg-indigo-100 text-indigo-700 font-semibold"
          : "text-gray-700 hover:text-indigo-600"
      }`}
    >
      {label}
    </a>
  );
}
