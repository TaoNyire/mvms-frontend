import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import Sidebar from "../../components/AdminSidebar";
import AdminHeader from "../../components/AdminHeader";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [error, setError] = useState("");

  // Memoize roles for performance and to avoid unnecessary reruns
  const roles = React.useMemo(
    () => user?.roles?.map((r) => r.name.toLowerCase()) || [],
    [user]
  );

  // Redirect non-admin or unauthenticated users to login
  useEffect(() => {
    if (!loading && (!user || !roles.includes("admin"))) {
      router.replace("/login");
    }
  }, [user, loading, roles, router]);

  // Fetch skills for admin view
  const fetchSkills = useCallback(() => {
    if (!user) return;
    axios
      .get("/api/skills", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setSkills(res.data.skills))
      .catch((err) => setError("Failed to fetch skills"));
  }, [user]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  // Add new skill handler
  const handleAddSkill = async (e) => {
    e.preventDefault();
    setError("");
    if (!newSkill.trim()) return;
    try {
      const res = await axios.post(
        "/api/skills",
        { name: newSkill },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSkills((prev) => [...prev, res.data.skill]);
      setNewSkill("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add skill");
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <p className="text-blue-900">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-r from-blue-50 to-blue-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <AdminHeader />

        <main className="flex-grow p-6 max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Admin Controls</h2>
          <p className="text-sm text-blue-900 mb-8">
            Welcome to the MVMS Admin Panel. You can manage system-wide data and access reports here.
          </p>

          <section className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Add Skills</h3>
            <form className="space-y-4" onSubmit={handleAddSkill}>
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-1">
                  Skill Name
                </label>
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="E.g., First Aid, Leadership"
                  className="w-full px-4 py-3 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-900"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-400"
              >
                Add Skill
              </button>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </form>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-blue-700 mb-2">
                Current Skills
              </h4>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                {skills.length > 0 ? (
                  skills.map((skill) => <li key={skill.id}>{skill.name}</li>)
                ) : (
                  <li className="text-blue-400">No skills found.</li>
                )}
              </ul>
            </div>
          </section>
        </main>

        <footer className="py-4 text-center text-sm text-blue-900">
          &copy; {new Date().getFullYear()} Malawi Volunteer Management System (MVMS)
        </footer>
      </div>
    </div>
  );
}