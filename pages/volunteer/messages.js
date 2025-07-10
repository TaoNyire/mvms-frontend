import React, { useEffect, useState } from "react";
import Head from "next/head";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
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

export default function VolunteerMessages() {
  const { token } = useAuth();

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

  // Fetch conversations and contacts
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setApiError("");

    Promise.all([
      axios.get(`${API_BASE}/messages-alt/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${API_BASE}/messages-alt/contacts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    ])
      .then(([conversationsRes, contactsRes]) => {
        setConversations(conversationsRes.data.conversations || []);
        setContacts(contactsRes.data.contacts || []);

        if (conversationsRes.data.conversations && conversationsRes.data.conversations.length > 0) {
          setSelectedConversation(conversationsRes.data.conversations[0]);
        }
      })
      .catch((error) => {
        console.error("Error loading data:", error);
        setApiError(`Failed to load data: ${error.response?.data?.message || error.message}`);
      })
      .finally(() => setLoading(false));
  }, [token]);

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
      .catch(() => setApiError("Failed to load messages."));
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

  return (
    <>
      <Head>
        <title>Messages - Volunteer Dashboard</title>
        <meta name="description" content="Communicate with organizations and manage conversations" />
      </Head>

      <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-600 mt-1">Communicate with organizations and manage conversations</p>
              </div>
              <button
                onClick={() => setShowNewMessage(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                New Message
              </button>
            </div>

            {/* Messages Interface */}
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
                        <p className="text-sm mt-2">Start a conversation with an organization to begin messaging</p>
                      </div>
                    ) : (
                      conversations.map((conv) => (
                        <div
                          key={conv.partner.id}
                          onClick={() => setSelectedConversation(conv)}
                          className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedConversation?.partner.id === conv.partner.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <UserIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium text-gray-900 truncate">{conv.partner.name}</h3>
                                {conv.unread_count > 0 && (
                                  <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 ml-2">
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
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{selectedConversation.partner.name}</h3>
                            <p className="text-sm text-gray-600">
                              {selectedConversation.partner.organizationProfile ? 'Organization' : 'Volunteer'}
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
                                    : 'bg-blue-500 text-white'
                                }`}
                              >
                                <p className="text-sm">{message.message}</p>
                                <div className="flex items-center gap-1 mt-2">
                                  <ClockIcon className={`w-3 h-3 ${
                                    message.sender_id === selectedConversation.partner.id ? 'text-gray-400' : 'text-blue-100'
                                  }`} />
                                  <p className={`text-xs ${
                                    message.sender_id === selectedConversation.partner.id ? 'text-gray-500' : 'text-blue-100'
                                  }`}>
                                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                  {message.sender_id !== selectedConversation.partner.id && message.is_read && (
                                    <CheckIcon className="w-3 h-3 text-blue-100 ml-1" />
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
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={sendingMessage}
                          />
                          <button
                            type="submit"
                            disabled={sendingMessage || !newMessage.trim()}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Start New Conversation
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

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
                        placeholder="Search organizations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-blue-600" />
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
                        <p>No organizations found</p>
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
