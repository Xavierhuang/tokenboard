// Platform types
export type Platform = 'securitize' | 'polymath' | 'tzero' | 'harbor' | 'tokensoft' | 'texture' | 'centrifuge';

// Asset types
export type AssetType = 'real-estate' | 'private-equity' | 'venture-capital' | 'debt' | 'commodities' | 'art' | 'other';

// Compliance status
export type ComplianceStatus = 'verified' | 'pending' | 'rejected' | 'not-required';

// Token standards
export type TokenStandard = 'ERC-1400' | 'ERC-1404' | 'DS-Protocol' | 'R-Token' | 'ST-20';

// Asset interface
export interface TokenizedAsset {
  id: string;
  name: string;
  symbol: string;
  description: string;
  platform: Platform;
  assetType: AssetType;
  tokenStandard: TokenStandard;
  contractAddress: string;
  blockchain: string;
  totalSupply: number;
  currentPrice: number;
  marketCap: number;
  volume24h: number;
  yield?: number;
  maturityDate?: string;
  issuer: string;
  complianceStatus: ComplianceStatus;
  kycRequired: boolean;
  minInvestment: number;
  maxInvestment?: number;
  imageUrl?: string;
  website?: string;
  whitepaper?: string;
  createdAt: string;
  updatedAt: string;
  // Additional properties for filtering
  riskLevel?: 'low' | 'medium' | 'high';
  liquidity?: 'low' | 'medium' | 'high';
  regulatoryStatus?: string;
  region?: string;
}

// Platform-specific data
export interface SecuritizeAsset extends TokenizedAsset {
  platform: 'securitize';
  dsTokenId?: string;
  offeringId?: string;
  jurisdiction: string;
  regulatoryStatus: string;
}

export interface PolymathAsset extends TokenizedAsset {
  platform: 'polymath';
  ticker: string;
  securityType: string;
  dividendYield?: number;
}

export interface TZeroAsset extends TokenizedAsset {
  platform: 'tzero';
  atsId: string;
  tradingStatus: 'active' | 'suspended' | 'delisted';
}

// Portfolio interface
export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  description?: string;
  totalValue: number;
  totalReturn: number;
  totalReturnPercentage: number;
  assets: PortfolioAsset[];
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioAsset {
  assetId: string;
  quantity: number;
  averagePrice: number;
  currentValue: number;
  totalReturn: number;
  totalReturnPercentage: number;
  lastUpdated: string;
}

// Market data interface
export interface MarketData {
  assetId: string;
  price: number;
  change24h: number;
  change24hPercentage: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  timestamp: string;
}

// API response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter and search interfaces
export interface AssetFilters {
  platform?: Platform[];
  assetType?: AssetType[];
  tokenStandard?: TokenStandard[];
  complianceStatus?: ComplianceStatus[];
  minPrice?: number;
  maxPrice?: number;
  minYield?: number;
  maxYield?: number;
  blockchain?: string[];
  search?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  minInvestment?: number;
  region?: string;
  yieldRange?: string;
  liquidity?: 'low' | 'medium' | 'high';
  regulatoryStatus?: string;
}

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  kycStatus: ComplianceStatus;
  walletAddresses: string[];
  portfolios: Portfolio[];
  createdAt: string;
  updatedAt: string;
}

// Compliance interface
export interface ComplianceData {
  userId: string;
  kycStatus: ComplianceStatus;
  amlStatus: ComplianceStatus;
  accreditedInvestor: boolean;
  jurisdiction: string;
  documents: ComplianceDocument[];
  lastVerified: string;
}

export interface ComplianceDocument {
  id: string;
  type: 'passport' | 'drivers-license' | 'utility-bill' | 'bank-statement' | 'accreditation';
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  verifiedAt?: string;
}

// Smart contract interfaces
export interface SmartContract {
  address: string;
  blockchain: string;
  standard: TokenStandard;
  abi: any[];
  functions: ContractFunction[];
  events: ContractEvent[];
}

export interface ContractFunction {
  name: string;
  inputs: ContractParameter[];
  outputs: ContractParameter[];
  stateMutability: 'pure' | 'view' | 'nonpayable' | 'payable';
}

export interface ContractParameter {
  name: string;
  type: string;
  indexed?: boolean;
}

export interface ContractEvent {
  name: string;
  inputs: ContractParameter[];
  anonymous: boolean;
} 