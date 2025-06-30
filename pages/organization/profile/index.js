// pages/organization/profile/index.js

import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuth } from "../../../context/AuthContext";
import OrgLayout from "../../../components/OrgLayout";
import { getOrgProfile, saveOrgProfile } from "../../../lib/api";

export default function OrgProfilePage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  // Local state
  const [profile, setProfile] = useState({
    org_name: "",
    description: "",
    mission: "",
    vision: "",
    sector: "",
    org_type: "",
    physical_address: "",
    district: "",
    region: "",
    phone: "",
    website: "",
    focus_areas: "", // Now a string
    status: "",
  });
  const [formData, setFormData] = useState(profile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Ensure only Organizations can access
  useEffect(() => {
    if (!authLoading && user) {
      const roles = Array.isArray(user.roles)
        ? user.roles.map((r) => r.toLowerCase())
        : [user.role.toLowerCase()];
      if (!roles.includes("organization")) {
        router.replace("/");
      }
    }

    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Fetch existing profile
  useEffect(() => {
    if (authLoading) return;
    if (!user) return router.push("/login");

    getOrgProfile(token)
      .then((res) => {
        const data = res.data;

        // Convert array to string if needed
        const formattedData = {
          ...data,
          focus_areas: Array.isArray(data.focus_areas)
            ? data.focus_areas.join(", ")
            : data.focus_areas || "",
        };

        setProfile(formattedData);
        setFormData({ ...formattedData, isEditing: false });
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            "Failed to load organization profile."
        );
      })
      .finally(() => setLoading(false));
  }, [authLoading, user, router, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await saveOrgProfile(formData, token);
      const data = res.data.profile;

      const formattedData = {
        ...data,
        focus_areas: Array.isArray(data.focus_areas)
          ? data.focus_areas.join(", ")
          : data.focus_areas || "",
      };

      setProfile(formattedData);
      setFormData(formattedData);
      alert("Profile updated successfully!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <OrgLayout>
        <div className="flex items-center justify-center h-64 bg-gradient-to-r from-blue-50 to-blue-100">
          <p className="text-blue-600 font-semibold">Loading...</p>
        </div>
      </OrgLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Organization Profile</title>
        <meta name="description" content="View and edit your organization profile." />
      </Head>

      <OrgLayout>
        <div className="p-6 max-w-4xl mx-auto w-full bg-gradient-to-r from-blue-50 to-blue-100 min-h-screen">
          <h1 className="text-3xl font-bold mb-2 text-blue-700">
            Organization Profile
          </h1>
          <p className="text-sm text-blue-900 mb-6">
            Profile completeness: <strong>80%</strong>
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
          )}

          <div className="bg-white p-6 rounded-lg shadow border border-blue-200">
            {/* View Mode */}
            {!formData.isEditing ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Organization Name" value={profile.org_name} />
                  <Field label="Description" value={profile.description} />
                  <Field label="Mission" value={profile.mission} />
                  <Field label="Vision" value={profile.vision} />
                  <Field label="Sector" value={profile.sector} />
                  <Field label="Type" value={profile.org_type} />
                  <Field label="Address" value={profile.physical_address} />
                  <Field label="District" value={profile.district} />
                  <Field label="Region" value={profile.region} />
                  <Field label="Phone" value={profile.phone} />
                  <Field label="Website" value={profile.website} />
                  <Field label="Focus Areas" value={profile.focus_areas} />
                  <Field label="Status" value={profile.status} />
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => setFormData((f) => ({ ...f, isEditing: true }))}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                  >
                    Edit Profile
                  </button>
                </div>
              </>
            ) : (
              /* Edit Mode */
              <>
                <div className="space-y-4">
                  {[
                    "org_name",
                    "description",
                    "mission",
                    "vision",
                    "sector",
                    "org_type",
                    "physical_address",
                    "district",
                    "region",
                    "phone",
                    "website",
                  ].map((field) => (
                    <FormField
                      key={field}
                      label={field.replace(/_/g, " ")}
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      isTextArea={field === "description"}
                    />
                  ))}

                  <div>
                    <label className="block text-blue-900 font-medium mb-1">
                      Focus Areas (comma-separated)
                    </label>
                    <input
                      name="focus_areas"
                      type="text"
                      value={formData.focus_areas}
                      onChange={handleChange}
                      placeholder="e.g. Education, Health, Environment"
                      className="w-full border border-blue-300 rounded px-3 py-2 focus:ring-blue-500 focus:outline-none text-black transition-colors bg-white"
                    />
                  </div>
                </div>

                <div className="mt-6 flex space-x-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      saving ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                  <button
                    onClick={() => {
                      setFormData({ ...profile, isEditing: false });
                    }}
                    className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </OrgLayout>
    </>
  );
}

// Field Display Component
function Field({ label, value }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-blue-700">{label}</h2>
      <p className="text-gray-700 mt-1">{value || "-"}</p>
    </div>
  );
}

// Reusable Form Input Component
function FormField({ label, name, value, onChange, isTextArea = false }) {
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (e) => {
    setIsDirty(true);
    onChange(e);
  };

  return (
    <div>
      <label htmlFor={name} className="block text-blue-900 font-medium mb-1">
        {label}
      </label>
      {isTextArea ? (
        <textarea
          id={name}
          name={name}
          rows={3}
          value={value}
          onChange={handleChange}
          className={`w-full border border-blue-300 rounded px-3 py-2 resize-none focus:ring-blue-500 focus:outline-none transition-colors text-black ${
            isDirty ? "bg-blue-50" : "bg-white"
          }`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type="text"
          value={value}
          onChange={handleChange}
          className={`w-full border border-blue-300 rounded px-3 py-2 focus:ring-blue-500 focus:outline-none transition-colors text-black ${
            isDirty ? "bg-blue-50" : "bg-white"
          }`}
        />
      )}
    </div>
  );
}