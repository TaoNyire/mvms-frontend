import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function VolunteerMessages() {
  const { user, token } = useAuth();

  const [volunteers, setVolunteers] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    fetchVolunteers();
  }, [token]);

  useEffect(() => {
    if (selectedVolunteer) {
      fetchConversation(selectedVolunteer.id);
    }
  }, [selectedVolunteer]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/volunteer/messages/volunteers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVolunteers(response.data.volunteers || []);
    } catch (error) {
      console.error('Error fetching volunteers:', error);
      setError('Failed to load volunteers');
    } finally {
      setLoading(false);
    }
  };

  const fetchConversation = async (volunteerId) => {
    try {
      const response = await axios.get(`${API_BASE}/volunteer/messages/conversation/${volunteerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      setError('Failed to load conversation');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedVolunteer) return;

    try {
      setSendingMessage(true);
      const response = await axios.post(`${API_BASE}/volunteer/messages/send`, {
        receiver_id: selectedVolunteer.id,
        message: newMessage.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Add the new message to the conversation
      setMessages(prev => [...prev, response.data.data]);
      setNewMessage('');

      // Update the volunteer list to reflect the new last message
      fetchVolunteers();
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Messages - Volunteer Chat | MVMS</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600">Chat with fellow volunteers</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex">
            {/* Volunteers List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Volunteers</h2>
                <p className="text-sm text-gray-600">{volunteers.length} volunteers available</p>
              </div>

              <div className="flex-1 overflow-y-auto">
                {volunteers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <p>No other volunteers found</p>
                  </div>
                ) : (
                  volunteers.map((volunteer) => (
                    <div
                      key={volunteer.id}
                      onClick={() => setSelectedVolunteer(volunteer)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedVolunteer?.id === volunteer.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {volunteer.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3 flex-1">
                              <p className="text-sm font-medium text-gray-900">{volunteer.name}</p>
                              {volunteer.location && (
                                <p className="text-xs text-gray-500">{volunteer.location}</p>
                              )}
                            </div>
                          </div>
                          {volunteer.last_message && (
                            <div className="mt-2 ml-13">
                              <p className="text-xs text-gray-600 truncate">
                                {volunteer.last_message.is_from_me ? 'You: ' : ''}
                                {volunteer.last_message.message}
                              </p>
                              <p className="text-xs text-gray-400">
                                {formatTime(volunteer.last_message.sent_at)}
                              </p>
                            </div>
                          )}
                        </div>
                        {volunteer.unread_count > 0 && (
                          <div className="ml-2">
                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                              {volunteer.unread_count}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedVolunteer ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {selectedVolunteer.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{selectedVolunteer.name}</p>
                        <p className="text-xs text-gray-500">Volunteer since {selectedVolunteer.joined_date}</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 mt-8">
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.is_from_me ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.is_from_me
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                            <p className={`text-xs mt-1 ${
                              message.is_from_me ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatTime(message.sent_at)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <form onSubmit={sendMessage} className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={sendingMessage}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sendingMessage}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingMessage ? 'Sending...' : 'Send'}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl mb-4">💬</div>
                    <p className="text-lg font-medium">Select a volunteer to start chatting</p>
                    <p className="text-sm">Choose from the list on the left to begin a conversation</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
