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
      const { type } = req.query;
      let data;

      switch (type) {
        case 'info':
          data = await securitizeAPI.getInvestorInfo(investorId);
          break;
        case 'details':
          data = await securitizeAPI.getInvestorDetails(investorId);
          break;
        case 'verification':
          data = await securitizeAPI.getVerificationInfo(investorId);
          break;
        case 'documents':
          data = await securitizeAPI.getInvestorDocuments(investorId);
          break;
        case 'legal-signers':
          data = await securitizeAPI.getLegalSigners(investorId);
          break;
        case 'verification-details':
          data = await securitizeAPI.getVerificationDetails(investorId);
          break;
        case 'wallets':
          data = await securitizeAPI.getInvestorWallets(investorId);
          break;
        default:
          data = await securitizeAPI.getInvestorInfo(investorId);
      }

      res.status(200).json({
        success: true,
        data: data,
      });
    } catch (error) {
      console.error('Failed to fetch investor data:', error);
      res.status(500).json({ 
        error: 'Failed to fetch investor data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else if (req.method === 'POST') {
    try {
      const { action, ...data } = req.body;
      let result;

      switch (action) {
        case 'register-wallet':
          result = await securitizeAPI.registerWallet(investorId, data);
          break;
        case 'request-whitelisting':
          result = await securitizeAPI.requestWhitelisting(investorId, data);
          break;
        default:
          return res.status(400).json({ error: 'Invalid action' });
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Failed to perform investor action:', error);
      res.status(500).json({ 
        error: 'Failed to perform investor action',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 