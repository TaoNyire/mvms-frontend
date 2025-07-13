import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

export function useProfileCompletion() {
  const { user, token, checkProfileCompletion, profileComplete, profileRequirements } = useAuth();
  const [showGuide, setShowGuide] = useState(false);
  const [checking, setChecking] = useState(false);
  const router = useRouter();

  // Routes that don't require profile completion
  const exemptRoutes = [
    '/volunteer/profile',
    '/organization/profile',
    '/profile',
    '/login',
    '/register',
    '/logout',
    '/',
  ];

  // Check if current route requires profile completion
  const requiresProfileCompletion = () => {
    const currentPath = router.pathname;
    
    // Check if current route is exempt
    if (exemptRoutes.some(route => currentPath.startsWith(route))) {
      return false;
    }

    // Check if it's a protected route that requires profile completion
    if (currentPath.startsWith('/volunteer/') || currentPath.startsWith('/organization/')) {
      return true;
    }

    return false;
  };

  // Check profile completion when user or route changes
  useEffect(() => {
    const checkAndRedirect = async () => {
      if (!user || !token || checking) return;

      // Only check if we're on a route that requires profile completion
      if (!requiresProfileCompletion()) {
        return;
      }

      setChecking(true);

      try {
        const isComplete = await checkProfileCompletion();
        
        if (!isComplete) {
          // Show the guide instead of redirecting immediately
          setShowGuide(true);
        } else {
          setShowGuide(false);
        }
      } catch (error) {
        console.error('Error checking profile completion:', error);
      } finally {
        setChecking(false);
      }
    };

    checkAndRedirect();
  }, [user, token, router.pathname]);

  // Handle API errors that indicate profile incompletion
  const handleApiError = (error) => {
    if (error.response?.status === 422 && error.response?.data?.error === 'PROFILE_INCOMPLETE') {
      // Only show guide if we're on a route that requires profile completion
      if (requiresProfileCompletion()) {
        setShowGuide(true);
      }
      return true; // Indicates this was a profile completion error
    }
    return false;
  };

  // Redirect to profile page
  const redirectToProfile = () => {
    const profileUrl = user?.role === 'volunteer' ? '/volunteer/profile' : '/organization/profile';
    router.push(profileUrl);
    setShowGuide(false);
  };

  // Close the guide (allow user to continue with limited access)
  const closeGuide = () => {
    setShowGuide(false);
  };

  return {
    showGuide,
    profileComplete,
    profileRequirements,
    checking,
    handleApiError,
    redirectToProfile,
    closeGuide,
    requiresProfileCompletion: requiresProfileCompletion(),
  };
}
