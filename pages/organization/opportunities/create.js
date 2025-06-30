import React, { useState } from "react";
import OrgLayout from "../../../components/OrgLayout";

export default function CreateOpportunity() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    start_date: "",
    end_date: "",
    volunteers_needed: "",
    required_skills: [""], // Start with one empty input
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSkillChange = (index, e) => {
    const updatedSkills = [...form.required_skills];
    updatedSkills[index] = e.target.value;
    setForm({ ...form, required_skills: updatedSkills });
  };

  const addSkillInput = () => {
    setForm({
      ...form,
      required_skills: [...form.required_skills, ""],
    });
  };

  const removeSkillInput = (index) => {
    const updatedSkills = [...form.required_skills];
    updatedSkills.splice(index, 1);
    setForm({ ...form, required_skills: updatedSkills });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Replace with real API call later
      console.log("Submitting:", form);
      alert("Opportunity created successfully!");
    } catch (err) {
      setError(err.message || "Failed to create opportunity");
    }

    setLoading(false);
  };

  return (
    <OrgLayout>
      <div className="p-6 max-w-4xl mx-auto w-full bg-gradient-to-r from-blue-50 to-blue-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-2 text-blue-700">
          Post a New Opportunity
        </h1>
        <p className="text-sm text-blue-900 mb-6">
          Fill out the details below to post a new volunteer opportunity.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
        )}

        <div className="bg-white p-6 rounded-lg shadow border border-blue-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <FormField
              label="Title"
              name="title"
              value={form.title}
              onChange={handleChange}
            />

            {/* Description */}
            <FormField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              isTextArea
            />

            {/* Location */}
            <FormField
              label="Location"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="E.g., Mzuzu, Malawi"
            />

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Start Date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                type="date"
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
            />

            {/* Required Skills */}
            <div>
              <label className="block text-blue-900 font-medium mb-1">
                Required Skills
              </label>
              {form.required_skills.map((skill, index) => (
                <div key={index} className="flex items-center mb-2 space-x-2">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => handleSkillChange(index, e)}
                    placeholder={`Skill #${index + 1}`}
                    className="w-full border border-blue-300 rounded px-3 py-2 focus:ring-blue-500 focus:outline-none text-black transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => removeSkillInput(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSkillInput}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Another Skill
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
    </OrgLayout>
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
        />
      )}
    </div>
  );
}