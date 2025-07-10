import React, { useState } from "react";
import Head from "next/head";

export default function VolunteerSettings() {
  const [form, setForm] = useState({
    receiveEmails: true,
    receiveNotifications: true,
    emailFrequency: "daily",
    theme: "light"
  });

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setForm({
      ...form,
      [name]: e.target.type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Settings updated successfully");
  };

  return (
    <>
      <Head>
        <title>Volunteer Settings - MVMS</title>
        <meta name="description" content="Manage your volunteer account settings and preferences" />
      </Head>
      
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-green-700">Settings</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
          {/* Notification Preferences */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Notification Preferences</h2>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="receiveEmails"
                  checked={form.receiveEmails}
                  onChange={handleChange}
                  className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="text-gray-700">Receive email notifications</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="receiveNotifications"
                  checked={form.receiveNotifications}
                  onChange={handleChange}
                  className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="text-gray-700">Receive push notifications</span>
              </label>
            </div>
          </div>

          {/* Email Frequency */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Email Frequency</h2>
            <select
              name="emailFrequency"
              value={form.emailFrequency}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="immediate">Immediate</option>
              <option value="daily">Daily digest</option>
              <option value="weekly">Weekly digest</option>
              <option value="never">Never</option>
            </select>
          </div>

          {/* Theme Preference */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Theme Preference</h2>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={form.theme === "light"}
                  onChange={handleChange}
                  className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <span className="text-gray-700">Light theme</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={form.theme === "dark"}
                  onChange={handleChange}
                  className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <span className="text-gray-700">Dark theme</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="theme"
                  value="auto"
                  checked={form.theme === "auto"}
                  onChange={handleChange}
                  className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <span className="text-gray-700">Auto (system preference)</span>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
