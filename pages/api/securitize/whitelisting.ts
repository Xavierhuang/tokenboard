import { NextApiRequest, NextApiResponse } from 'next';
import { SecuritizeAPI } from '@/lib/api/securitize';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { investorId } = req.query;

  if (!investorId || typeof investorId !== 'string') {
    return res.status(400).json({ error: 'Investor ID is required' });
  }

  // Initialize Securitize API
  const securitizeAPI = new SecuritizeAPI(
    process.env.SECURITIZE_ISSUER_ID!,
    process.env.SECURITIZE_SECRET!,
    process.env.SECURITIZE_REDIRECT_URL!,
    process.env.SECURITIZE_ENVIRONMENT as 'production' | 'sandbox'
  );

  if (req.method === 'GET') {
    try {
      const { tokenContract } = req.query;
      const data = await securitizeAPI.getWhitelistingStatus(
        investorId, 
        tokenContract as string
      );

      res.status(200).json({
        success: true,
        data: data,
      });
    } catch (error) {
      console.error('Failed to fetch whitelisting status:', error);
      res.status(500).json({ 
        error: 'Failed to fetch whitelisting status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else if (req.method === 'POST') {
    try {
      const { tokenContract, blockchain, walletAddress } = req.body;
      
      if (!tokenContract || !blockchain || !walletAddress) {
        return res.status(400).json({ 
          error: 'tokenContract, blockchain, and walletAddress are required' 
        });
      }

      const data = await securitizeAPI.requestWhitelisting(investorId, {
        tokenContract,
        blockchain,
        walletAddress,
      });

      res.status(200).json({
        success: true,
        data: data,
      });
    } catch (error) {
      console.error('Failed to request whitelisting:', error);
      res.status(500).json({ 
        error: 'Failed to request whitelisting',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 