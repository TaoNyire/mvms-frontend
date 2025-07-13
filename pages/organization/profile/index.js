import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import {
  BuildingOfficeIcon,
  MapPinIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function OrgProfilePage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

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
    focus_areas: "",
    status: "",
  });
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const sectorOptions = [
    "Education",
    "Health",
    "Environment",
    "Community Development",
    "Human Rights",
    "Youth Development",
    "Women Empowerment",
    "Agriculture",
    "Technology",
    "Arts & Culture",
  ];

  const orgTypeOptions = [
    "NGO",
    "CBO",
    "Government",
    "Faith-based",
    "Educational",
    "Private",
  ];

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

  // Calculate profile completion
  const calculateCompletion = (profileData) => {
    const fields = [
      'org_name', 'description', 'mission', 'vision', 'sector',
      'org_type', 'physical_address', 'district', 'region', 'phone'
    ];
    const completed = fields.filter(field => profileData[field] && profileData[field].trim() !== '').length;
    return Math.round((completed / fields.length) * 100);
  };

  // Load profile from backend
  useEffect(() => {
    if (authLoading) return;
    if (!user) return router.push("/login");
    if (!token) return;

    setLoading(true);
    setError("");
    axios
      .get(`${API_BASE}/organization/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data;
        const formattedData = {
          ...data,
          focus_areas: Array.isArray(data.focus_areas)
            ? data.focus_areas.join(", ")
            : data.focus_areas || "",
        };
        setProfile(formattedData);
        setCompletion(calculateCompletion(formattedData));
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          // Profile doesn't exist yet, use empty profile
          setProfile({
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
            focus_areas: "",
            status: "",
          });
          setCompletion(0);
        } else {
          setError(
            err.response?.data?.message ||
              "Failed to load organization profile."
          );
        }
      })
      .finally(() => setLoading(false));
  }, [authLoading, user, router, token]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setProfile(prev => {
      const updated = { ...prev, [field]: value };
      setCompletion(calculateCompletion(updated));
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const profileData = {
        ...profile,
        focus_areas: profile.focus_areas // Keep as string since backend expects string
      };

      const res = await axios.post(`${API_BASE}/organization/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data.profile || res.data;
      const formattedData = {
        ...data,
        focus_areas: Array.isArray(data.focus_areas)
          ? data.focus_areas.join(", ")
          : data.focus_areas || "",
      };

      setProfile(formattedData);
      setCompletion(calculateCompletion(formattedData));

      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successDiv.textContent = 'Profile updated successfully!';
      document.body.appendChild(successDiv);
      setTimeout(() => document.body.removeChild(successDiv), 3000);
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
      <div className="flex min-h-screen justify-center items-center">
        <div className="text-blue-600 text-xl font-semibold">Loading your profile...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Organization Profile | MVMS</title>
        <meta name="description" content="View and edit your organization profile." />
      </Head>

      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
                Organization Profile
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Manage your organization information and settings
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 sm:px-4 py-2 rounded-lg shadow-sm border border-gray-200">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <span className="text-sm sm:text-base font-medium text-gray-700">
                {completion}% Complete
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Profile Form */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Organization Information</h2>

            {/* Read-only user info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">
                  Account Name
                </label>
                <p className="bg-white p-2 sm:p-3 rounded border border-gray-200 text-gray-800 text-sm sm:text-base break-words">
                  {user.name}
                </p>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">
                  Email
                </label>
                <p className="bg-white p-2 sm:p-3 rounded border border-gray-200 text-gray-800 text-sm sm:text-base break-words">
                  {user.email}
                </p>
              </div>
              <div className="lg:col-span-2">
                <label className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">
                  Role
                </label>
                <p className="bg-white p-2 sm:p-3 rounded border border-gray-200 text-gray-800 capitalize text-sm sm:text-base">
                  {Array.isArray(user.roles)
                    ? user.roles.join(", ")
                    : user.role || "organization"}
                </p>
              </div>
            </div>

            {/* Editable profile fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Input
                label="Organization Name"
                id="org_name"
                name="org_name"
                value={profile.org_name}
                onChange={handleChange("org_name")}
              />

              <Input
                label="Phone"
                id="phone"
                name="phone"
                value={profile.phone}
                onChange={handleChange("phone")}
              />

              <TextArea
                label="Description"
                id="description"
                name="description"
                value={profile.description}
                onChange={handleChange("description")}
                rows={3}
              />

              <TextArea
                label="Mission"
                id="mission"
                name="mission"
                value={profile.mission}
                onChange={handleChange("mission")}
                rows={3}
              />

              <TextArea
                label="Vision"
                id="vision"
                name="vision"
                value={profile.vision}
                onChange={handleChange("vision")}
                rows={3}
              />

              <Input
                label="Website"
                id="website"
                name="website"
                value={profile.website}
                onChange={handleChange("website")}
              />

              <Select
                label="Sector"
                id="sector"
                name="sector"
                value={profile.sector}
                onChange={handleChange("sector")}
              >
                <option value="">Select Sector</option>
                {sectorOptions.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </Select>

              <Select
                label="Organization Type"
                id="org_type"
                name="org_type"
                value={profile.org_type}
                onChange={handleChange("org_type")}
              >
                <option value="">Select Type</option>
                {orgTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>

              <Input
                label="Physical Address"
                id="physical_address"
                name="physical_address"
                value={profile.physical_address}
                onChange={handleChange("physical_address")}
              />

              <Input
                label="Focus Areas (comma-separated)"
                id="focus_areas"
                name="focus_areas"
                value={profile.focus_areas}
                onChange={handleChange("focus_areas")}
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
        </div>
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
      <label htmlFor={id} className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="text"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 ${
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
      <label htmlFor={id} className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 ${
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
      <label htmlFor={id} className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        value={value}
        onChange={handleChange}
        className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 ${
          isDirty ? "bg-blue-50" : "bg-white"
        }`}
      />
    </div>
  );
}