import { NextApiRequest, NextApiResponse } from 'next';
import { TokenizedAssetsAggregator } from '@/lib/aggregator';
import { AssetFilters } from '@/types';

// Mock data for when APIs are unavailable
const mockAssets = [
  {
    id: '1',
    name: 'Manhattan Office Building',
    description: 'Prime office space in Midtown Manhattan',
    currentPrice: 1500000,
    yield: 8.5,
    minInvestment: 50000,
    assetType: 'real-estate',
    platform: 'securitize',
    tokenStandard: 'ERC-1400',
    complianceStatus: 'compliant',
    blockchain: 'ethereum',
    region: 'north-america',
    riskLevel: 'medium',
    liquidity: 'medium',
    regulatoryStatus: 'regulated'
  },
  {
    id: '2',
    name: 'Tech Startup Portfolio',
    description: 'Diversified portfolio of early-stage tech companies',
    currentPrice: 2500000,
    yield: 12.0,
    minInvestment: 100000,
    assetType: 'venture-capital',
    platform: 'texture',
    tokenStandard: 'ERC-20',
    complianceStatus: 'compliant',
    blockchain: 'ethereum',
    region: 'north-america',
    riskLevel: 'high',
    liquidity: 'low',
    regulatoryStatus: 'regulated'
  },
  {
    id: '3',
    name: 'European Infrastructure Fund',
    description: 'Renewable energy and transportation infrastructure',
    currentPrice: 5000000,
    yield: 6.2,
    minInvestment: 250000,
    assetType: 'infrastructure',
    platform: 'centrifuge',
    tokenStandard: 'ERC-1400',
    complianceStatus: 'compliant',
    blockchain: 'ethereum',
    region: 'europe',
    riskLevel: 'low',
    liquidity: 'medium',
    regulatoryStatus: 'regulated'
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const filters = req.method === 'POST' ? req.body.filters : req.query;
    
    // Try to get real data first
    try {
      const aggregator = new TokenizedAssetsAggregator();
      const result = await aggregator.getAllAssets(filters);
      
      if (result.data && result.data.length > 0) {
        return res.status(200).json(result);
      }
    } catch (aggregatorError) {
      console.warn('Aggregator failed, using mock data:', aggregatorError);
    }

    // Fall back to mock data
    const filteredAssets = mockAssets.filter(asset => {
      if (!filters) return true;
      
      // Platform filter
      if (filters.platform && !filters.platform.includes(asset.platform)) return false;
      
      // Asset type filter
      if (filters.assetType && !filters.assetType.includes(asset.assetType)) return false;
      
      // Price range filters
      if (filters.minPrice && asset.currentPrice < Number(filters.minPrice)) return false;
      if (filters.maxPrice && asset.currentPrice > Number(filters.maxPrice)) return false;
      
      // Yield filters
      if (asset.yield !== undefined) {
        if (filters.minYield && asset.yield < Number(filters.minYield)) return false;
        if (filters.maxYield && asset.yield > Number(filters.maxYield)) return false;
      }
      
      // Minimum Investment filter
      if (filters.minInvestment) {
        const minInvestment = Number(filters.minInvestment);
        if (asset.minInvestment < minInvestment) return false;
      }
      
      return true;
    });

    res.status(200).json({
      success: true,
      data: filteredAssets,
      total: filteredAssets.length,
      message: 'Using mock data - external APIs unavailable'
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch assets',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 