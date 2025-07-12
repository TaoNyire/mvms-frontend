import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useProfileCompletion } from '../hooks/useProfileCompletion';
import ProfileCompletionGuide from './ProfileCompletionGuide';
import ProfileErrorBoundary from './ProfileErrorBoundary';

export default function AppWrapper({ children }) {
  const { user } = useAuth();
  const {
    showGuide,
    profileRequirements,
    closeGuide
  } = useProfileCompletion();

  return (
    <ProfileErrorBoundary>
      {children}
      {showGuide && user && (
        <ProfileCompletionGuide
          user={user}
          requirements={profileRequirements}
          onClose={closeGuide}
        />
      )}
    </ProfileErrorBoundary>
  );
}
