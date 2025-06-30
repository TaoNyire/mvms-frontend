// pages/organization/messages/index.js
import React, { useEffect, useState } from "react";
import OrgLayout from "../../../components/OrgLayout";

export default function OrgMessages() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "Admin",
      subject: "System Update",
      body: "There will be scheduled maintenance on May 10, 2025.",
      timestamp: "2025-04-08T10:00:00Z",
      isRead: false
    },
    {
      id: 2,
      sender: "Volunteer - John Doe",
      subject: "Application Follow-up",
      body: "Hi, just wanted to know if my application was reviewed.",
      timestamp: "2025-04-07T14:30:00Z",
      isRead: true
    }
  ]);

  return (
    <OrgLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>

        {/* Messages List */}
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`bg-white p-4 rounded-lg shadow-md border-l-4 ${
              msg.isRead ? "border-gray-300" : "border-indigo-500 bg-blue-50"
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{msg.sender}</h3>
                  <p className="text-sm text-gray-600 mt-1">{msg.subject}</p>
                  <p className="mt-2 text-sm">{msg.body.substring(0, 100)}...</p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(msg.timestamp).toLocaleDateString()}
                </span>
              </div>
              <a href={`/organization/messages/${msg.id}`} className="text-indigo-600 text-sm hover:underline mt-4 inline-block">
                Read More →
              </a>
            </div>
          ))}
        </div>
      </div>
    </OrgLayout>
  );
}