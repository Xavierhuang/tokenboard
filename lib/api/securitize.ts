import axios, { AxiosInstance } from 'axios';
import { TokenizedAsset, SecuritizeAsset, ApiResponse, PaginatedResponse, AssetType, ComplianceStatus, TokenStandard } from '@/types';
import { Logger } from '@/lib/logger';

export class SecuritizeAPI {
  private client: AxiosInstance;
  private issuerId: string;
  private secret: string;
  private baseUrl: string;
  private apiBaseUrl: string;
  private redirectUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private environment: 'sandbox' | 'production';
  private logger: Logger;

  constructor(
    issuerId: string,
    secret: string,
    redirectUrl: string,
    environment: 'production' | 'sandbox' = 'sandbox'
  ) {
    this.issuerId = issuerId;
    this.secret = secret;
    this.redirectUrl = redirectUrl;
    this.environment = environment;
    this.logger = new Logger('SecuritizeAPI');
    
    // Set URLs based on environment
    if (environment === 'production') {
      this.baseUrl = 'https://id.securitize.io';
      this.apiBaseUrl = 'https://connect-gw.securitize.io/api';
    } else {
      this.baseUrl = 'https://id.sandbox.securitize.io';
      this.apiBaseUrl = 'https://connect-gw.sandbox.securitize.io/api';
    }

    this.client = axios.create({
      baseURL: this.apiBaseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use(
      (config: any) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        if (this.issuerId) {
          config.headers.clientid = this.issuerId;
        }
        console.log(`Securitize Connect API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for token refresh
    this.client.interceptors.response.use(
      (response: any) => response,
      async (error: any) => {
        if (error.response?.status === 401 && this.refreshToken) {
          try {
            await this.refreshAccessToken();
            // Retry the original request
            const originalRequest = error.config;
            originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            console.error('Failed to refresh token:', refreshError);
          }
        }
        console.error('Securitize Connect API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get the authorization URL for OAuth 2.0 flow
   * @param scope - Scope of access (info, details, etc.)
   * @param state - Optional state parameter for security
   */
  getAuthorizationUrl(scope: string = 'info', state?: string): string {
    const params = new URLSearchParams({
      issuerId: this.issuerId,
      scope: scope,
      redirectUrl: this.redirectUrl,
    });
    
    if (state) {
      params.append('state', state);
    }
    
    return `${this.baseUrl}/auth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token (OAuth 2.0)
   */
  async authorize(code: string): Promise<any> {
    try {
      const response = await this.client.post('/auth/v1/authorize', {
        code: code,
      });
      
      if (response.data) {
        this.accessToken = response.data.accessToken;
        this.refreshToken = response.data.refreshToken;
      }
      
      return response.data;
    } catch (error) {
      throw new Error(`Failed to authorize: ${error}`);
    }
  }

  /**
   * Refresh access token using refresh token (OAuth 2.0)
   */
  async refreshAccessToken(): Promise<any> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.client.post('/auth/v1/refresh', {
        refreshToken: this.refreshToken,
      });
      
      if (response.data) {
        this.accessToken = response.data.accessToken;
        this.refreshToken = response.data.refreshToken;
      }
      
      return response.data;
    } catch (error) {
      throw new Error(`Failed to refresh token: ${error}`);
    }
  }

  /**
   * Get application configuration
   */
  async getConfiguration(): Promise<any> {
    try {
      const response = await this.client.get(`/config/v1/${this.issuerId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get configuration: ${error}`);
    }
  }

  /**
   * Update application configuration
   */
  async updateConfiguration(config: {
    appIcon?: string;
    appName?: string;
    redirectUrls?: string[];
  }): Promise<any> {
    try {
      const response = await this.client.patch(`/config/v1/${this.issuerId}`, config);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update configuration: ${error}`);
    }
  }

  /**
   * Get investor information (basic KYC data)
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
   * Get detailed investor information
   */
  async getInvestorDetails(investorId: string): Promise<any> {
    try {
      const response = await this.client.get(`/investors/${investorId}/details`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch investor details: ${error}`);
    }
  }

  /**
   * Get verification information (KYC/KYB status)
   */
  async getVerificationInfo(investorId: string): Promise<any> {
    try {
      const response = await this.client.get(`/investors/${investorId}/verification`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch verification info: ${error}`);
    }
  }

  /**
   * Get investor documents
   */
  async getInvestorDocuments(investorId: string): Promise<any> {
    try {
      const response = await this.client.get(`/investors/${investorId}/documents`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch investor documents: ${error}`);
    }
  }

  /**
   * Get legal signers for entity investors
   */
  async getLegalSigners(investorId: string): Promise<any> {
    try {
      const response = await this.client.get(`/investors/${investorId}/legal-signers`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch legal signers: ${error}`);
    }
  }

  /**
   * Get verification details
   */
  async getVerificationDetails(investorId: string): Promise<any> {
    try {
      const response = await this.client.get(`/investors/${investorId}/verification-details`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch verification details: ${error}`);
    }
  }

  /**
   * Get investor wallets
   */
  async getInvestorWallets(investorId: string): Promise<any> {
    try {
      const response = await this.client.get(`/investors/${investorId}/wallets`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch investor wallets: ${error}`);
    }
  }

  /**
   * Register wallet for security token whitelisting
   */
  async registerWallet(investorId: string, walletData: {
    address: string;
    blockchain: string;
    tokenContract?: string;
  }): Promise<any> {
    try {
      const response = await this.client.post(`/investors/${investorId}/wallets`, walletData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to register wallet: ${error}`);
    }
  }

  /**
   * Get whitelisting status
   */
  async getWhitelistingStatus(investorId: string, tokenContract?: string): Promise<any> {
    try {
      const params = tokenContract ? { tokenContract } : {};
      const response = await this.client.get(`/investors/${investorId}/whitelisting`, { params });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch whitelisting status: ${error}`);
    }
  }

  /**
   * Request whitelisting for security tokens
   */
  async requestWhitelisting(investorId: string, whitelistingData: {
    tokenContract: string;
    blockchain: string;
    walletAddress: string;
  }): Promise<any> {
    try {
      const response = await this.client.post(`/investors/${investorId}/whitelisting`, whitelistingData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to request whitelisting: ${error}`);
    }
  }

  /**
   * Get whitelisted redirect URLs
   */
  async getWhitelistedRedirectUrls(): Promise<any> {
    try {
      const response = await this.client.get(`/config/v1/${this.issuerId}/redirect-urls`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch whitelisted redirect URLs: ${error}`);
    }
  }

  /**
   * Add whitelisted redirect URL
   */
  async addWhitelistedRedirectUrl(url: string): Promise<any> {
    try {
      const response = await this.client.post(`/config/v1/${this.issuerId}/redirect-urls`, { url });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to add whitelisted redirect URL: ${error}`);
    }
  }

  /**
   * Remove whitelisted redirect URL
   */
  async removeWhitelistedRedirectUrl(url: string): Promise<any> {
    try {
      const response = await this.client.delete(`/config/v1/${this.issuerId}/redirect-urls`, { 
        data: { url } 
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to remove whitelisted redirect URL: ${error}`);
    }
  }

  /**
   * Set access token manually (for testing or when token is obtained elsewhere)
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Set refresh token manually
   */
  setRefreshToken(token: string): void {
    this.refreshToken = token;
  }

  /**
   * Clear tokens (logout)
   */
  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Get current refresh token
   */
  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  /**
   * Get all available securities from Securitize
   */
  public async getSecurities(): Promise<any> {
    try {
      this.logger.log('Securitize Connect API Request: GET /securities');
      const response = await this.client.get('/securities');
      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch Securitize securities', error);
      // Return empty array on failure to prevent crashes
      return [];
    }
  }

  /**
   * Get a specific security by ID
   */
  async getSecurity(id: string): Promise<SecuritizeAsset> {
    try {
      const response = await this.client.get(`/securities/${id}`);
      return this.transformSecurityResponse(response.data);
    } catch (error) {
      throw new Error(`Failed to fetch Securitize security ${id}: ${error}`);
    }
  }

  /**
   * Get offering details
   */
  async getOffering(offeringId: string): Promise<any> {
    try {
      const response = await this.client.get(`/offerings/${offeringId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch offering ${offeringId}: ${error}`);
    }
  }

  /**
   * Get DS Token information
   */
  async getDSToken(dsTokenId: string): Promise<any> {
    try {
      const response = await this.client.get(`/ds-tokens/${dsTokenId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch DS Token ${dsTokenId}: ${error}`);
    }
  }

  /**
   * Get market data for a security
   */
  async getMarketData(securityId: string): Promise<any> {
    try {
      const response = await this.client.get(`/securities/${securityId}/market-data`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch market data for security ${securityId}: ${error}`);
    }
  }

  /**
   * Get trading history for a security
   */
  async getTradingHistory(securityId: string, params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<any> {
    try {
      const response = await this.client.get(`/securities/${securityId}/trading-history`, { params });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch trading history for security ${securityId}: ${error}`);
    }
  }

  /**
   * Transform Securitize API response to our standard format
   */
  private transformSecuritiesResponse(data: any): PaginatedResponse<SecuritizeAsset> {
    return {
      data: data.securities?.map((security: any) => this.transformSecurityResponse(security)) || [],
      pagination: {
        page: data.pagination?.page || 1,
        limit: data.pagination?.limit || 10,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 1,
      },
    };
  }

  /**
   * Transform individual security response
   */
  private transformSecurityResponse(security: any): SecuritizeAsset {
    return {
      id: security.id,
      name: security.name,
      symbol: security.symbol,
      description: security.description,
      platform: 'securitize',
      assetType: security.assetType as AssetType,
      tokenStandard: security.tokenStandard as TokenStandard,
      contractAddress: security.contractAddress,
      blockchain: security.blockchain,
      totalSupply: security.totalSupply,
      currentPrice: security.currentPrice,
      marketCap: security.marketCap,
      volume24h: security.volume24h,
      yield: security.yield,
      maturityDate: security.maturityDate,
      issuer: security.issuer,
      complianceStatus: security.complianceStatus as ComplianceStatus,
      kycRequired: security.kycRequired,
      minInvestment: security.minInvestment,
      maxInvestment: security.maxInvestment,
      imageUrl: security.imageUrl,
      website: security.website,
      whitepaper: security.whitepaper,
      createdAt: security.createdAt,
      updatedAt: '2024-08-01T12:00:00Z',
      dsTokenId: security.dsTokenId,
      offeringId: security.offeringId,
      jurisdiction: security.jurisdiction,
      regulatoryStatus: security.regulatoryStatus,
    };
  }

  /**
   * Map Securitize asset types to our standard types
   */
  private mapAssetType(secutitizeAssetType: string): string {
    const typeMap: { [key: string]: string } = {
      'real_estate': 'real-estate',
      'private_equity': 'private-equity',
      'venture_capital': 'venture-capital',
      'debt': 'debt',
      'commodities': 'commodities',
      'art': 'art',
    };
    return typeMap[secutitizeAssetType] || 'other';
  }

  /**
   * Map Securitize compliance status to our standard status
   */
  private mapComplianceStatus(secutitizeStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'verified': 'verified',
      'pending': 'pending',
      'rejected': 'rejected',
      'not_required': 'not-required',
    };
    return statusMap[secutitizeStatus] || 'pending';
  }

  /**
   * Get DS Protocol smart contract ABI
   */
  async getDSProtocolABI(): Promise<any[]> {
    // This would typically come from a contract registry or be hardcoded
    // For now, returning a basic ERC-1400 compatible ABI
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
      }
    ];
  }
} 