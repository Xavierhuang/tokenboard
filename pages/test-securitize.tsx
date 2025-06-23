import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import SecuritizeAuth from '@/components/SecuritizeAuth';
import InvestorDashboard from '@/components/InvestorDashboard';

export default function TestSecuritize() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [investorId, setInvestorId] = useState<string | null>(null);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    // Check if user is already authenticated
    const token = sessionStorage.getItem('accessToken');
    const investor = sessionStorage.getItem('investorId');
    
    if (token && investor) {
      setAccessToken(token);
      setInvestorId(investor);
      setIsAuthenticated(true);
    }

    // Fetch Securitize configuration
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/securitize/config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
    }
  };

  const handleAuthSuccess = (data: any) => {
    console.log('Authentication successful:', data);
    
    // Store tokens securely
    if (data.accessToken) {
      sessionStorage.setItem('accessToken', data.accessToken);
      setAccessToken(data.accessToken);
    }
    
    if (data.refreshToken) {
      sessionStorage.setItem('refreshToken', data.refreshToken);
    }
    
    if (data.investorId) {
      sessionStorage.setItem('investorId', data.investorId);
      setInvestorId(data.investorId);
    }
    
    setIsAuthenticated(true);
  };

  const handleAuthError = (error: string) => {
    console.error('Authentication failed:', error);
    alert(`Authentication failed: ${error}`);
  };

  const handleLogout = () => {
    // Clear stored tokens
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('investorId');
    
    // Reset state
    setAccessToken(null);
    setInvestorId(null);
    setIsAuthenticated(false);
  };

  const testAPIEndpoints = async () => {
    if (!accessToken || !investorId) {
      alert('Please authenticate first');
      return;
    }

    const endpoints = [
      { name: 'Basic Info', url: `/api/securitize/investor?investorId=${investorId}&type=info` },
      { name: 'Details', url: `/api/securitize/investor?investorId=${investorId}&type=details` },
      { name: 'Verification', url: `/api/securitize/investor?investorId=${investorId}&type=verification` },
      { name: 'Documents', url: `/api/securitize/investor?investorId=${investorId}&type=documents` },
      { name: 'Wallets', url: `/api/securitize/investor?investorId=${investorId}&type=wallets` },
    ];

    console.log('Testing API endpoints...');
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        
        const data = await response.json();
        console.log(`${endpoint.name}:`, data);
      } catch (error) {
        console.error(`Failed to fetch ${endpoint.name}:`, error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Securitize iD API Test</title>
        <meta name="description" content="Test Securitize iD API integration" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Securitize iD API Test
            </h1>
            <p className="text-lg text-gray-600">
              Test the Securitize Connect API integration and OAuth flow
            </p>
          </div>

          {/* Configuration Info */}
          {config && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">App Name</p>
                  <p className="font-medium">{config.appName || 'Not configured'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Redirect URLs</p>
                  <p className="font-medium">{config.redirectUrls?.length || 0} configured</p>
                </div>
              </div>
            </div>
          )}

          {/* Authentication Section */}
          {!isAuthenticated ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Authentication</h2>
              <p className="text-gray-600 mb-4">
                Click one of the buttons below to authenticate with Securitize iD using OAuth 2.0
              </p>
              <div className="space-y-4 max-w-sm mx-auto">
                <SecuritizeAuth
                  onAuthSuccess={handleAuthSuccess}
                  onAuthError={handleAuthError}
                  variant="dark"
                  text="Log in with Securitize iD"
                />
                <SecuritizeAuth
                  onAuthSuccess={handleAuthSuccess}
                  onAuthError={handleAuthError}
                  variant="dark"
                  text="Invest with Securitize iD"
                />
                <SecuritizeAuth
                  onAuthSuccess={handleAuthSuccess}
                  onAuthError={handleAuthError}
                  variant="light"
                  text="Access with Securitize iD"
                />
                <SecuritizeAuth
                  onAuthSuccess={handleAuthSuccess}
                  onAuthError={handleAuthError}
                  variant="light"
                  text="Invest with Securitize iD"
                />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Authentication Status</h2>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium text-green-600">Authenticated</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Investor ID</p>
                  <p className="font-medium font-mono">{investorId}</p>
                </div>
              </div>
            </div>
          )}

          {/* API Testing Section */}
          {isAuthenticated && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">API Testing</h2>
              <p className="text-gray-600 mb-4">
                Test various Securitize iD API endpoints with your authenticated session
              </p>
              <button
                onClick={testAPIEndpoints}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Test All Endpoints
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Check the browser console for API response details
              </p>
            </div>
          )}

          {/* Investor Dashboard */}
          {isAuthenticated && accessToken && investorId && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Investor Dashboard</h2>
              <InvestorDashboard 
                investorId={investorId}
                accessToken={accessToken}
              />
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Use This Test Page</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Ensure your Securitize credentials are configured in <code>.env.local</code></li>
              <li>Click "Login with Securitize" to start the OAuth flow</li>
              <li>Complete authentication on Securitize's platform</li>
              <li>You'll be redirected back with an authorization code</li>
              <li>The code will be exchanged for access tokens automatically</li>
              <li>Use the "Test All Endpoints" button to verify API access</li>
              <li>Explore the Investor Dashboard to see your data</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
} 