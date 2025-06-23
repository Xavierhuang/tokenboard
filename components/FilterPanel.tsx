import React, { useState } from 'react';
import { AssetFilters } from '@/types';

interface FilterPanelProps {
  filters: AssetFilters;
  onFilterChange: (filters: AssetFilters) => void;
}

export default function FilterPanel({ filters, onFilterChange }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleFilterChange = (key: keyof AssetFilters, value: any) => {
    const newFilters = { ...filters };
    if (value === '' || value === null || value === undefined) {
      delete newFilters[key];
    } else {
      // Handle array-based filters
      if (key === 'assetType' || key === 'platform' || key === 'tokenStandard' || key === 'complianceStatus' || key === 'blockchain') {
        newFilters[key] = [value];
      } else {
        newFilters[key] = value;
      }
    }
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 mt-2"
          >
            Clear all filters
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Platform Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform
            </label>
            <select
              value={Array.isArray(filters.platform) ? filters.platform[0] || '' : filters.platform || ''}
              onChange={(e) => handleFilterChange('platform', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Platforms</option>
              <option value="securitize">Securitize</option>
              <option value="texture">Texture Capital</option>
              <option value="centrifuge">Centrifuge</option>
              <option value="polymath">Polymath</option>
              <option value="tzero">TZero</option>
              <option value="harbor">Harbor</option>
              <option value="tokensoft">TokenSoft</option>
            </select>
          </div>

          {/* Asset Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Asset Type
            </label>
            <select
              value={Array.isArray(filters.assetType) ? filters.assetType[0] || '' : filters.assetType || ''}
              onChange={(e) => handleFilterChange('assetType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="real-estate">Real Estate</option>
              <option value="private-equity">Private Equity</option>
              <option value="venture-capital">Venture Capital</option>
              <option value="commodities">Commodities</option>
              <option value="art">Art & Collectibles</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="debt">Debt Securities</option>
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Risk Level
            </label>
            <select
              value={filters.riskLevel || ''}
              onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Risk Levels</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>
          </div>

          {/* Minimum Investment Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Investment
            </label>
            <select
              value={filters.minInvestment || ''}
              onChange={(e) => handleFilterChange('minInvestment', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Any Amount</option>
              <option value="1000">$1,000+</option>
              <option value="5000">$5,000+</option>
              <option value="10000">$10,000+</option>
              <option value="25000">$25,000+</option>
              <option value="50000">$50,000+</option>
              <option value="100000">$100,000+</option>
            </select>
          </div>

          {/* Price Range Filters */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Price
              </label>
              <input
                type="number"
                placeholder="0"
                value={filters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price
              </label>
              <input
                type="number"
                placeholder="∞"
                value={filters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Geographic Region Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Geographic Region
            </label>
            <select
              value={filters.region || ''}
              onChange={(e) => handleFilterChange('region', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Regions</option>
              <option value="north-america">North America</option>
              <option value="europe">Europe</option>
              <option value="asia-pacific">Asia Pacific</option>
              <option value="latin-america">Latin America</option>
              <option value="middle-east">Middle East</option>
              <option value="africa">Africa</option>
            </select>
          </div>

          {/* Yield Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Yield
            </label>
            <select
              value={filters.yieldRange || ''}
              onChange={(e) => handleFilterChange('yieldRange', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Any Yield</option>
              <option value="0-5">0-5%</option>
              <option value="5-10">5-10%</option>
              <option value="10-15">10-15%</option>
              <option value="15-20">15-20%</option>
              <option value="20+">20%+</option>
            </select>
          </div>

          {/* Liquidity Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Liquidity
            </label>
            <select
              value={filters.liquidity || ''}
              onChange={(e) => handleFilterChange('liquidity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Any Liquidity</option>
              <option value="high">High Liquidity</option>
              <option value="medium">Medium Liquidity</option>
              <option value="low">Low Liquidity</option>
            </select>
          </div>

          {/* Regulatory Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Regulatory Status
            </label>
            <select
              value={filters.regulatoryStatus || ''}
              onChange={(e) => handleFilterChange('regulatoryStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="regulated">Regulated</option>
              <option value="unregulated">Unregulated</option>
              <option value="pending">Pending Approval</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
} 