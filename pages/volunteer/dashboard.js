// pages/dashboard.js
import React, { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import FeatureCard from "../../components/FeatureCard";
import Footer from '../../components/Footer';

import {
  BriefcaseIcon,
  DocumentTextIcon,
  BellIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Header user={user} logout={logout} />

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            title="Browse Opportunities"
            description="Search for available volunteering opportunities based on your skills."
            link="/volunteer/opportunities"
            color="indigo"
            Icon={BriefcaseIcon}
          />
          <FeatureCard
            title="My Applications"
            description="Track your current and past applications."
            link="/volunteer/applications"
            color="blue"
            Icon={DocumentTextIcon}
          />
          <FeatureCard
            title="My Profile"
            description="Update your personal information and skills."
            link="/volunteer/profile"
            color="green"
            Icon={UserCircleIcon}
          />
          <FeatureCard
            title="Notifications"
            description="View alerts and system messages."
            link="/volunteer/notifications"
            color="yellow"
            Icon={BellIcon}
          />
           <Footer />
        </div>
      </main>
    </div>
  );
}