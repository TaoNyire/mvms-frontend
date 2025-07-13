import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useAuth } from "../../context/AuthContext";
import {
  getOrganizationSkills,
  createOrganizationSkill,
  updateOrganizationSkill,
  deleteOrganizationSkill,
  toggleOrganizationSkillStatus,
  getSkillCategories,
  getSkillProficiencyLevels
} from "../../lib/api";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  TagIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

export default function OrganizationSkills() {
  const { token } = useAuth();
  const [skills, setSkills] = useState([]);
  const [globalSkills, setGlobalSkills] = useState([]);
  const [organizationSkills, setOrganizationSkills] = useState([]);
  const [categories, setCategories] = useState({});
  const [proficiencyLevels, setProficiencyLevels] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    required_proficiency_level: "intermediate",
    priority: 0,
  });

  useEffect(() => {
    if (!token) return;
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [skillsRes, categoriesRes, proficiencyRes] = await Promise.all([
        getOrganizationSkills(),
        getSkillCategories(),
        getSkillProficiencyLevels()
      ]);

      setSkills(skillsRes.data.skills || []);
      setGlobalSkills(skillsRes.data.global_skills || []);
      setOrganizationSkills(skillsRes.data.organization_skills || []);
      setCategories(categoriesRes.data || {});
      setProficiencyLevels(proficiencyRes.data || {});
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSkill) {
        await updateOrganizationSkill(editingSkill.id, formData);
      } else {
        await createOrganizationSkill(formData);
      }
      
      setShowCreateModal(false);
      setEditingSkill(null);
      setFormData({
        name: "",
        description: "",
        category: "",
        required_proficiency_level: "intermediate",
        priority: 0,
      });
      fetchData();
    } catch (error) {
      console.error("Error saving skill:", error);
    }
  };

  const handleEdit = (skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      description: skill.description || "",
      category: skill.category,
      required_proficiency_level: skill.required_proficiency_level || "intermediate",
      priority: skill.priority || 0,
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (skillId) => {
    if (!confirm("Are you sure you want to delete this skill?")) return;
    
    try {
      await deleteOrganizationSkill(skillId);
      fetchData();
    } catch (error) {
      console.error("Error deleting skill:", error);
      alert("Error deleting skill. It may be in use by opportunities.");
    }
  };

  const handleToggleStatus = async (skillId) => {
    try {
      await toggleOrganizationSkillStatus(skillId);
      fetchData();
    } catch (error) {
      console.error("Error toggling skill status:", error);
    }
  };

  const getProficiencyColor = (level) => {
    switch (level) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-blue-100 text-blue-800";
      case "advanced": return "bg-purple-100 text-purple-800";
      case "expert": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading skills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Skills Management - Organization Dashboard</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Skills Management</h1>
              <p className="mt-2 text-gray-600">
                Manage your organization's custom skills and view available global skills
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Custom Skill
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Organization Skills */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TagIcon className="h-5 w-5 mr-2 text-blue-600" />
              Your Custom Skills ({organizationSkills.length})
            </h2>
            
            {organizationSkills.length === 0 ? (
              <div className="text-center py-8">
                <TagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No custom skills created yet</p>
                <p className="text-sm text-gray-500">Create your first custom skill to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {organizationSkills.map((skill) => (
                  <div key={skill.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-gray-900">{skill.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            skill.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {skill.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {skill.description && (
                          <p className="text-sm text-gray-600 mb-2">{skill.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="capitalize">{categories[skill.category] || skill.category}</span>
                          {skill.required_proficiency_level && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProficiencyColor(skill.required_proficiency_level)}`}>
                              {proficiencyLevels[skill.required_proficiency_level] || skill.required_proficiency_level}
                            </span>
                          )}
                          {skill.priority > 0 && (
                            <span className="flex items-center">
                              <StarIcon className="h-4 w-4 mr-1" />
                              Priority: {skill.priority}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleToggleStatus(skill.id)}
                          className="text-gray-400 hover:text-gray-600"
                          title={skill.is_active ? "Deactivate" : "Activate"}
                        >
                          {skill.is_active ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(skill)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(skill.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Global Skills */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <StarIcon className="h-5 w-5 mr-2 text-green-600" />
              Global Skills ({globalSkills.length})
            </h2>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {globalSkills.map((skill) => (
                <div key={skill.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{skill.name}</h3>
                      {skill.description && (
                        <p className="text-sm text-gray-600 mb-2">{skill.description}</p>
                      )}
                      <span className="text-sm text-gray-500 capitalize">
                        {categories[skill.category] || skill.category}
                      </span>
                    </div>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      Global
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingSkill ? 'Edit Skill' : 'Create Custom Skill'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skill Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {Object.entries(categories).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Required Proficiency Level
                  </label>
                  <select
                    value={formData.required_proficiency_level}
                    onChange={(e) => setFormData({ ...formData, required_proficiency_level: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Object.entries(proficiencyLevels).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    {editingSkill ? 'Update Skill' : 'Create Skill'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingSkill(null);
                      setFormData({
                        name: "",
                        description: "",
                        category: "",
                        required_proficiency_level: "intermediate",
                        priority: 0,
                      });
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
