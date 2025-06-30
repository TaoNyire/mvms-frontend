// components/FeatureCard.js
import React from "react";

export default function FeatureCard({ title, description, link, color, Icon }) {
  return (
    <div
      onClick={() => window.location.href = link}
      className={`cursor-pointer bg-${color}-100 hover:bg-${color}-200 p-4 rounded-lg shadow transition`}
    >
      <div className="flex items-center mb-2">
        <Icon className="w-6 h-6 text-black mr-2" />
        <h4 className="font-bold text-lg text-black">{title}</h4>
      </div>
      <p className="text-sm text-black">{description}</p>
    </div>
  );
}