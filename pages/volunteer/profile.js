import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import {
  UserCircleIcon,
  MapPinIcon,
  ClockIcon,
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

export default function ProfilePage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState({
    bio: "",
    location: "",
    region: "",
    district: "",
    availability: "",
    cv: null,
    cv_original_name: null,
    cv_url: null,
  });
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [deletingCv, setDeletingCv] = useState(false);

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

  // Load profile from backend
  useEffect(() => {
    if (authLoading) return;
    if (!user) return router.push("/login");
    if (!token) return;

    setLoading(true);
    setError("");
    axios
      .get(`${API_BASE}/volunteer/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProfile(res.data);
        setCompletion(res.data.completion || calculateCompletion(res.data));
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

  // Save profile to backend
  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await axios.post(
        `${API_BASE}/volunteer/profile`,
        profile,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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

  // Handle CV file selection
  const handleCvFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a PDF, DOC, or DOCX file.');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.');
        return;
      }

      setCvFile(file);
    }
  };

  // Upload CV
  const handleCvUpload = async () => {
    if (!cvFile) return;

    setUploadingCv(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append('cv', cvFile);

      const response = await axios.post(
        `${API_BASE}/volunteer/profile/cv`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Update profile with new CV info
      setProfile(prev => ({
        ...prev,
        cv_url: response.data.cv_url,
        cv_original_name: response.data.cv_original_name
      }));

      setCvFile(null);
      // Reset file input
      const fileInput = document.getElementById('cv-upload');
      if (fileInput) fileInput.value = '';

      alert('CV uploaded successfully!');
    } catch (error) {
      console.error('Error uploading CV:', error);
      setError(error.response?.data?.message || 'Failed to upload CV. Please try again.');
    } finally {
      setUploadingCv(false);
    }
  };

  // Delete CV
  const handleCvDelete = async () => {
    if (!confirm('Are you sure you want to delete your CV? This action cannot be undone.')) {
      return;
    }

    setDeletingCv(true);
    setError("");

    try {
      await axios.delete(`${API_BASE}/volunteer/profile/cv`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update profile to remove CV info
      setProfile(prev => ({
        ...prev,
        cv_url: null,
        cv_original_name: null
      }));

      alert('CV deleted successfully!');
    } catch (error) {
      console.error('Error deleting CV:', error);
      setError(error.response?.data?.message || 'Failed to delete CV. Please try again.');
    } finally {
      setDeletingCv(false);
    }
  };

  function calculateCompletion(data) {
    if (!data) return 0;
    const fields = ["bio", "location", "region", "district", "availability"];
    const filled = fields.filter((f) => data[f]).length;
    return Math.round((filled / fields.length) * 100);
  }

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

      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center space-x-3">
          <UserCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-green-700">My Volunteer Profile</h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage your volunteer information and preferences</p>
          </div>
        </div>

        {/* Profile Completion */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm sm:text-base font-medium text-gray-700">Profile Completion</span>
            <span className="text-sm sm:text-base font-bold text-green-600">{completion}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
            <div
              className="bg-green-600 h-2 sm:h-3 rounded-full transition-all duration-300"
              style={{ width: `${completion}%` }}
            ></div>
          </div>
          {completion < 100 && (
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Complete your profile to get better opportunity matches
            </p>
          )}
        </div>

        {/* CV Requirement Notice */}
        {!profile.cv_url && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
            <div className="flex items-start gap-3">
              <DocumentTextIcon className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-amber-900 mb-1">CV Upload Required</h3>
                <p className="text-sm text-amber-800">
                  You must upload your CV before you can apply for volunteer opportunities.
                  This helps organizations understand your background and match you with suitable positions.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Profile Information</h2>

          {/* Read-only user info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">
                Name
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
                  : user.role || "volunteer"}
              </p>
            </div>
          </div>

            {/* Editable profile fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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

            {/* CV Upload Section */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📄 CV/Resume</h3>

              {profile.cv_url ? (
                // CV exists - show current CV and options
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">📄</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {profile.cv_original_name || 'CV.pdf'}
                        </p>
                        <p className="text-sm text-gray-500">Current CV</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={profile.cv_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        View
                      </a>
                      <button
                        onClick={handleCvDelete}
                        disabled={deletingCv}
                        className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {deletingCv ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>

                  {/* Replace CV option */}
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-3">Upload a new CV to replace the current one:</p>
                    <div className="flex items-center space-x-3">
                      <input
                        type="file"
                        id="cv-upload"
                        accept=".pdf,.doc,.docx"
                        onChange={handleCvFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {cvFile && (
                        <button
                          onClick={handleCvUpload}
                          disabled={uploadingCv}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {uploadingCv ? 'Uploading...' : 'Replace CV'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // No CV - show upload option
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-gray-400 text-2xl">📄</span>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No CV uploaded</h4>
                  <p className="text-gray-600 mb-4">Upload your CV to help organizations learn more about your background and qualifications.</p>

                  <div className="max-w-md mx-auto">
                    <input
                      type="file"
                      id="cv-upload"
                      accept=".pdf,.doc,.docx"
                      onChange={handleCvFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-3"
                    />
                    {cvFile && (
                      <button
                        onClick={handleCvUpload}
                        disabled={uploadingCv}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {uploadingCv ? 'Uploading...' : 'Upload CV'}
                      </button>
                    )}
                  </div>

                  <div className="mt-4 text-xs text-gray-500">
                    <p>Supported formats: PDF, DOC, DOCX</p>
                    <p>Maximum file size: 5MB</p>
                  </div>
                </div>
              )}
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
        className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-800 ${
          isDirty ? "bg-green-50" : "bg-white"
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
        className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-800 ${
          isDirty ? "bg-green-50" : "bg-white"
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
        className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-800 ${
          isDirty ? "bg-green-50" : "bg-white"
        }`}
      />
    </div>
  );
}