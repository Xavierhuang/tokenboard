import React, { useEffect } from 'react';
import { SecuritizeAPI } from '@/lib/api/securitize';
import SecuritizeIcon from './SecuritizeIcon';

interface SecuritizeAuthProps {
  onAuthSuccess: (data: any) => void;
  onAuthError: (error: string) => void;
  variant?: 'dark' | 'light';
  text?: string;
  className?: string;
}

export default function SecuritizeAuth({
  onAuthSuccess,
  onAuthError,
  variant = 'dark',
  text = 'Log in with Securitize iD',
  className = '',
}: SecuritizeAuthProps) {
  useEffect(() => {
    // This effect handles the redirect from Securitize after authentication
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        try {
          const response = await fetch('/api/auth/securitize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to exchange code for token');
          }

          const data = await response.json();
          onAuthSuccess(data);
        } catch (error) {
          onAuthError(error instanceof Error ? error.message : String(error));
        } finally {
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    handleAuthCallback();
  }, [onAuthSuccess, onAuthError]);

  const handleLogin = () => {
    // Initiate the OAuth flow by redirecting to Securitize
    const securitizeAPI = new SecuritizeAPI(
      process.env.NEXT_PUBLIC_SECURITIZE_ISSUER_ID || '',
      '', // Secret is not needed on client-side
      process.env.NEXT_PUBLIC_SECURITIZE_REDIRECT_URL || '',
      'sandbox'
    );
    const authUrl = securitizeAPI.getAuthorizationUrl('info details verification');
    window.location.href = authUrl;
  };

  const baseClasses = 'flex items-center justify-center w-full px-6 py-3 font-semibold rounded-lg text-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    dark: 'bg-[#00838F] text-white hover:bg-[#006064] focus:ring-[#00838F]',
    light: 'bg-white text-[#00838F] border-2 border-gray-200 hover:bg-gray-50 focus:ring-[#00838F] shadow-sm',
  };

  return (
    <button onClick={handleLogin} className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <SecuritizeIcon className="w-7 h-7 mr-4" />
      <span>{text}</span>
    </button>
  );
} 