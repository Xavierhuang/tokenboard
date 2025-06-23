import { NextApiRequest, NextApiResponse } from 'next';
import { SecuritizeAPI } from '@/lib/api/securitize';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Initialize Securitize API
  const securitizeAPI = new SecuritizeAPI(
    process.env.SECURITIZE_ISSUER_ID!,
    process.env.SECURITIZE_SECRET!,
    process.env.SECURITIZE_REDIRECT_URL!,
    process.env.SECURITIZE_ENVIRONMENT as 'production' | 'sandbox'
  );

  if (req.method === 'GET') {
    try {
      const config = await securitizeAPI.getConfiguration();
      res.status(200).json({
        success: true,
        data: config,
      });
    } catch (error) {
      console.error('Failed to get Securitize config:', error);
      res.status(500).json({ 
        error: 'Failed to get configuration',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else if (req.method === 'PATCH') {
    try {
      const { appIcon, appName, redirectUrls } = req.body;
      
      const config = await securitizeAPI.updateConfiguration({
        appIcon,
        appName,
        redirectUrls,
      });

      res.status(200).json({
        success: true,
        data: config,
      });
    } catch (error) {
      console.error('Failed to update Securitize config:', error);
      res.status(500).json({ 
        error: 'Failed to update configuration',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 