# Tokenized Assets Aggregator

A comprehensive aggregator for tokenized real-world assets from multiple platforms including Securitize, Polymath, tZERO, and others.

## Features

- **Multi-Platform Integration**: Aggregate data from major tokenization platforms
- **Real-Time Data**: Live pricing and market data
- **Portfolio Management**: Track investments across platforms
- **Compliance Monitoring**: KYC/AML status and regulatory compliance
- **Analytics Dashboard**: Performance metrics and market insights
- **Wallet Integration**: Connect multiple wallets and track holdings

## Supported Platforms

### Primary Platforms
- **Securitize**: Digital securities and compliance platform
- **Polymath**: ST-20 tokens and Polymesh blockchain
- **tZERO**: Alternative Trading System for digital securities
- **Harbor**: R-Token compliant tokenization
- **TokenSoft**: Tokenization platform with compliance tools

### Blockchain Networks
- Ethereum (ERC-1400, ERC-1404)
- Polymesh
- Polygon
- Avalanche
- Other EVM-compatible chains

## APIs and Smart Contracts

### Securitize Integration
- **Securitize API**: Access to tokenized securities data
- **DS Protocol**: Digital Securities Protocol smart contracts
- **Compliance API**: KYC/AML verification

### Smart Contract Standards
- **ERC-1400**: Security token standard
- **ERC-1404**: Restricted token standard
- **DS Protocol**: Digital Securities Protocol
- **R-Token**: Harbor's compliant token standard
- **ST-20**: Polymath security token standard

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# API Keys
SECURITIZE_API_KEY=your_secutitize_api_key
POLYMATH_API_KEY=your_polymath_api_key
TZERO_API_KEY=your_tzero_api_key

# Blockchain RPC URLs
ETHEREUM_RPC_URL=your_ethereum_rpc_url
POLYGON_RPC_URL=your_polygon_rpc_url
POLYMESH_RPC_URL=your_polymesh_rpc_url

# Database
DATABASE_URL=your_database_url

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

## Project Structure

```
├── components/          # React components
├── pages/              # Next.js pages
├── lib/                # Utility functions and API clients
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── styles/             # CSS and styling
└── public/             # Static assets
```

## API Documentation

### Securitize API
- **Base URL**: `https://api.securitize.io`
- **Authentication**: API Key in headers
- **Endpoints**:
  - `/v1/securities` - List available securities
  - `/v1/securities/{id}` - Get security details
  - `/v1/investors` - Investor information
  - `/v1/compliance` - Compliance status

### Smart Contract Integration
- **ERC-1400**: Standard for security tokens
- **DS Protocol**: Securitize's digital securities protocol
- **Polymesh**: Enterprise-grade blockchain for regulated assets

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue on GitHub or contact the development team. # tokenboard
