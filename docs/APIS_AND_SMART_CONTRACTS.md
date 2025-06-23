# APIs and Smart Contracts for Tokenized Assets Aggregation

This document provides a comprehensive guide to the APIs and smart contracts you should integrate for building a tokenized assets aggregator.

## 1. Securitize iD v2 Integration

### API Overview
Securitize iD v2 is the authentication and identity management platform for Securitize. It provides OAuth-based authentication and investor management capabilities.

**Base URLs**:
- **Production**: `https://id.securitize.io` (ID), `https://connect-gw.securitize.io/api` (API Gateway)
- **Sandbox**: `https://id.sandbox.securitize.io` (ID), `https://connect-gw.sandbox.securitize.io/api` (API Gateway)

### Configuration Required
```env
SECURITIZE_ISSUER_ID=your_issuer_id_here
SECURITIZE_SECRET=your_secret_here
SECURITIZE_REDIRECT_URL=https://your-domain.com/auth/callback
SECURITIZE_ENVIRONMENT=sandbox
```

### Key Endpoints

#### Authentication
- `POST /auth/v1/authorize` - Exchange authorization code for access token
- `POST /auth/v1/refresh` - Refresh access token using refresh token

#### Configuration
- `GET /config/v1/{issuerId}` - Get issuer configuration
- `PATCH /config/v1/{issuerId}` - Update issuer configuration

#### Investors
- `GET /investors/{id}` - Get investor information
- `GET /investors/{id}/details` - Get detailed investor information
- `POST /investors/{id}/verify` - Verify investor
- `GET /investors/{id}/compliance` - Get compliance status

#### Wallets
- `POST /investors/{id}/wallets` - Register wallet to blockchain
- `GET /investors/{id}/wallets` - Get investor wallets

### OAuth Flow
1. **Redirect to Securitize**: User clicks "Login with Securitize"
2. **Authorization**: User authenticates on Securitize platform
3. **Callback**: Securitize redirects back with authorization code
4. **Token Exchange**: Exchange code for access token
5. **API Access**: Use access token for subsequent API calls

### Authentication Headers
```bash
Authorization: Bearer YOUR_ACCESS_TOKEN
clientid: YOUR_ISSUER_ID
Content-Type: application/json
```

### Smart Contracts: DS Protocol

Securitize uses the **DS Protocol** (Digital Securities Protocol) which is built on top of ERC-1400 standard.

#### Key Contract Functions
```solidity
// Get token name
function name() external view returns (string memory);

// Get token symbol
function symbol() external view returns (string memory);

// Get total supply
function totalSupply() external view returns (uint256);

// Get balance of address
function balanceOf(address _owner) external view returns (uint256);

// Transfer tokens
function transfer(address _to, uint256 _value) external returns (bool);

// Check if transfer is allowed
function canTransfer(address _from, address _to, uint256 _value) external view returns (bool);
```

## 2. Polymath Integration

### API Overview
Polymath provides the ST-20 token standard and operates on the Polymesh blockchain.

**Base URL**: `https://api.polymath.network/v1`

### Key Endpoints

#### Security Tokens
- `GET /security-tokens` - List all security tokens
- `GET /security-tokens/{id}` - Get specific token details
- `GET /security-tokens/ticker/{ticker}` - Get token by ticker
- `GET /security-tokens/{id}/market-data` - Get market data

#### STOs (Security Token Offerings)
- `GET /stos/{id}` - Get STO details
- `GET /polymesh/{id}` - Get Polymesh blockchain data

### Smart Contracts: ST-20 Standard

ST-20 is Polymath's security token standard built on Polymesh.

#### Key Contract Functions
```solidity
// Basic ERC-20 functions
function name() external view returns (string memory);
function symbol() external view returns (string memory);
function totalSupply() external view returns (uint256);
function balanceOf(address _owner) external view returns (uint256);

// ST-20 specific functions
function getTokensByPartition(address _owner) external view returns (bytes32[] memory);
function transferByPartition(bytes32 _partition, address _to, uint256 _value) external returns (bytes32);
```

## 3. tZERO Integration

### API Overview
tZERO operates an Alternative Trading System (ATS) for digital securities.

**Base URL**: `https://api.tzero.com/v1`

### Key Endpoints
- `GET /securities` - List available securities
- `GET /securities/{id}` - Get security details
- `GET /trading/{id}` - Get trading data
- `GET /orders` - Get order book

### Smart Contracts
tZERO uses ERC-1400 compatible tokens with additional trading functionality.

## 4. Harbor Integration

### API Overview
Harbor provides the R-Token standard for compliant tokenization.

**Base URL**: `https://api.harbor.com/v1`

### Smart Contracts: R-Token Standard

R-Token is Harbor's compliant token standard.

#### Key Features
- Built-in compliance checks
- Transfer restrictions
- KYC/AML integration
- Accredited investor verification

## 5. TokenSoft Integration

### API Overview
TokenSoft provides tokenization platform with compliance tools.

**Base URL**: `https://api.tokensoft.io/v1`

### Key Endpoints
- `GET /tokens` - List tokens
- `GET /tokens/{id}` - Get token details
- `GET /compliance` - Get compliance data

## 6. Smart Contract Standards

### ERC-1400 (Security Token Standard)
The most widely adopted security token standard on Ethereum.

