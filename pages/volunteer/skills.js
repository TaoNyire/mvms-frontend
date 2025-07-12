import { useState, useEffect } from "react";
import Head from "next/head";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
  XMarkIcon,
  StarIcon
} from "@heroicons/react/24/outline";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function VolunteerSkills() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [skills, setSkills] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [categories, setCategories] = useState({});
  const [proficiencyLevels, setProficiencyLevels] = useState({});
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Form states
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [proficiencyLevel, setProficiencyLevel] = useState("beginner");
  const [yearsExperience, setYearsExperience] = useState("");
  const [notes, setNotes] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!token) return;
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setApiLoading(true);
      setApiError("");

      // Fetch all available skills
      const skillsResponse = await axios.get(`${API_BASE}/skills`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSkills(skillsResponse.data.skills || []);
      setCategories(skillsResponse.data.categories || {});
      setProficiencyLevels(skillsResponse.data.proficiency_levels || {});

      // Fetch user's skills
      const userSkillsResponse = await axios.get(`${API_BASE}/my-skills`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUserSkills(userSkillsResponse.data.skills || []);

    } catch (error) {
      console.error('Error fetching skills data:', error);
      
      // Set empty arrays - no sample data
      setSkills([]);
      setCategories({});
      setProficiencyLevels({});
      setUserSkills([]);
      
      if (error.response?.status === 401) {
        setApiError("Authentication failed. Please log in again.");
      } else if (error.response?.status === 403) {
        setApiError("Access denied. Please check your permissions.");
      } else if (error.response?.status === 500) {
        setApiError("Server error. Please try again later.");
      } else if (!error.response) {
        setApiError("Network error. Please check your connection and try again.");
      } else {
        setApiError(`Failed to load skills data (Error ${error.response?.status || 'Unknown'}). Please try again.`);
      }
      
    } finally {
      setApiLoading(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!selectedSkillId) return;

    try {
      setFormLoading(true);

      const skillData = {
        skill_id: parseInt(selectedSkillId),
        proficiency_level: proficiencyLevel,
        years_experience: yearsExperience ? parseInt(yearsExperience) : null,
        notes: notes
      };

      console.log('Adding skill with data:', skillData);

      // Try the main endpoint first, then test endpoint as fallback
      let response;
      try {
        response = await axios.post(`${API_BASE}/my-skills`, skillData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (mainError) {
        console.log('Main endpoint failed, trying test endpoint:', mainError.response?.data);

        // Try test endpoint to debug
        const testResponse = await axios.post(`${API_BASE}/test-add-skill`, skillData, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Test endpoint response:', testResponse.data);
        throw mainError; // Re-throw the original error
      }

      // Refresh user skills
      await fetchData();
      
      // Reset form
      setSelectedSkillId("");
      setProficiencyLevel("beginner");
      setYearsExperience("");
      setNotes("");
      setShowAddModal(false);
      
    } catch (error) {
      console.error('Error adding skill:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      if (error.response?.status === 422) {
        // Validation error
        const validationErrors = error.response.data?.errors;
        if (validationErrors) {
          const errorMessages = Object.values(validationErrors).flat().join(', ');
          setApiError(`Validation error: ${errorMessages}`);
        } else {
          setApiError(error.response.data?.message || "Validation failed");
        }
      } else {
        setApiError(error.response?.data?.message || "Failed to add skill");
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateSkill = async (e) => {
    e.preventDefault();
    if (!editingSkill) return;

    try {
      setFormLoading(true);
      
      await axios.put(`${API_BASE}/my-skills/${editingSkill.id}`, {
        proficiency_level: proficiencyLevel,
        years_experience: yearsExperience ? parseInt(yearsExperience) : null,
        notes: notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refresh user skills
      await fetchData();
      
      // Reset form
      setEditingSkill(null);
      setProficiencyLevel("beginner");
      setYearsExperience("");
      setNotes("");
      
    } catch (error) {
      console.error('Error updating skill:', error);
      setApiError(error.response?.data?.message || "Failed to update skill");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!confirm("Are you sure you want to remove this skill?")) return;

    try {
      await axios.delete(`${API_BASE}/my-skills/${skillId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refresh user skills
      await fetchData();
      
    } catch (error) {
      console.error('Error deleting skill:', error);
      setApiError(error.response?.data?.message || "Failed to remove skill");
    }
  };

  const startEditing = (skill) => {
    setEditingSkill(skill);
    setProficiencyLevel(skill.pivot.proficiency_level);
    setYearsExperience(skill.pivot.years_experience || "");
    setNotes(skill.pivot.notes || "");
  };

  const getProficiencyColor = (level) => {
    switch (level) {
      case 'beginner': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-green-100 text-green-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProficiencyStars = (level) => {
    const stars = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
      expert: 4
    };
    return stars[level] || 1;
  };

  const filteredSkills = skills.filter(skill => 
    selectedCategory === "all" || skill.category === selectedCategory
  );

  const availableSkills = filteredSkills.filter(skill => 
    !userSkills.some(userSkill => userSkill.id === skill.id)
  );

  if (loading || apiLoading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>My Skills - Volunteer Panel</title>
        <meta name="description" content="Manage your volunteer skills and expertise" />
      </Head>

      <div className="space-y-6">
        {/* Error Message */}
        {apiError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{apiError}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">My Skills</h1>
            <p className="text-gray-600">Manage your skills to get better opportunity matches</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Add Skill
          </button>
        </div>

        {/* Current Skills */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Skills ({userSkills.length})</h2>
          
          {userSkills.length === 0 ? (
            <div className="text-center py-8">
              <StarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">You haven't added any skills yet.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Skill
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {userSkills.map((skill) => (
                <div key={skill.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEditing(skill)}
                        className="text-blue-600 hover:text-blue-700 p-1"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProficiencyColor(skill.pivot.proficiency_level)}`}>
                        {proficiencyLevels[skill.pivot.proficiency_level] || skill.pivot.proficiency_level}
                      </span>
                      <div className="flex">
                        {Array.from({ length: 4 }, (_, i) => (
                          <StarIcon
                            key={i}
                            className={`w-4 h-4 ${
                              i < getProficiencyStars(skill.pivot.proficiency_level)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {skill.pivot.years_experience && (
                      <p className="text-sm text-gray-600">
                        {skill.pivot.years_experience} year{skill.pivot.years_experience !== 1 ? 's' : ''} experience
                      </p>
                    )}
                    
                    {skill.pivot.notes && (
                      <p className="text-sm text-gray-600 italic">"{skill.pivot.notes}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Skill Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Add New Skill</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleAddSkill} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Categories</option>
                      {Object.entries(categories).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skill
                    </label>
                    <select
                      value={selectedSkillId}
                      onChange={(e) => setSelectedSkillId(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a skill</option>
                      {availableSkills.map((skill) => (
                        <option key={skill.id} value={skill.id}>
                          {skill.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proficiency Level
                    </label>
                    <select
                      value={proficiencyLevel}
                      onChange={(e) => setProficiencyLevel(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(proficiencyLevels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience (Optional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      maxLength={500}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Any additional details about your experience..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={formLoading || !selectedSkillId}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {formLoading ? "Adding..." : "Add Skill"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Skill Modal */}
        {editingSkill && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Edit {editingSkill.name}</h3>
                  <button
                    onClick={() => setEditingSkill(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleUpdateSkill} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proficiency Level
                    </label>
                    <select
                      value={proficiencyLevel}
                      onChange={(e) => setProficiencyLevel(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(proficiencyLevels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience (Optional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      maxLength={500}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Any additional details about your experience..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {formLoading ? "Updating..." : "Update Skill"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingSkill(null)}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
