import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
// Chart.js imports
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError("");

    console.log("Fetching admin dashboard data...");
    axios
      .get(`${API_BASE}/admin/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        console.log("Admin dashboard data received:", res.data);
        setStats(res.data.data || res.data);
      })
      .catch(err => {
        console.error("Admin dashboard error:", err);
        console.error("Error response:", err.response?.data);
        console.error("Error status:", err.response?.status);
        setError(`Failed to fetch dashboard data: ${err.response?.data?.message || err.message}`);
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Chart data
  const barData = {
    labels: ["Users", "Organizations", "Opportunities"],
    datasets: [
      {
        label: "Total",
        data: [
          stats.counters?.total_volunteers || 0,
          stats.counters?.total_organizations || 0,
          stats.counters?.total_opportunities || 0,
        ],
        backgroundColor: [
          "rgba(59, 130, 246, 0.7)",
          "rgba(99, 102, 241, 0.7)",
          "rgba(34, 197, 94, 0.7)",
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(99, 102, 241, 1)",
          "rgba(34, 197, 94, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels: ["Volunteers", "Organizations"],
    datasets: [
      {
        label: "Users Status",
        data: [
          stats.counters?.total_volunteers || 0,
          stats.counters?.total_organizations || 0,
        ],
        backgroundColor: [
          "rgba(34, 197, 94, 0.7)",
          "rgba(156, 163, 175, 0.7)",
        ],
        borderColor: [
          "rgba(34, 197, 94, 1)",
          "rgba(156, 163, 175, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      {loading ? (
        <div className="text-indigo-600 font-semibold">Loading...</div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
          <br />
          <small>Check the browser console for more details.</small>
        </div>
      ) : (
        <>
          <section className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard label="Volunteers" value={stats.counters?.total_volunteers || 0} color="blue" />
            <SummaryCard label="Organizations" value={stats.counters?.total_organizations || 0} color="indigo" />
            <SummaryCard label="Opportunities" value={stats.counters?.total_opportunities || 0} color="green" />
            <SummaryCard label="Applications" value={stats.counters?.total_applications || 0} color="purple" />
          </section>
          {/* Charts Section */}
          <section className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-bold mb-2">System Overview</h2>
              <Bar data={barData} options={{
                responsive: true,
                plugins: { legend: { display: false }, title: { display: false } }
              }} />
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-bold mb-2">Users Status</h2>
              <Pie data={pieData} options={{
                responsive: true,
                plugins: { legend: { position: "bottom" } }
              }} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  const colors = {
    blue: "bg-blue-200 border-blue-600",
    indigo: "bg-indigo-200 border-indigo-600",
    green: "bg-green-200 border-green-600",
    purple: "bg-purple-200 border-purple-600",
  };
  const textColors = {
    blue: "text-blue-900",
    indigo: "text-indigo-900",
    green: "text-green-900",
  };
  return (
    <div
      className={`${colors[color]} border-l-4 p-4 rounded-lg shadow flex flex-col items-center`}
    >
      <div className={`text-lg font-semibold ${textColors[color]}`}>{label}</div>
      <div className="text-4xl font-extrabold text-gray-900 mt-2">{value}</div>
    </div>
  );
}