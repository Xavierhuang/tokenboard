import React, { useState, useEffect } from 'react';

interface InvestorData {
  id: string;
  info: any;
  details: any;
  verification: any;
  documents: any;
  wallets: any;
  whitelisting: any;
}

interface InvestorDashboardProps {
  investorId: string;
  accessToken: string;
}

export default function InvestorDashboard({ investorId, accessToken }: InvestorDashboardProps) {
  const [investorData, setInvestorData] = useState<InvestorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (investorId && accessToken) {
      fetchInvestorData();
    }
  }, [investorId, accessToken]);

  const fetchInvestorData = async () => {
    try {
      setLoading(true);
      const dataTypes = ['info', 'details', 'verification', 'documents', 'wallets'];
      const data: any = { id: investorId };

      // Fetch all investor data in parallel
      const promises = dataTypes.map(async (type) => {
        try {
          const response = await fetch(`/api/securitize/investor?investorId=${investorId}&type=${type}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });
          if (response.ok) {
            const result = await response.json();
            return { type, data: result.data };
          }
        } catch (err) {
          console.error(`Failed to fetch ${type}:`, err);
        }
        return { type, data: null };
      });

      const results = await Promise.all(promises);
      results.forEach(({ type, data: resultData }) => {
        data[type] = resultData;
      });

      setInvestorData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch investor data');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletRegistration = async (walletData: {
    address: string;
    blockchain: string;
    tokenContract?: string;
  }) => {
    try {
      const response = await fetch(`/api/securitize/investor?investorId=${investorId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: 'register-wallet',
          ...walletData,
        }),
      });

      if (response.ok) {
        // Refresh wallet data
        fetchInvestorData();
      } else {
        throw new Error('Failed to register wallet');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register wallet');
    }
  };

  const handleWhitelistingRequest = async (whitelistingData: {
    tokenContract: string;
    blockchain: string;
    walletAddress: string;
  }) => {
    try {
      const response = await fetch(`/api/securitize/whitelisting?investorId=${investorId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(whitelistingData),
      });

      if (response.ok) {
        // Refresh whitelisting data
        fetchInvestorData();
      } else {
        throw new Error('Failed to request whitelisting');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request whitelisting');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (!investorData) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">No investor data available</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'kyc', name: 'KYC Status', icon: '✅' },
    { id: 'documents', name: 'Documents', icon: '📄' },
    { id: 'wallets', name: 'Wallets', icon: '💼' },
    { id: 'whitelisting', name: 'Whitelisting', icon: '🔒' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">Investor Dashboard</h2>
        <p className="text-sm text-gray-500">ID: {investorId}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Basic Information</h3>
                {investorData.info && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name:</span>
                      <span className="font-medium">{investorData.info.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="font-medium">{investorData.info.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className="font-medium">{investorData.info.type || 'N/A'}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">KYC Status</h3>
                {investorData.verification && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className={`font-medium ${
                        investorData.verification.status === 'verified' 
                          ? 'text-green-600' 
                          : 'text-yellow-600'
                      }`}>
                        {investorData.verification.status || 'Pending'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Documents:</span>
                      <span className="font-medium">
                        {investorData.documents?.length || 0} uploaded
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Wallets</h3>
              {investorData.wallets && investorData.wallets.length > 0 ? (
                <div className="space-y-2">
                  {investorData.wallets.map((wallet: any, index: number) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="font-mono text-gray-600">
                        {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                      </span>
                      <span className="text-gray-500">{wallet.blockchain}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No wallets registered</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'kyc' && (
          <div className="space-y-6">
            {investorData.verification && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4">Verification Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">KYC Status:</span>
                    <span className={`ml-2 font-medium ${
                      investorData.verification.kycStatus === 'verified' 
                        ? 'text-green-600' 
                        : 'text-yellow-600'
                    }`}>
                      {investorData.verification.kycStatus || 'Pending'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">AML Status:</span>
                    <span className={`ml-2 font-medium ${
                      investorData.verification.amlStatus === 'verified' 
                        ? 'text-green-600' 
                        : 'text-yellow-600'
                    }`}>
                      {investorData.verification.amlStatus || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {investorData.details && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4">Investor Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Accredited:</span>
                    <span className="ml-2 font-medium">
                      {investorData.details.accredited ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Jurisdiction:</span>
                    <span className="ml-2 font-medium">
                      {investorData.details.jurisdiction || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Uploaded Documents</h3>
            {investorData.documents && investorData.documents.length > 0 ? (
              <div className="space-y-3">
                {investorData.documents.map((doc: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{doc.type}</p>
                      <p className="text-xs text-gray-500">{doc.status}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No documents uploaded</p>
            )}
          </div>
        )}

        {activeTab === 'wallets' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-900">Registered Wallets</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                + Add Wallet
              </button>
            </div>
            
            {investorData.wallets && investorData.wallets.length > 0 ? (
              <div className="space-y-3">
                {investorData.wallets.map((wallet: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-mono text-sm font-medium">
                        {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                      </p>
                      <p className="text-xs text-gray-500">{wallet.blockchain}</p>
                    </div>
                    <span className="text-xs text-green-600">Registered</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No wallets registered</p>
            )}
          </div>
        )}

        {activeTab === 'whitelisting' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-900">Token Whitelisting</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                + Request Whitelisting
              </button>
            </div>
            
            {investorData.whitelisting && investorData.whitelisting.length > 0 ? (
              <div className="space-y-3">
                {investorData.whitelisting.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-mono text-sm font-medium">
                        {item.tokenContract.slice(0, 6)}...{item.tokenContract.slice(-4)}
                      </p>
                      <p className="text-xs text-gray-500">{item.blockchain}</p>
                    </div>
                    <span className={`text-xs ${
                      item.status === 'approved' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No whitelisting requests</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 