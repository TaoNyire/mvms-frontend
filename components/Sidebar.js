// components/Sidebar.js
import React from "react";
import { BriefcaseIcon, DocumentTextIcon, BellIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import NavItem from "./NavItem";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-md p-6 hidden md:block">
      <h2 className="text-xl font-bold mb-8 text-indigo-600">Volunteer Panel</h2>
      <NavItem icon={BriefcaseIcon} label="Opportunities" link="/volunteer/opportunities" />
      <NavItem icon={DocumentTextIcon} label="Applications" link="/volunteer/applications" />
      <NavItem icon={BellIcon} label="Notifications" link="/volunteer/notifications" />
      <NavItem icon={UserCircleIcon} label="Profile" link="/volunteer/profile" />
    </aside>
  );
}