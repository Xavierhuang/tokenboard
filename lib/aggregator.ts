import { TokenizedAsset, AssetFilters, PaginatedResponse, Platform } from '@/types';
import { SecuritizeAPI } from './api/securitize';
import { PolymathAPI } from './api/polymath';
import { Logger } from './logger';

export class TokenizedAssetsAggregator {
  private securitizeAPI: SecuritizeAPI;
  private polymathAPI: PolymathAPI;
  private logger: Logger;
  private supportedPlatforms: Platform[] = ['securitize', 'polymath'];

  constructor() {
    this.logger = new Logger('TokenizedAssetsAggregator');
    this.securitizeAPI = new SecuritizeAPI(
      process.env.SECURITIZE_ISSUER_ID || '',
      process.env.SECURITIZE_SECRET || '',
      process.env.SECURITIZE_REDIRECT_URL || '',
      (process.env.SECURITIZE_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
    );
    this.polymathAPI = new PolymathAPI(process.env.POLYMATH_API_KEY || '');
    this.logger.info('Aggregator initialized.');
  }

  /**
   * Get all assets from all supported platforms
   */
  async getAllAssets(filters?: AssetFilters): Promise<PaginatedResponse<TokenizedAsset>> {
    try {
      const promises = [];

      // Add Securitize assets if platform is not filtered or is included
      if (!filters?.platform || filters.platform.includes('securitize')) {
        promises.push(this.securitizeAPI.getSecurities());
      }

      // Add Polymath assets if platform is not filtered or is included
      if (!filters?.platform || filters.platform.includes('polymath')) {
        promises.push(this.polymathAPI.getSecurityTokens());
      }

      const results = await Promise.allSettled(promises);
      let allAssets: TokenizedAsset[] = [];

      results.forEach((result, index) => {
        const platform = this.supportedPlatforms[index];
        if (result.status === 'fulfilled' && result.value && result.value.data) {
          this.logger.info(`Successfully fetched ${result.value.data.length} assets from ${platform}.`);
          allAssets = allAssets.concat(result.value.data);
        } else {
          const reason = result.status === 'rejected' ? result.reason : 'Empty or invalid response';
          this.logger.error(`Failed to fetch assets from ${platform}.`, reason);
        }
      });

      if (allAssets.length === 0) {
        this.logger.warn('Failed to fetch assets from any platform. Returning empty array.');
      }

      // Apply filters
      if (filters) {
        allAssets = this.applyFilters(allAssets, filters);
      }

      // Sort by market cap (descending)
      allAssets.sort((a, b) => b.marketCap - a.marketCap);

      // Pagination
      const page = 1;
      const limit = 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedAssets = allAssets.slice(startIndex, endIndex);

      return {
        data: paginatedAssets,
        pagination: {
          page,
          limit,
          total: allAssets.length,
          totalPages: Math.ceil(allAssets.length / limit),
        },
      };
    } catch (error) {
      this.logger.error('An unexpected error occurred in getAllAssets.', error);
      throw new Error(`Failed to aggregate assets: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get assets by platform
   */
  async getAssetsByPlatform(platform: Platform, filters?: AssetFilters): Promise<PaginatedResponse<TokenizedAsset>> {
    try {
      let assets: TokenizedAsset[] = [];

      switch (platform) {
        case 'securitize':
          const securitizeResult = await this.securitizeAPI.getSecurities();
          if (securitizeResult && securitizeResult.data) {
            assets = securitizeResult.data;
          }
          break;
        case 'polymath':
          const polymathResult = await this.polymathAPI.getSecurityTokens();
          if (polymathResult && polymathResult.data) {
            assets = polymathResult.data;
          }
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      // Apply filters
      if (filters) {
        assets = this.applyFilters(assets, filters);
      }

      return {
        data: assets,
        pagination: {
          page: 1,
          limit: assets.length,
          total: assets.length,
          totalPages: 1,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get assets for platform ${platform}: ${error}`);
    }
  }

  /**
   * Search assets across all platforms
   */
  async searchAssets(query: string, filters?: AssetFilters): Promise<PaginatedResponse<TokenizedAsset>> {
    try {
      const allAssets = await this.getAllAssets(filters);
      
      const searchResults = allAssets.data.filter(asset => 
        asset.name.toLowerCase().includes(query.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(query.toLowerCase()) ||
        asset.description.toLowerCase().includes(query.toLowerCase()) ||
        asset.issuer.toLowerCase().includes(query.toLowerCase())
      );

      return {
        data: searchResults,
        pagination: {
          page: 1,
          limit: searchResults.length,
          total: searchResults.length,
          totalPages: 1,
        },
      };
    } catch (error) {
      throw new Error(`Failed to search assets: ${error}`);
    }
  }

  /**
   * Get asset by ID across all platforms
   */
  async getAssetById(id: string): Promise<TokenizedAsset | null> {
    try {
      // Try to find the asset across all platforms
      for (const platform of this.supportedPlatforms) {
        try {
          let asset: TokenizedAsset | null = null;

          switch (platform) {
            case 'securitize':
              asset = await this.securitizeAPI.getSecurity(id);
              break;
            case 'polymath':
              asset = await this.polymathAPI.getSecurityToken(id);
              break;
          }

          if (asset) {
            return asset;
          }
        } catch (error) {
          // Continue to next platform if asset not found
          continue;
        }
      }

      return null;
    } catch (error) {
      throw new Error(`Failed to get asset by ID ${id}: ${error}`);
    }
  }

  /**
   * Get market data for an asset
   */
  async getMarketData(assetId: string, platform: Platform): Promise<any> {
    try {
      switch (platform) {
        case 'securitize':
          return await this.securitizeAPI.getMarketData(assetId);
        case 'polymath':
          return await this.polymathAPI.getMarketData(assetId);
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
    } catch (error) {
      throw new Error(`Failed to get market data for asset ${assetId}: ${error}`);
    }
  }

  /**
   * Get trading history for an asset
   */
  async getTradingHistory(assetId: string, platform: Platform, params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<any> {
    try {
      switch (platform) {
        case 'securitize':
          return await this.securitizeAPI.getTradingHistory(assetId, params);
        case 'polymath':
          return await this.polymathAPI.getTradingHistory(assetId, params);
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
    } catch (error) {
      throw new Error(`Failed to get trading history for asset ${assetId}: ${error}`);
    }
  }

  /**
   * Get aggregated statistics from all platforms
   */
  async getPlatformStats(): Promise<any> {
    this.logger.info('Fetching platform stats...');
    try {
      const allAssetsResult = await this.getAllAssets();
      const allAssets = allAssetsResult.data;

      if (!allAssets || allAssets.length === 0) {
        this.logger.warn('Cannot generate stats, no assets were fetched.');
        // Return a default stats object to prevent frontend crashes
        return {
          totalAssets: 0,
          totalMarketCap: 0,
          totalVolume24h: 0,
          averageYield: 0,
          activePlatforms: 0,
          platformBreakdown: {},
        };
      }

      const totalMarketCap = allAssets.reduce((sum, asset) => sum + asset.marketCap, 0);
      const totalVolume24h = allAssets.reduce((sum, asset) => sum + asset.volume24h, 0);
      const platformCounts = allAssets.reduce((acc, asset) => {
        const platform = asset.platform;
        if (!acc[platform]) {
          acc[platform] = 0;
        }
        acc[platform]++;
        return acc;
      }, {} as Record<string, number>);

      const platformBreakdown = Object.entries(platformCounts).map(([platform, count]) => ({
        platform,
        count,
        percentage: (count / allAssets.length) * 100,
      }));

      const stats = {
        totalAssets: allAssets.length,
        totalMarketCap,
        totalVolume24h,
        averageYield: 5.5, // Placeholder
        activePlatforms: this.supportedPlatforms.length,
        platformBreakdown,
      };

      this.logger.info('Successfully generated platform stats.', stats);
      return stats;

    } catch (error) {
      this.logger.error('Failed to get platform stats.', error);
      // Re-throw the error to be caught by the API route
      throw new Error(`Failed to generate platform stats: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Apply filters to assets
   */
  private applyFilters(assets: TokenizedAsset[], filters: AssetFilters): TokenizedAsset[] {
    return assets.filter(asset => {
      // Platform filter
      if (filters.platform && !filters.platform.includes(asset.platform)) {
        return false;
      }

      // Asset type filter
      if (filters.assetType && !filters.assetType.includes(asset.assetType)) {
        return false;
      }

      // Token standard filter
      if (filters.tokenStandard && !filters.tokenStandard.includes(asset.tokenStandard)) {
        return false;
      }

      // Compliance status filter
      if (filters.complianceStatus && !filters.complianceStatus.includes(asset.complianceStatus)) {
        return false;
      }

      // Price range filter
      if (filters.minPrice && asset.currentPrice < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice && asset.currentPrice > filters.maxPrice) {
        return false;
      }

      // Yield range filter
      if (asset.yield !== undefined) {
        if (filters.minYield && asset.yield < filters.minYield) {
          return false;
        }
        if (filters.maxYield && asset.yield > filters.maxYield) {
          return false;
        }
      }

      // Blockchain filter
      if (filters.blockchain && !filters.blockchain.includes(asset.blockchain)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Get supported platforms
   */
  getSupportedPlatforms(): Platform[] {
    return this.supportedPlatforms;
  }
} 