import { NextApiRequest, NextApiResponse } from 'next';
import { pyusdService } from '@/lib/pyusd';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address } = req.query;

    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: 'Address parameter is required' });
    }

    const balance = await pyusdService.getBalance(address);

    res.status(200).json({
      success: true,
      data: balance,
    });
  } catch (error) {
    console.error('PYUSD Balance API Error:', error);
    res.status(500).json({ 
      error: 'Failed to get PYUSD balance',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 