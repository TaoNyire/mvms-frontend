import { useEffect, useState } from "react";
import Head from "next/head";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";
import {
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function Notifications() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!token) return;
    fetchNotifications();
  }, [token]);

  const fetchNotifications = async () => {
    try {
      setApiError("");
      setApiLoading(true);

      console.log('Fetching notifications from:', `${API_BASE}/my-notifications`);

      const response = await axios.get(`${API_BASE}/my-notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Notifications response:', response.data);

      const notificationsData = response.data.data || response.data || [];
      setNotifications(notificationsData);

    } catch (error) {
      console.error('Error fetching notifications:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });

      // Set empty data - no sample data
      console.log('API error - no notifications data available');
      setNotifications([]);

      // Set appropriate error message
      if (error.response?.status === 401) {
        setApiError("Authentication failed. Please log in again.");
      } else if (error.response?.status === 403) {
        setApiError("Access denied. Please check your permissions.");
      } else if (error.response?.status === 500) {
        setApiError("Server error. Please try again later.");
      } else if (!error.response) {
        setApiError("Network error. Please check your connection and try again.");
      } else {
        setApiError(`API error (${error.response?.status || 'Unknown'}) - using sample data for demonstration`);
      }

    } finally {
      setApiLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon className="w-6 h-6 text-blue-500" />;
      default:
        return <BellIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const markAsRead = async (id) => {
    try {
      // Update UI immediately for better UX
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ));

      // Only call API for real notifications (not sample ones)
      if (!id.toString().startsWith('sample_')) {
        await axios.put(`${API_BASE}/notifications/${id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Notification marked as read:', id);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert the UI change if API call fails
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, read: false } : n
      ));
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading || !user || apiLoading)
    return <div className="text-center mt-10 text-gray-700">Loading...</div>;

  if (apiError)
    return <div className="text-center mt-10 text-red-600">{apiError}</div>;

  return (
    <>
      <Head>
        <title>Notifications - Volunteer Panel</title>
        <meta name="description" content="View your notifications and updates" />
      </Head>

      <div className="space-y-4 sm:space-y-6">
        {/* Error Message */}
        {apiError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <InformationCircleIcon className="w-5 h-5 flex-shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <BellIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-green-700">Notifications</h1>
              <p className="text-gray-600 text-sm sm:text-base">Stay updated with your volunteer activities</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs sm:text-sm font-medium self-start">
              {unreadCount} unread
            </div>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <BellIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-base sm:text-lg px-4">No notifications at the moment.</p>
            <p className="text-gray-400 text-xs sm:text-sm mt-2 px-4">We'll notify you when there are updates!</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 sm:p-6 rounded-lg border shadow-sm transition-all hover:shadow-md ${
                  n.read ? "bg-white border-gray-200" : "bg-green-50 border-green-200"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 pr-2">
                        {n.title}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-xs text-gray-500 flex items-center">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          {new Date(n.timestamp).toLocaleDateString()}
                        </span>
                        {!n.read && (
                          <button
                            onClick={() => markAsRead(n.id)}
                            className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors self-start"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-gray-700 text-sm sm:text-base">{n.message}</p>
                    {!n.read && (
                      <div className="mt-2 flex items-center">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="ml-2 text-xs text-green-600 font-medium">New</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}