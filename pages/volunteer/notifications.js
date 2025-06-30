// pages/volunteer/notifications.js
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";
import Link from "next/link";

import Sidebar from "../../components/Sidebar";

import {
  BriefcaseIcon,
  DocumentTextIcon,
  BellIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

export default function Notifications() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }

    // Mock notifications - replace with API call later
    const mockData = [
      {
        id: 1,
        title: "Application Submitted",
        message: "Your application for 'Tree Planting Exercise' has been received.",
        read: false,
        date: "2025-06-17",
      },
      {
        id: 2,
        title: "New Opportunity Match",
        message: "A new opportunity matches your skills: 'Community Health Outreach'.",
        read: false,
        date: "2025-06-16",
      },
      {
        id: 3,
        title: "Opportunity Updated",
        message: "'Teaching Assistant' dates have changed.",
        read: true,
        date: "2025-06-14",
      },
    ];

    setNotifications(mockData);
  }, [user, loading, router]);

  if (loading || !user)
    return <div className="text-center mt-10 text-gray-700">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar component */}
      <Sidebar active="notifications" />

      {/* Main Content */}
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-black mb-4">Notifications</h1>
        <p className="text-black mb-6">
          Stay informed about your activities and matches.
        </p>

        {notifications.length === 0 ? (
          <p className="text-gray-600">No notifications at the moment.</p>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded border shadow-sm ${
                  n.read ? "bg-white" : "bg-indigo-50 border-indigo-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-indigo-700">
                    {n.title}
                  </h2>
                  <span className="text-sm text-gray-500">{n.date}</span>
                </div>
                <p className="mt-1 text-gray-800">{n.message}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
