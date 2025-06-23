import { NextApiRequest, NextApiResponse } from 'next';
import { TokenizedAssetsAggregator } from '@/lib/aggregator';
import { AssetFilters } from '@/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, filters }: { query: string; filters?: AssetFilters } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const aggregator = new TokenizedAssetsAggregator();
    const result = await aggregator.searchAssets(query, filters);

    res.status(200).json(result);
  } catch (error) {
    console.error('Search API Error:', error);
    res.status(500).json({ 
      error: 'Failed to search assets',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 