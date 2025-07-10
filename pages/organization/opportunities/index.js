import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function OpportunitiesIndex() {
  const { token } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setApiError("");
    axios
      .get(`${API_BASE}/opportunities`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setOpportunities(res.data.data || res.data || []);
      })
      .catch((e) => {
        console.error("Failed to load opportunities:", e);
        console.error("Error details:", {
          status: e.response?.status,
          statusText: e.response?.statusText,
          data: e.response?.data,
          message: e.message
        });

        if (e.response?.status === 401) {
          setApiError("Authentication failed - please log in again");
        } else if (e.response?.status === 403) {
          setApiError("Access denied - insufficient permissions");
        } else if (e.response?.status === 500) {
          setApiError("Server error - please try again later");
        } else if (!e.response) {
          setApiError("Network error - please check your connection");
        } else {
          setApiError("Failed to load opportunities. Please try again.");
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div>
        <h1 className="text-2xl font-bold mb-6">Posted Opportunities</h1>

        {/* Add New Button */}
        <div className="flex justify-end mb-4">
          <Link
            href="/organization/opportunities/create"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
          >
            + New Opportunity
          </Link>
        </div>

        {loading ? (
          <div className="text-indigo-700 font-semibold">Loading opportunities…</div>
        ) : apiError ? (
          <div className="text-red-600 font-semibold">{apiError}</div>
        ) : opportunities.length === 0 ? (
          <div className="text-gray-500">No opportunities posted yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opp) => (
              <div key={opp.id} className="bg-white shadow-md rounded-lg p-4 border-l-4 border-indigo-500 hover:shadow-lg transition">
                <h3 className="font-semibold text-lg">{opp.title}</h3>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{opp.description}</p>
                <p className="text-xs text-gray-500 mt-2">📍 Location: {opp.location}</p>
                <p className="text-xs text-gray-500 mt-1">📅 Starts: {opp.start_date ? new Date(opp.start_date).toLocaleDateString() : "N/A"}</p>
                {opp.end_date && (
                  <p className="text-xs text-gray-500 mt-1">🏁 Ends: {new Date(opp.end_date).toLocaleDateString()}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">👥 Needed: {opp.volunteers_needed} volunteers</p>
                <p className="mt-2 text-xs">
                  {(opp.required_skills || []).map((skill, i) => (
                    <span key={i} className="inline-block bg-gray-200 rounded-full px-2 py-1 mr-2">
                      {skill}
                    </span>
                  ))}
                </p>
                <Link
                  href={`/organization/opportunities/${opp.id}`}
                  className="text-indigo-600 text-sm hover:underline mt-4 inline-block"
                >
                  View Details →
                </Link>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}