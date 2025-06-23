import React, { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Header from '../components/Header';
import PYUSDWallet from '../components/PYUSDWallet';
import PYUSDPayment from '../components/PYUSDPayment';
import { TokenizedAsset } from '../types';

const Home: NextPage = () => {
  const [selectedAsset, setSelectedAsset] = useState<TokenizedAsset | null>(null);

  // Demo asset for testing
  const demoAsset: TokenizedAsset = {
    id: 'demo-1',
    name: 'Demo Real Estate Fund',
    symbol: 'DREF',
    description: 'A diversified real estate investment fund with properties across major US markets.',
    platform: 'securitize',
    assetType: 'real-estate',
    tokenStandard: 'ERC-1400',
    contractAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    blockchain: 'ethereum',
    totalSupply: 1000000,
    currentPrice: 25.50,
    marketCap: 25500000,
    volume24h: 125000,
    yield: 8.5,
    maturityDate: '2025-12-31',
    issuer: 'Demo Asset Management LLC',
    complianceStatus: 'verified',
    kycRequired: true,
    minInvestment: 1000,
    maxInvestment: 100000,
    imageUrl: '/logo.png',
    website: 'https://example.com',
    whitepaper: 'https://example.com/whitepaper.pdf',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  const handlePaymentSuccess = (txHash: string) => {
    console.log('Payment successful:', txHash);
    alert(`Payment successful! Transaction hash: ${txHash}`);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment failed:', error);
    alert(`Payment failed: ${error}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Head>
        <title>PYUSD Integration Demo - Tokenized Assets Aggregator</title>
        <meta name="description" content="Demo of PayPal USD (PYUSD) integration for tokenized asset purchases" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              PayPal USD (PYUSD) Integration
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Seamlessly purchase tokenized assets using PayPal's stablecoin
            </p>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-2">Why PYUSD?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h3 className="font-semibold mb-1">Regulated & Secure</h3>
                  <p>Backed by PayPal and regulated by NYDFS</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">1:1 USD Peg</h3>
                  <p>Stable value backed by US dollar reserves</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Fast & Low Cost</h3>
                  <p>Ethereum-based with minimal transaction fees</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* PYUSD Wallet Section */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">PYUSD Wallet</h2>
              <PYUSDWallet 
                onConnect={(address) => console.log('Wallet connected:', address)}
                onDisconnect={() => console.log('Wallet disconnected')}
              />
            </div>

            {/* Demo Asset Section */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Demo Asset</h2>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <img 
                    src={demoAsset.imageUrl} 
                    alt={demoAsset.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{demoAsset.name}</h3>
                    <p className="text-sm text-gray-500">{demoAsset.symbol}</p>
                    <p className="text-sm text-gray-600">Current Price: ${demoAsset.currentPrice}</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{demoAsset.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-500">Yield</p>
                    <p className="text-lg font-semibold text-green-600">{demoAsset.yield}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Min Investment</p>
                    <p className="text-lg font-semibold text-gray-900">${demoAsset.minInvestment}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedAsset(demoAsset)}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  Purchase with PYUSD
                </button>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">PYUSD Integration Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Wallet Connection</h3>
                <p className="text-gray-600">Connect MetaMask or any Web3 wallet to access your PYUSD balance</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Balance Tracking</h3>
                <p className="text-gray-600">Real-time PYUSD balance display with transaction history</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Payments</h3>
                <p className="text-gray-600">Purchase tokenized assets directly with PYUSD on the blockchain</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Transaction History</h3>
                <p className="text-gray-600">Track all PYUSD transactions with detailed blockchain data</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Regulatory Compliance</h3>
                <p className="text-gray-600">Built-in compliance with NYDFS regulations and KYC requirements</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Integration</h3>
                <p className="text-gray-600">Simple API integration for developers and seamless UX for users</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full max-h-[90vh] overflow-y-auto">
            <PYUSDPayment
              asset={selectedAsset}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              onCancel={() => setSelectedAsset(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home; 