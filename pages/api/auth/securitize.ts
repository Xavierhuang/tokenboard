import { NextApiRequest, NextApiResponse } from 'next';
import { SecuritizeAPI } from '@/lib/api/securitize';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    // Initialize Securitize API
    const securitizeAPI = new SecuritizeAPI(
      process.env.SECURITIZE_ISSUER_ID!,
      process.env.SECURITIZE_SECRET!,
      process.env.SECURITIZE_REDIRECT_URL!,
      process.env.SECURITIZE_ENVIRONMENT as 'production' | 'sandbox'
    );

    // Exchange code for access token
    const authResult = await securitizeAPI.authorize(code);

    res.status(200).json({
      success: true,
      data: authResult,
    });
  } catch (error) {
    console.error('Securitize auth error:', error);
    res.status(500).json({ 
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 