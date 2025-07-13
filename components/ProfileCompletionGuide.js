import React from 'react';
import Link from 'next/link';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';

export default function ProfileCompletionGuide({ user, requirements, onClose }) {
  const getIcon = (category) => {
    switch (category) {
      case 'Personal Information':
        return <UserIcon className="w-5 h-5" />;
      case 'Emergency Contact':
        return <PhoneIcon className="w-5 h-5" />;
      case 'Documents':
        return <DocumentTextIcon className="w-5 h-5" />;
      case 'Organization Details':
        return <BuildingOfficeIcon className="w-5 h-5" />;
      case 'Contact Information':
        return <MapPinIcon className="w-5 h-5" />;
      default:
        return <IdentificationIcon className="w-5 h-5" />;
    }
  };

  const getProfileUrl = () => {
    return user?.role === 'volunteer' ? '/volunteer/profile' : '/organization/profile';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Complete Your Profile
              </h2>
              <p className="text-gray-600">
                Please complete your profile to access all features
              </p>
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-4 mb-6">
            <p className="text-gray-700">
              To ensure the best experience and maintain security, please complete the following required information:
            </p>

            {requirements && Object.entries(requirements).map(([category, items]) => (
              <div key={category} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  {getIcon(category)}
                  <h3 className="font-medium text-gray-900">{category}</h3>
                </div>
                <ul className="space-y-2">
                  {items.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Special CV Notice for Volunteers */}
          {user?.role === 'volunteer' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <DocumentTextIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">CV Upload Required</h4>
                  <p className="text-sm text-blue-800">
                    You must upload your CV before you can apply for opportunities. This helps organizations 
                    understand your background and match you with suitable volunteer positions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Benefits */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-green-900 mb-2">Why complete your profile?</h4>
            <ul className="space-y-1 text-sm text-green-800">
              {user?.role === 'volunteer' ? (
                <>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4" />
                    Apply for volunteer opportunities
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4" />
                    Get matched with opportunities that fit your skills
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4" />
                    Connect with other volunteers and organizations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4" />
                    Track your volunteer activities and impact
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4" />
                    Create and manage volunteer opportunities
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4" />
                    Review and manage volunteer applications
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4" />
                    Access detailed reports and analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4" />
                    Connect with volunteers and other organizations
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              href={getProfileUrl()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center"
            >
              Complete Profile Now
            </Link>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Later
              </button>
            )}
          </div>

          {/* Note */}
          <p className="text-xs text-gray-500 mt-4 text-center">
            You can access your profile settings at any time from the navigation menu.
          </p>
        </div>
      </div>
    </div>
  );
}
