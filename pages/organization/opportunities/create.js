import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/router";
import { createOpportunity, getOrganizationSkills } from "../../../lib/api";

export default function CreateOpportunity() {
  const { token } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    start_date: "",
    end_date: "",
    volunteers_needed: "",
    skills: [], // Changed to skills array of IDs
    tasks: [
      {
        title: "",
        description: "",
        start_date: "",
        end_date: "",
      }
    ],
  });

  const [availableSkills, setAvailableSkills] = useState([]);
  const [globalSkills, setGlobalSkills] = useState([]);
  const [organizationSkills, setOrganizationSkills] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchSkills();
  }, [token]);

  const fetchSkills = async () => {
    try {
      setSkillsLoading(true);
      const response = await getOrganizationSkills();
      setAvailableSkills(response.data.skills || []);
      setGlobalSkills(response.data.global_skills || []);
      setOrganizationSkills(response.data.organization_skills || []);
    } catch (error) {
      console.error("Error fetching skills:", error);
    } finally {
      setSkillsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSkillToggle = (skillId) => {
    const updatedSkills = form.skills.includes(skillId)
      ? form.skills.filter(id => id !== skillId)
      : [...form.skills, skillId];
    setForm({ ...form, skills: updatedSkills });
  };

  // Task management functions
  const handleTaskChange = (index, field, value) => {
    const updatedTasks = [...form.tasks];
    updatedTasks[index][field] = value;
    setForm({ ...form, tasks: updatedTasks });
  };

  const addTask = () => {
    setForm({
      ...form,
      tasks: [...form.tasks, { title: "", description: "", start_date: "", end_date: "" }],
    });
  };

  const removeTask = (index) => {
    const updatedTasks = [...form.tasks];
    updatedTasks.splice(index, 1);
    setForm({ ...form, tasks: updatedTasks });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Basic validation
    if (!form.title || !form.description || !form.location || !form.start_date || !form.volunteers_needed) {
      setError("Please fill in all required fields.");
      return;
    }

    // Validate tasks
    const validTasks = form.tasks.filter(task => task.title.trim() && task.description.trim());
    if (validTasks.some(task => !task.start_date || !task.end_date)) {
      setError("Please fill in start and end dates for all tasks.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...form,
        skills: form.skills, // Send skills as array of IDs
        tasks: validTasks, // Only include valid tasks
      };

      await createOpportunity(payload);

      setSuccess(true);
      setForm({
        title: "",
        description: "",
        location: "",
        start_date: "",
        end_date: "",
        volunteers_needed: "",
        skills: [],
        tasks: [{ title: "", description: "", start_date: "", end_date: "" }],
      });
      setTimeout(() => {
        router.push("/organization/opportunities");
      }, 1200);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to create opportunity. Please check your input and try again."
      );
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-blue-700">
              Post a New Opportunity
            </h1>
            <p className="text-sm text-blue-900">
              Fill out the details below to post a new volunteer opportunity.
            </p>
          </div>
          <a
            href="/organization/skills"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
          >
            <span>📚</span>
            Manage Skills
          </a>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            Opportunity created successfully! Redirecting...
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow border border-blue-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <FormField
              label="Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />

            {/* Description */}
            <FormField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              isTextArea
              required
            />

            {/* Location */}
            <FormField
              label="Location"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="E.g., Mzuzu, Malawi"
              required
            />

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Start Date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                type="date"
                required
              />
              <FormField
                label="End Date (Optional)"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                type="date"
              />
            </div>

            {/* Volunteers Needed */}
            <FormField
              label="Volunteers Needed"
              name="volunteers_needed"
              value={form.volunteers_needed}
              onChange={handleChange}
              type="number"
              min="1"
              required
            />

            {/* Required Skills */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-blue-900 font-medium">
                  Required Skills
                </label>
                <a
                  href="/organization/skills"
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  + Add Custom Skills
                </a>
              </div>
              {skillsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Loading skills...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Organization Skills */}
                  {organizationSkills.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Your Custom Skills</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {organizationSkills.map((skill) => (
                          <label key={skill.id} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={form.skills.includes(skill.id)}
                              onChange={() => handleSkillToggle(skill.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900">{skill.name}</span>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <span className="capitalize">{skill.category}</span>
                                {skill.required_proficiency_level && (
                                  <span className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                                    {skill.required_proficiency_level}
                                  </span>
                                )}
                                <span className="bg-purple-100 text-purple-800 px-1 py-0.5 rounded">Custom</span>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Global Skills */}
                  {globalSkills.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Global Skills</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {globalSkills.map((skill) => (
                          <label key={skill.id} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={form.skills.includes(skill.id)}
                              onChange={() => handleSkillToggle(skill.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900">{skill.name}</span>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <span className="capitalize">{skill.category}</span>
                                <span className="bg-green-100 text-green-800 px-1 py-0.5 rounded">Global</span>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {form.skills.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>{form.skills.length}</strong> skill{form.skills.length !== 1 ? 's' : ''} selected
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tasks Section */}
            <div>
              <label className="block text-blue-900 font-medium mb-3">
                Tasks (Optional)
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Create specific tasks that volunteers will work on for this opportunity.
              </p>

              {form.tasks.map((task, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-800">Task #{index + 1}</h4>
                    {form.tasks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTask(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove Task
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Task Title
                      </label>
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) => handleTaskChange(index, 'title', e.target.value)}
                        placeholder="Enter task title"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:outline-none text-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Task Description
                      </label>
                      <textarea
                        value={task.description}
                        onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                        placeholder="Describe what volunteers will do"
                        rows="2"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:outline-none text-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Task Start Date
                      </label>
                      <input
                        type="date"
                        value={task.start_date}
                        onChange={(e) => handleTaskChange(index, 'start_date', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:outline-none text-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Task End Date
                      </label>
                      <input
                        type="date"
                        value={task.end_date}
                        onChange={(e) => handleTaskChange(index, 'end_date', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:outline-none text-black"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addTask}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                + Add Another Task
              </button>
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Creating..." : "Create Opportunity"}
              </button>
            </div>
          </form>
        </div>
    </div>
  );
}

// Reusable Form Input Component
function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  isTextArea = false,
  min,
  required,
}) {
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (e) => {
    setIsDirty(true);
    onChange(e);
  };

  return (
    <div>
      <label htmlFor={name} className="block text-blue-900 font-medium mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {isTextArea ? (
        <textarea
          id={name}
          name={name}
          rows={4}
          value={value}
          onChange={handleChange}
          className={`w-full border border-blue-300 rounded px-3 py-2 resize-none focus:ring-blue-500 focus:outline-none transition-colors text-black ${
            isDirty ? "bg-blue-50" : "bg-white"
          }`}
          required={required}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          min={min}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full border border-blue-300 rounded px-3 py-2 focus:ring-blue-500 focus:outline-none transition-colors text-black ${
            isDirty ? "bg-blue-50" : "bg-white"
          }`}
          required={required}
        />
      )}
    </div>
  );
}