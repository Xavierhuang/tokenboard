import React, { useState } from 'react';
import { TokenizedAsset } from '@/types';
import { formatCurrency, formatPercentage, formatNumber } from '@/lib/utils';
import PYUSDPayment from './PYUSDPayment';

interface AssetCardProps {
  asset: TokenizedAsset;
}

export default function AssetCard({ asset }: AssetCardProps) {
  const [showPayment, setShowPayment] = useState(false);

  const getPlatformColor = (platform: string) => {
    const colors = {
      securitize: 'bg-blue-100 text-blue-800',
      polymath: 'bg-purple-100 text-purple-800',
      tzero: 'bg-green-100 text-green-800',
      harbor: 'bg-orange-100 text-orange-800',
      tokensoft: 'bg-red-100 text-red-800',
    };
    return colors[platform as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getComplianceStatusColor = (status: string) => {
    const colors = {
      verified: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      'not-required': 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handlePaymentSuccess = (txHash: string) => {
    console.log('Payment successful:', txHash);
    setShowPayment(false);
    // You could show a success notification here
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment failed:', error);
    // You could show an error notification here
  };

  if (showPayment) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="max-w-md w-full max-h-[90vh] overflow-y-auto">
          <PYUSDPayment
            asset={asset}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            onCancel={() => setShowPayment(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlatformColor(asset.platform)}`}>
                {asset.platform}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getComplianceStatusColor(asset.complianceStatus)}`}>
                {asset.complianceStatus}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{asset.name}</h3>
            <p className="text-sm text-gray-500">{asset.symbol}</p>
          </div>
          {asset.imageUrl && (
            <img 
              src={asset.imageUrl} 
              alt={asset.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {asset.description}
        </p>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500">Current Price</p>
            <p className="text-lg font-semibold text-gray-900">{formatCurrency(asset.currentPrice)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Market Cap</p>
            <p className="text-lg font-semibold text-gray-900">{formatCurrency(asset.marketCap)}</p>
          </div>
          {asset.yield && (
            <div>
              <p className="text-xs text-gray-500">Yield</p>
              <p className="text-lg font-semibold text-green-600">{formatPercentage(asset.yield)}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500">24h Volume</p>
            <p className="text-lg font-semibold text-gray-900">{formatCurrency(asset.volume24h)}</p>
          </div>
        </div>

        {/* Asset Details */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Issuer:</span>
            <span className="text-gray-900 font-medium">{asset.issuer}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Token Standard:</span>
            <span className="text-gray-900 font-medium">{asset.tokenStandard}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Blockchain:</span>
            <span className="text-gray-900 font-medium">{asset.blockchain}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Min Investment:</span>
            <span className="text-gray-900 font-medium">{formatCurrency(asset.minInvestment)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button 
            onClick={() => setShowPayment(true)}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Buy with PYUSD
          </button>
          {asset.website && (
            <a
              href={asset.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors duration-200 text-center"
            >
              Website
            </a>
          )}
        </div>
      </div>
    </div>
  );
} 