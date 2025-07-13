import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function DebugTasks() {
  const { user, token } = useAuth();
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      console.log('Testing API with token:', token ? 'Token exists' : 'No token');
      console.log('API_BASE:', API_BASE);
      console.log('User:', user);

      // Test 1: Health check
      console.log('1. Testing health check...');
      const healthResponse = await axios.get(`${API_BASE}/test-messages`);
      console.log('Health check response:', healthResponse.data);

      // Test 2: Auth check
      console.log('2. Testing auth...');
      const authResponse = await axios.get(`${API_BASE}/test-auth`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Auth test response:', authResponse.data);

      // Test 3: My tasks
      console.log('3. Testing my tasks...');
      const tasksResponse = await axios.get(`${API_BASE}/my-tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Tasks response:', tasksResponse.data);

      setResponse({
        health: healthResponse.data,
        auth: authResponse.data,
        tasks: tasksResponse.data
      });

    } catch (err) {
      console.error('API test error:', err);
      setError({
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">API Debug Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current State</h2>
          <div className="space-y-2">
            <p><strong>User:</strong> {user ? user.name : 'Not logged in'}</p>
            <p><strong>Email:</strong> {user ? user.email : 'N/A'}</p>
            <p><strong>Token:</strong> {token ? 'Present' : 'Missing'}</p>
            <p><strong>API Base:</strong> {API_BASE}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API Test</h2>
          <button
            onClick={testAPI}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test API Endpoints'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-red-800 mb-4">Error</h2>
            <pre className="text-sm text-red-600 whitespace-pre-wrap">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}

        {response && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-800 mb-4">Success Response</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-green-700">Health Check:</h3>
                <pre className="text-sm text-green-600 whitespace-pre-wrap">
                  {JSON.stringify(response.health, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="font-semibold text-green-700">Auth Test:</h3>
                <pre className="text-sm text-green-600 whitespace-pre-wrap">
                  {JSON.stringify(response.auth, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="font-semibold text-green-700">My Tasks:</h3>
                <pre className="text-sm text-green-600 whitespace-pre-wrap">
                  {JSON.stringify(response.tasks, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Instructions</h2>
          <div className="text-blue-700 space-y-2">
            <p>1. Make sure you're logged in as a volunteer</p>
            <p>2. Click "Test API Endpoints" to check connectivity</p>
            <p>3. Check the browser console for detailed logs</p>
            <p>4. If successful, the tasks should show in the response</p>
            <p>5. Test credentials: volunteer@test.com / password</p>
          </div>
        </div>
      </div>
    </div>
  );
}
