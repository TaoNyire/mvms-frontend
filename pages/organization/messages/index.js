import React, { useEffect, useState } from "react";
import Head from "next/head";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/router";
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  UserIcon,
  ClockIcon,
  CheckIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function OrganizationMessages() {
  const { token, user } = useAuth();
  const router = useRouter();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [apiError, setApiError] = useState("");
  const [contacts, setContacts] = useState([]);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [activeView, setActiveView] = useState('messages'); // 'messages' or 'announcements'
  const [announcements, setAnnouncements] = useState([]);

  // Fetch conversations
  useEffect(() => {
    if (!token) {
      setApiError("No authentication token found. Please log in.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setApiError("");

    console.log("Debug: Starting to fetch data");
    console.log("Debug: Token:", token ? "Present" : "Missing");
    console.log("Debug: User:", user);
    console.log("Debug: API_BASE:", API_BASE);

    // Test authentication first
    axios.get(`${API_BASE}/test-auth`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((authRes) => {
      console.log("Debug: Auth test successful:", authRes.data);

      // Now fetch the actual data using alternative endpoints
      return Promise.all([
        axios.get(`${API_BASE}/messages-alt/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/messages-alt/contacts`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);
    })
    .then(([conversationsRes, contactsRes]) => {
      console.log("Debug: Conversations response:", conversationsRes.data);
      console.log("Debug: Contacts response:", contactsRes.data);

      setConversations(conversationsRes.data.conversations || []);
      setContacts(contactsRes.data.contacts || []);

      if (conversationsRes.data.conversations && conversationsRes.data.conversations.length > 0) {
        setSelectedConversation(conversationsRes.data.conversations[0]);
      }
    })
    .catch((error) => {
      console.error("Debug: Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: error.config
      });
      setApiError(`Failed to load data: ${error.response?.data?.message || error.message} (Status: ${error.response?.status})`);
    })
    .finally(() => setLoading(false));
  }, [token, user]);

  // Start new conversation
  const startNewConversation = (contact) => {
    const newConversation = {
      partner: {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        volunteerProfile: contact.volunteerProfile,
        organizationProfile: contact.organizationProfile,
      },
      last_message: null,
      unread_count: 0,
    };

    setSelectedConversation(newConversation);
    setMessages([]);
    setShowNewMessage(false);
  };

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation || !token) return;

    axios
      .get(`${API_BASE}/messages/${selectedConversation.partner.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setMessages(res.data.data || []);
      })
      .catch((error) => {
        console.error("Messages error:", error);
        setApiError(`Failed to load messages: ${error.response?.data?.message || error.message}`);
      });
  }, [selectedConversation, token]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setSendingMessage(true);
    try {
      await axios.post(
        `${API_BASE}/messages-alt/send`,
        {
          receiver_id: selectedConversation.partner.id,
          message: newMessage,
          message_type: 'general'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNewMessage("");
      // Refresh messages
      const res = await axios.get(`${API_BASE}/messages-alt/${selectedConversation.partner.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data.data || []);
    } catch (err) {
      setApiError("Failed to send message.");
    }
    setSendingMessage(false);
  };

  // Announcement functions
  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(`${API_BASE}/announcements`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnnouncements(response.data.announcements || []);
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
      // Set sample announcements for demo
      setAnnouncements([
        {
          id: 1,
          title: "Welcome New Volunteers!",
          message: "We're excited to have new volunteers joining our community outreach program.",
          created_at: new Date().toISOString(),
          recipients_count: 15,
          opportunity: { title: "Community Outreach" }
        }
      ]);
    }
  };

  const sendAnnouncement = async (announcementData) => {
    try {
      await axios.post(`${API_BASE}/announcements`, announcementData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAnnouncements();
      alert('Announcement sent successfully!');
      setShowAnnouncementModal(false);
    } catch (error) {
      console.error("Failed to send announcement:", error);
      alert("Failed to send announcement. Please try again.");
    }
  };

  return (
    <>
      <Head>
        <title>Messages - Organization Dashboard</title>
        <meta name="description" content="Communicate with volunteers and manage conversations" />
      </Head>

      <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Communication Center</h1>
                  <p className="text-gray-600 mt-1">Manage messages and send announcements to volunteers</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAnnouncementModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Send Announcement
                  </button>
                  <button
                    onClick={() => setShowNewMessage(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <PlusIcon className="w-5 h-5" />
                    New Message
                  </button>
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200 w-fit">
                <button
                  onClick={() => setActiveView('messages')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeView === 'messages'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Messages
                </button>
                <button
                  onClick={() => setActiveView('announcements')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeView === 'announcements'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Announcements
                </button>
              </div>
            </div>

            {/* Content Area */}
            {activeView === 'messages' ? (
              /* Messages Interface */
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={{ height: '70vh' }}>
              <div className="flex h-full">
                {/* Conversations List */}
                <div className="w-1/3 border-r border-gray-200 flex flex-col">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
                      <span className="text-sm text-gray-500">
                        {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {loading ? (
                      <div className="p-4 text-center text-gray-500">
                        <ChatBubbleLeftRightIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        Loading conversations...
                      </div>
                    ) : apiError ? (
                      <div className="p-4 text-center text-red-600">
                        <div className="text-sm">{apiError}</div>
                      </div>
                    ) : conversations.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <div className="text-lg font-medium">No conversations yet</div>
                        <p className="text-sm mt-2">Start a conversation with a volunteer to begin messaging</p>
                      </div>
                    ) : (
                      conversations.map((conv) => (
                        <div
                          key={conv.partner.id}
                          onClick={() => setSelectedConversation(conv)}
                          className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedConversation?.partner.id === conv.partner.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <UserIcon className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium text-gray-900 truncate">{conv.partner.name}</h3>
                                {conv.unread_count > 0 && (
                                  <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                                    {conv.unread_count}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 truncate mt-1">
                                {conv.last_message?.message || 'No messages yet'}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <ClockIcon className="w-3 h-3 text-gray-400" />
                                <p className="text-xs text-gray-400">
                                  {conv.last_message?.created_at
                                    ? new Date(conv.last_message.created_at).toLocaleDateString()
                                    : 'No date'
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                ))
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{selectedConversation.partner.name}</h3>
                      <p className="text-sm text-gray-600">
                        {selectedConversation.partner.volunteerProfile ? 'Volunteer' : 'Organization'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium">No messages yet</p>
                        <p className="text-sm mt-2">Start the conversation by sending a message below</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === selectedConversation.partner.id ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-sm ${
                            message.sender_id === selectedConversation.partner.id
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-green-500 text-white'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <div className="flex items-center gap-1 mt-2">
                            <ClockIcon className={`w-3 h-3 ${
                              message.sender_id === selectedConversation.partner.id ? 'text-gray-400' : 'text-green-100'
                            }`} />
                            <p className={`text-xs ${
                              message.sender_id === selectedConversation.partner.id ? 'text-gray-500' : 'text-green-100'
                            }`}>
                              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {message.sender_id !== selectedConversation.partner.id && message.is_read && (
                              <CheckIcon className="w-3 h-3 text-green-100 ml-1" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                      disabled={sendingMessage}
                    />
                    <button
                      type="submit"
                      disabled={sendingMessage || !newMessage.trim()}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {sendingMessage ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <PaperAirplaneIcon className="w-4 h-4" />
                      )}
                      {sendingMessage ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
                  <p className="text-gray-500 mb-4">Choose a conversation from the list or start a new one</p>
                  <button
                    onClick={() => setShowNewMessage(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Start New Conversation
                  </button>
                </div>
              </div>
            )}
          </div>
              </div>
            </div>
            ) : (
              /* Announcements View */
              <AnnouncementsView
                announcements={announcements}
                onRefresh={fetchAnnouncements}
              />
            )}

            {/* Announcement Modal */}
            {showAnnouncementModal && (
              <AnnouncementModal
                onSend={sendAnnouncement}
                onClose={() => setShowAnnouncementModal(false)}
              />
            )}

            {/* New Message Modal */}
            {showNewMessage && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Start New Conversation</h3>

                  {/* Search Contacts */}
                  <div className="mb-4">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search volunteers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                      />
                    </div>
                  </div>

                  {/* Contacts List */}
                  <div className="max-h-60 overflow-y-auto mb-4">
                    {contacts
                      .filter(contact =>
                        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        contact.email.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((contact) => (
                        <div
                          key={contact.id}
                          onClick={() => startNewConversation(contact)}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                        >
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{contact.name}</h4>
                            <p className="text-sm text-gray-600">{contact.email}</p>
                          </div>
                        </div>
                      ))}

                    {contacts.filter(contact =>
                      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      contact.email.toLowerCase().includes(searchTerm.toLowerCase())
                    ).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <UserIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>No volunteers found</p>
                        <p className="text-sm mt-1">Try adjusting your search</p>
                      </div>
                    )}
                  </div>

                  {/* Modal Actions */}
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowNewMessage(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {apiError && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {apiError}
              </div>
            )}
      </div>
    </>
  );
}

// Component for announcements view
function AnnouncementsView({ announcements, onRefresh }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Announcements</h2>
          <button
            onClick={onRefresh}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-2">No announcements sent yet</div>
          <div className="text-sm text-gray-400">Send your first announcement to volunteers</div>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{announcement.title}</h3>
                  <p className="text-gray-700 mb-3">{announcement.message}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Sent: {formatDate(announcement.created_at)}</span>
                    <span>Recipients: {announcement.recipients_count || 0}</span>
                    {announcement.opportunity && (
                      <span>Opportunity: {announcement.opportunity.title}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Component for announcement modal
function AnnouncementModal({ onSend, onClose }) {
  const [title, setTitle] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [targetAudience, setTargetAudience] = React.useState('all');
  const [opportunityId, setOpportunityId] = React.useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    onSend({
      title: title.trim(),
      message: message.trim(),
      target_audience: targetAudience,
      opportunity_id: opportunityId || null
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Send Announcement</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Announcement title..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              rows="4"
              placeholder="Your announcement message..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="all">All Volunteers</option>
              <option value="active">Active Volunteers</option>
              <option value="opportunity">Specific Opportunity</option>
            </select>
          </div>

          {targetAudience === 'opportunity' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Opportunity</label>
              <select
                value={opportunityId}
                onChange={(e) => setOpportunityId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                required
              >
                <option value="">Choose opportunity...</option>
                {/* Opportunities would be loaded here */}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send Announcement
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}