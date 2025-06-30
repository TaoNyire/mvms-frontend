// pages/organization/settings/index.js
import React, { useState } from "react";
import OrgLayout from "../../../components/OrgLayout";

export default function OrgSettings() {
  const [form, setForm] = useState({
    receiveEmails: true,
    receiveNotifications: true,
    theme: "light"
  });

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setForm({
      ...form,
      [name]: value || checked
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Settings updated successfully");
  };

  return (
    <OrgLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
          {/* Notification Preferences */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
            <label className="flex items-center space-x-2 mb-3">
              <input
                type="checkbox"
                name="receiveEmails"
                checked={form.receiveEmails}
                onChange={handleChange}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Receive emails about new opportunities</span>
            </label>
            <label className="flex items-center space-x-2 mb-3">
              <input
                type="checkbox"
                name="receiveNotifications"
                checked={form.receiveNotifications}
                onChange={handleChange}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Show desktop notifications</span>
            </label>
          </section>

          {/* Theme Preference */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Theme</h2>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={form.theme === "light"}
                  onChange={handleChange}
                  className="text-indigo-600"
                />
                <span>Light Mode</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={form.theme === "dark"}
                  onChange={handleChange}
                  className="text-indigo-600"
                />
                <span>Dark Mode</span>
              </label>
            </div>
          </section>

          {/* Save Button */}
          <div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </OrgLayout>
  );
}