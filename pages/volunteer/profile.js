// pages/volunteer/profile.js

import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import { getProfile, saveProfile } from "../../lib/api";

// region→district mapping
const regionDistricts = {
  Northern: ["Mzimba", "Rumphi", "Karonga", "Chitipa", "Nkhata Bay", "Likoma"],
  Central: [
    "Lilongwe",
    "Kasungu",
    "Ntchisi",
    "Nkhotakota",
    "Dowa",
    "Salima",
    "Mchinji",
  ],
  Southern: [
    "Blantyre",
    "Zomba",
    "Mangochi",
    "Chiradzulu",
    "Mulanje",
    "Phalombe",
    "Nsanje",
    "Thyolo",
    "Balaka",
    "Machinga",
    "Chikwawa",
    "Neno",
  ],
};

export default function ProfilePage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState({
    bio: "",
    location: "",
    region: "",
    district: "",
    availability: "",
  });
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const availabilityOptions = [
    "Full-time",
    "Weekends",
    "Part-time",
    "Occasional",
  ];

  // Redirect non-Volunteer roles
  useEffect(() => {
    if (!authLoading && user) {
      const roles = Array.isArray(user.roles)
        ? user.roles.map((r) => r.toLowerCase())
        : [user.role.toLowerCase()];
      if (!roles.includes("volunteer")) {
        router.replace("/");
      }
    }

    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Load profile
  useEffect(() => {
    if (authLoading) return;
    if (!user) return router.push("/login");

    getProfile(token)
      .then((res) => {
        setProfile(res.data);
        setCompletion(res.data.completion || 0);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setCompletion(0);
        } else {
          setError("Failed to load profile. Please try again.");
        }
      })
      .finally(() => setLoading(false));
  }, [authLoading, user, router, token]);

  // Clear district when region changes
  useEffect(() => {
    const { region, district } = profile;
    if (region && !regionDistricts[region]?.includes(district)) {
      setProfile((p) => ({ ...p, district: "" }));
    }
  }, [profile.region, profile.district]);

  const handleChange = (field) => (e) =>
    setProfile((p) => ({ ...p, [field]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await saveProfile(profile, token);
      setProfile(res.data.profile);

      const filled = ["bio", "location", "region", "district", "availability"]
        .filter((f) => res.data.profile[f]).length;

      setCompletion(Math.round((filled / 5) * 100));
      alert("Profile saved!");
    } catch {
      setError("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100">
        <p className="text-blue-600 font-semibold">Loading profile…</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Volunteer Profile</title>
        <meta name="description" content="Edit your volunteer profile." />
      </Head>

      <div className="flex min-h-screen bg-gradient-to-r from-blue-50 to-blue-100">
        <Sidebar active="profile" />

        <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
          <h1 className="text-3xl font-bold mb-2 text-blue-700">
            My Volunteer Profile
          </h1>
          <p className="text-sm text-blue-900 mb-6">
            Profile completeness: <strong>{completion}%</strong>
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
          )}

          <div className="bg-white p-6 rounded-lg shadow border border-blue-200">
            {/* Read-only user info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-blue-900 font-medium mb-1">
                  Name
                </label>
                <p className="bg-blue-50 p-2 rounded border border-blue-200 text-black">
                  {user.name}
                </p>
              </div>
              <div>
                <label className="block text-blue-900 font-medium mb-1">
                  Email
                </label>
                <p className="bg-blue-50 p-2 rounded border border-blue-200 text-black">
                  {user.email}
                </p>
              </div>
              <div>
                <label className="block text-blue-900 font-medium mb-1">
                  Role
                </label>
                <p className="bg-blue-50 p-2 rounded border border-blue-200 text-black">
                  {Array.isArray(user.roles)
                    ? user.roles.join(", ")
                    : user.role}
                </p>
              </div>
            </div>

            {/* Editable profile fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextArea
                label="Bio"
                id="bio"
                name="bio"
                value={profile.bio}
                onChange={handleChange("bio")}
              />

              <Input
                label="Location"
                id="location"
                name="location"
                value={profile.location}
                onChange={handleChange("location")}
              />

              <Select
                label="Region"
                id="region"
                name="region"
                value={profile.region}
                onChange={handleChange("region")}
              >
                <option value="">Select Region</option>
                {Object.keys(regionDistricts).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>

              <Select
                label="District"
                id="district"
                name="district"
                value={profile.district}
                onChange={handleChange("district")}
                disabled={!profile.region}
              >
                <option value="">Select District</option>
                {(regionDistricts[profile.region] || []).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>

              <Select
                label="Availability"
                id="availability"
                name="availability"
                value={profile.availability}
                onChange={handleChange("availability")}
              >
                <option value="">Select Availability</option>
                {availabilityOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className={`mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                saving ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </main>
      </div>
    </>
  );
}

// Input Field with Dirty State and Black Text
function Input({ label, id, name, value, onChange, disabled = false }) {
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (e) => {
    setIsDirty(true);
    onChange(e);
  };

  return (
    <div>
      <label htmlFor={id} className="block text-blue-900 font-medium mb-1">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="text"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={`w-full border border-blue-300 rounded px-3 py-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 transition-colors text-black ${
          isDirty ? "bg-blue-50" : "bg-white"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
      />
    </div>
  );
}

// Select Field with Dirty State and Black Text
function Select({ label, id, name, value, onChange, disabled = false, children }) {
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (e) => {
    setIsDirty(true);
    onChange(e);
  };

  return (
    <div>
      <label htmlFor={id} className="block text-blue-900 font-medium mb-1">
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={`w-full border border-blue-300 rounded px-3 py-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 transition-colors text-black ${
          isDirty ? "bg-blue-50" : "bg-white"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
      >
        {children}
      </select>
    </div>
  );
}

// Textarea Field with Dirty State and Black Text
function TextArea({ label, id, name, value, onChange, rows = 4 }) {
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (e) => {
    setIsDirty(true);
    onChange(e);
  };

  return (
    <div>
      <label htmlFor={id} className="block text-blue-900 font-medium mb-1">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        value={value}
        onChange={handleChange}
        className={`w-full border border-blue-300 rounded px-3 py-2 resize-none focus:ring-blue-500 focus:outline-none transition-colors text-black ${
          isDirty ? "bg-blue-50" : "bg-white"
        }`}
      />
    </div>
  );
}