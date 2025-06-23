import { NextApiRequest, NextApiResponse } from 'next';
import { TokenizedAssetsAggregator } from '@/lib/aggregator';

// Mock stats for when APIs are unavailable
const mockStats = {
  totalAssets: 3,
  totalMarketCap: 9000000,
  totalVolume24h: 1250000,
  averageYield: 8.9,
  activePlatforms: 3,
  totalInvestors: 1250
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Try to get real stats first
    try {
      const aggregator = new TokenizedAssetsAggregator();
      const stats = await aggregator.getPlatformStats();
      
      if (stats.data) {
        return res.status(200).json(stats);
      }
    } catch (aggregatorError) {
      console.warn('Aggregator failed, using mock stats:', aggregatorError);
    }

    // Fall back to mock stats
    res.status(200).json({
      success: true,
      data: mockStats,
      message: 'Using mock data - external APIs unavailable'
    });
  } catch (error) {
    console.error('Stats API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 