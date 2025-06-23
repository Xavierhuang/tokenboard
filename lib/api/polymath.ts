import axios, { AxiosInstance } from 'axios';
import { TokenizedAsset, PolymathAsset, ApiResponse, PaginatedResponse } from '@/types';

export class PolymathAPI {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: 'https://api.polymath.network/v1',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config: any) => {
        console.log(`Polymath API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        console.error('Polymath API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get all available security tokens from Polymath
   */
  async getSecurityTokens(params?: {
    page?: number;
    limit?: number;
    status?: string;
    ticker?: string;
  }): Promise<PaginatedResponse<PolymathAsset>> {
    try {
      const response = await this.client.get('/security-tokens', { params });
      return this.transformSecurityTokensResponse(response.data);
    } catch (error) {
      throw new Error(`Failed to fetch Polymath security tokens: ${error}`);
    }
  }

  /**
   * Get a specific security token by ID
   */
  async getSecurityToken(id: string): Promise<PolymathAsset> {
    try {
      const response = await this.client.get(`/security-tokens/${id}`);
      return this.transformSecurityTokenResponse(response.data);
    } catch (error) {
      throw new Error(`Failed to fetch Polymath security token ${id}: ${error}`);
    }
  }

  /**
   * Get security token by ticker
   */
  async getSecurityTokenByTicker(ticker: string): Promise<PolymathAsset> {
    try {
      const response = await this.client.get(`/security-tokens/ticker/${ticker}`);
      return this.transformSecurityTokenResponse(response.data);
    } catch (error) {
      throw new Error(`Failed to fetch Polymath security token by ticker ${ticker}: ${error}`);
    }
  }

  /**
   * Get investor information
   */
  async getInvestorInfo(investorId: string): Promise<any> {
    try {
      const response = await this.client.get(`/investors/${investorId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch investor info: ${error}`);
    }
  }

  /**
   * Get compliance status for an investor
   */
  async getComplianceStatus(investorId: string): Promise<any> {
    try {
      const response = await this.client.get(`/compliance/${investorId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch compliance status: ${error}`);
    }
  }

  /**
   * Get STO (Security Token Offering) details
   */
  async getSTO(stoId: string): Promise<any> {
    try {
      const response = await this.client.get(`/stos/${stoId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch STO ${stoId}: ${error}`);
    }
  }

  /**
   * Get market data for a security token
   */
  async getMarketData(securityTokenId: string): Promise<any> {
    try {
      const response = await this.client.get(`/security-tokens/${securityTokenId}/market-data`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch market data for security token ${securityTokenId}: ${error}`);
    }
  }

  /**
   * Get trading history for a security token
   */
  async getTradingHistory(securityTokenId: string, params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<any> {
    try {
      const response = await this.client.get(`/security-tokens/${securityTokenId}/trading-history`, { params });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch trading history for security token ${securityTokenId}: ${error}`);
    }
  }

  /**
   * Get Polymesh blockchain data
   */
  async getPolymeshData(assetId: string): Promise<any> {
    try {
      const response = await this.client.get(`/polymesh/${assetId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch Polymesh data for asset ${assetId}: ${error}`);
    }
  }

  /**
   * Transform Polymath API response to our standard format
   */
  private transformSecurityTokensResponse(data: any): PaginatedResponse<PolymathAsset> {
    return {
      data: data.securityTokens?.map((token: any) => this.transformSecurityTokenResponse(token)) || [],
      pagination: {
        page: data.pagination?.page || 1,
        limit: data.pagination?.limit || 10,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 1,
      },
    };
  }

  /**
   * Transform individual security token response
   */
  private transformSecurityTokenResponse(token: any): PolymathAsset {
    return {
      id: token.id,
      name: token.name,
      symbol: token.symbol,
      description: token.description,
      platform: 'polymath',
      assetType: this.mapAssetType(token.assetType),
      tokenStandard: 'ST-20',
      contractAddress: token.contractAddress,
      blockchain: 'polymesh',
      totalSupply: token.totalSupply,
      currentPrice: token.currentPrice,
      marketCap: token.marketCap,
      volume24h: token.volume24h || 0,
      yield: token.yield,
      maturityDate: token.maturityDate,
      issuer: token.issuer,
      complianceStatus: this.mapComplianceStatus(token.complianceStatus),
      kycRequired: token.kycRequired || true,
      minInvestment: token.minInvestment,
      maxInvestment: token.maxInvestment,
      imageUrl: token.imageUrl,
      website: token.website,
      whitepaper: token.whitepaper,
      createdAt: token.createdAt,
      updatedAt: token.updatedAt,
      ticker: token.ticker,
      securityType: token.securityType,
      dividendYield: token.dividendYield,
    };
  }

  /**
   * Map Polymath asset types to our standard types
   */
  private mapAssetType(polymathAssetType: string): string {
    const typeMap: { [key: string]: string } = {
      'real_estate': 'real-estate',
      'private_equity': 'private-equity',
      'venture_capital': 'venture-capital',
      'debt': 'debt',
      'commodities': 'commodities',
      'art': 'art',
    };
    return typeMap[polymathAssetType] || 'other';
  }

  /**
   * Map Polymath compliance status to our standard status
   */
  private mapComplianceStatus(polymathStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'verified': 'verified',
      'pending': 'pending',
      'rejected': 'rejected',
      'not_required': 'not-required',
    };
    return statusMap[polymathStatus] || 'pending';
  }

  /**
   * Get ST-20 smart contract ABI
   */
  async getST20ABI(): Promise<any[]> {
    // ST-20 token standard ABI
    return [
      {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [{"name": "", "type": "string"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [{"name": "", "type": "string"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{"name": "", "type": "uint256"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {"name": "_to", "type": "address"},
          {"name": "_value", "type": "uint256"}
        ],
        "name": "transfer",
        "outputs": [{"name": "", "type": "bool"}],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "getTokensByPartition",
        "outputs": [{"name": "", "type": "bytes32[]"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      }
    ];
  }
} 