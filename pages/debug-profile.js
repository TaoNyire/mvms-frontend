import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function DebugProfile() {
  const { user, token } = useAuth();
  const [profileStatus, setProfileStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    const fetchProfileStatus = async () => {
      try {
        const response = await axios.get(`${API_BASE}/debug-profile-status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfileStatus(response.data);
      } catch (err) {
        setError(err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileStatus();
  }, [token]);

  if (!user) {
    return <div className="p-8">Please log in to view profile status.</div>;
  }

  if (loading) {
    return <div className="p-8">Loading profile status...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <pre className="bg-red-100 p-4 rounded">{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Profile Debug Information</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Profile Status</h2>
          <div className="space-y-2">
            <p><strong>User ID:</strong> {profileStatus?.user_id}</p>
            <p><strong>Name:</strong> {profileStatus?.user_name}</p>
            <p><strong>Role:</strong> {profileStatus?.role}</p>
            <p><strong>Profile Exists:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                profileStatus?.profile_exists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {profileStatus?.profile_exists ? 'Yes' : 'No'}
              </span>
            </p>
            <p><strong>Is Complete:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                profileStatus?.is_complete ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {profileStatus?.is_complete ? 'Yes' : 'No'}
              </span>
            </p>
          </div>
        </div>

        {/* Missing Fields */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Missing Fields</h2>
          {profileStatus?.missing_fields?.length > 0 ? (
            <ul className="space-y-1">
              {profileStatus.missing_fields.map((field, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">{field}</code>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-green-600">No missing fields!</p>
          )}
        </div>
      </div>

      {/* Profile Data */}
      {profileStatus?.profile_data && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Current Profile Data</h2>
          <div className="bg-gray-50 p-4 rounded overflow-x-auto">
            <pre className="text-sm">{JSON.stringify(profileStatus.profile_data, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh Status
        </button>
        
        {profileStatus?.role === 'volunteer' && (
          <a
            href="/volunteer/profile"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Go to Profile
          </a>
        )}
        
        {profileStatus?.role === 'organization' && (
          <a
            href="/organization/profile"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Go to Profile
          </a>
        )}
      </div>
    </div>
  );
}
