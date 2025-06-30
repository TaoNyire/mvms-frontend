// components/NavItem.js
import React from "react";

export default function NavItem({ icon: Icon, label, link }) {
  return (
    <div
      onClick={() => (window.location.href = link)}
      className="flex items-center gap-3 mb-4 cursor-pointer hover:text-indigo-600"
    >
      <Icon className="w-5 h-5 text-indigo-500" />
      <span className="text-black">{label}</span>
    </div>
  );
}