#### Key Functions
```solidity
interface IERC1400 {
    // Core functions
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function totalSupply() external view returns (uint256);
    function balanceOf(address _owner) external view returns (uint256);
    
    // Transfer functions
    function transfer(address _to, uint256 _value) external returns (bool);
    function transferFrom(address _from, address _to, uint256 _value) external returns (bool);
    
    // Security token specific
    function canTransfer(address _from, address _to, uint256 _value) external view returns (bool);
    function canTransferFrom(address _from, address _to, uint256 _value) external view returns (bool);
    
    // Partition functions
    function balanceOfByPartition(bytes32 _partition, address _owner) external view returns (uint256);
    function partitionsOf(address _owner) external view returns (bytes32[] memory);
}
```

### ERC-1404 (Restricted Token Standard)
Simpler standard for tokens with transfer restrictions.

#### Key Functions
```solidity
interface IERC1404 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function totalSupply() external view returns (uint256);
    function balanceOf(address _owner) external view returns (uint256);
    function transfer(address _to, uint256 _value) external returns (bool);
    
    // Restriction functions
    function detectTransferRestriction(address _from, address _to, uint256 _value) external view returns (uint8);
    function messageForTransferRestriction(uint8 _restrictionCode) external view returns (string memory);
}
```

## 7. Blockchain Networks

### Ethereum Mainnet
- **RPC URL**: `https://mainnet.infura.io/v3/YOUR_PROJECT_ID`
- **Chain ID**: 1
- **Token Standards**: ERC-1400, ERC-1404, DS Protocol

### Polygon
- **RPC URL**: `https://polygon-rpc.com`
- **Chain ID**: 137
- **Token Standards**: ERC-1400, ERC-1404

### Polymesh
- **RPC URL**: `https://polymesh-rpc.com`
- **Chain ID**: 1139
- **Token Standards**: ST-20

### Avalanche
- **RPC URL**: `https://api.avax.network/ext/bc/C/rpc`
- **Chain ID**: 43114
- **Token Standards**: ERC-1400, ERC-1404

## 8. Implementation Strategy

### Phase 1: Core Integration
1. **Securitize iD v2** - Start with authentication and investor management
2. **Polymath API** - Add ST-20 token support
3. **Basic Smart Contract Integration** - Read token data from contracts

### Phase 2: Extended Platform Support
1. **tZERO Integration** - Add ATS trading data
2. **Harbor Integration** - Add R-Token support
3. **TokenSoft Integration** - Expand compliance features

### Phase 3: Advanced Features
1. **Real-time Data** - WebSocket connections for live updates
2. **Portfolio Management** - Track user holdings across platforms
3. **Compliance Monitoring** - KYC/AML status tracking
4. **Trading Integration** - Execute trades through platform APIs

## 9. API Rate Limits and Best Practices

### Rate Limits
- **Securitize iD v2**: 1000 requests/hour
- **Polymath**: 500 requests/hour
- **tZERO**: 2000 requests/hour
- **Harbor**: 1000 requests/hour
- **TokenSoft**: 500 requests/hour

### Best Practices
1. **Caching**: Cache API responses for 5-15 minutes
2. **Error Handling**: Implement exponential backoff for failed requests
3. **Monitoring**: Track API usage and errors
4. **Fallbacks**: Use multiple data sources when possible
5. **Token Management**: Implement proper OAuth token refresh logic

## 10. Security Considerations

### API Security
- Store API keys and secrets securely (use environment variables)
- Implement proper OAuth flow with PKCE for public clients
- Use HTTPS for all API calls
- Validate all API responses
- Implement proper token storage and refresh mechanisms

### Smart Contract Security
- Verify contract addresses before interaction
- Use audited contract ABIs
- Implement proper error handling
- Test on testnets before mainnet

## 11. Getting Started

### 1. Obtain API Credentials
- [Securitize Developer Portal](https://developers.securitize.io) - Get issuer ID and secret
- [Polymath Developer Portal](https://developers.polymath.network)
- [tZERO Developer Portal](https://developers.tzero.com)
- [Harbor Developer Portal](https://developers.harbor.com)
- [TokenSoft Developer Portal](https://developers.tokensoft.io)

### 2. Set Up Environment
```bash
# Copy environment template
cp env.example .env.local

# Add your Securitize credentials
SECURITIZE_ISSUER_ID=your_issuer_id_here
SECURITIZE_SECRET=your_secret_here
SECURITIZE_REDIRECT_URL=https://your-domain.com/auth/callback
SECURITIZE_ENVIRONMENT=sandbox

# Add other API keys
POLYMATH_API_KEY=your_polymath_api_key_here
# ... add other keys
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

## 12. Additional Resources

### Documentation
- [Securitize iD v2 API Docs](https://docs.securitize.io)
- [Polymath API Docs](https://docs.polymath.network)
- [ERC-1400 Standard](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1400.md)
- [ERC-1404 Standard](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1404.md)

### Community
- [Securitize Community](https://community.securitize.io)
- [Polymath Community](https://community.polymath.network)
- [Security Token Forum](https://securitytokenforum.com)

### Tools
- [Etherscan](https://etherscan.io) - Ethereum blockchain explorer
- [Polygonscan](https://polygonscan.com) - Polygon blockchain explorer
- [Polymesh Explorer](https://explorer.polymesh.live) - Polymesh blockchain explorer 