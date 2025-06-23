# BNB Chain Crowdfunding Platform

This is a decentralized crowdfunding platform built on the BNB Chain (BSC) that allows users to create and fund campaigns using BNB.

## Features

- **Create Campaigns**: Set funding goals, duration, and token details
- **Contribute**: Invest BNB and receive project tokens
- **Smart Contracts**: Automated fund management and token distribution
- **Refund System**: Automatic refunds if goals aren't met
- **Token Integration**: ERC-20 tokens for each campaign
- **BNB Chain**: Fast and low-cost transactions

## Smart Contracts

### CrowdfundFactory
- Deploys new campaigns and manages the campaign registry
- Tracks all deployed campaigns
- Provides campaign information

### Campaign
- Manages individual crowdfunding campaigns
- Handles contributions and token distribution
- Implements refund logic
- Controls fund withdrawal

### ProjectToken
- ERC-20 tokens for each campaign
- Minted when users contribute
- Can be traded or held as project equity

## Quick Start

### 1. Prerequisites
- Node.js 16+ and npm
- MetaMask wallet with BNB
- BSC testnet/mainnet access

### 2. Installation
```bash
# Install dependencies
npm install

# Install Hardhat (if not already installed)
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

### 3. Environment Setup

#### For Local Development:
```bash
# Copy environment template for local development
cp env.example .env.local

# Add your configuration to .env.local
BSC_RPC_URL=https://bsc-dataseed1.binance.org/
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
PRIVATE_KEY=your_private_key_here
NEXT_PUBLIC_FACTORY_ADDRESS=your_deployed_factory_address_here
BSCSCAN_API_KEY=your_bscscan_api_key_here
```

#### For Production Deployment:
```bash
# Copy environment template for production
cp env.example .env

# Add your production configuration to .env
BSC_RPC_URL=https://bsc-dataseed1.binance.org/
PRIVATE_KEY=your_production_private_key_here
NEXT_PUBLIC_FACTORY_ADDRESS=your_production_factory_address_here
BSCSCAN_API_KEY=your_bscscan_api_key_here
```

**Note**: 
- `.env.local` is for local development and is gitignored
- `.env` is for production deployment
- Never commit private keys to version control

### 4. Deploy Contracts

#### To BSC Testnet (Recommended for testing):
```bash
# Compile contracts
npx hardhat compile

# Deploy to testnet
npx hardhat run scripts/deploy-bnb.js --network bscTestnet
```

#### To BSC Mainnet:
```bash
# Deploy to mainnet
npx hardhat run scripts/deploy-bnb.js --network bsc
```

### 5. Update Configuration
After deployment, update your environment file:
```env
NEXT_PUBLIC_FACTORY_ADDRESS=your_deployed_factory_address
```

### 6. Start the Application
```bash
# For development
npm run dev

# For production
npm run build
npm start
```

Visit `http://localhost:3000/crowdsource` to access the crowdfunding platform.

## How It Works

### For Campaign Creators

1. **Connect Wallet**: Use MetaMask to connect your BSC wallet
2. **Create Campaign**: 
   - Set campaign title and description
   - Define funding goal in BNB
   - Set campaign duration in days
   - Configure token price and details
3. **Launch**: Campaign goes live and accepts contributions
4. **Withdraw**: If goal is reached, withdraw funds after campaign ends

### For Contributors

1. **Browse Campaigns**: View all active campaigns
2. **Select Campaign**: Click on a campaign to see details
3. **Contribute**: Send BNB to contribute
4. **Receive Tokens**: Get project tokens automatically
5. **Claim Refund**: If goal isn't met, claim your BNB back

## Smart Contract Functions

### CrowdfundFactory
```solidity
function createCampaign(
    string memory title,
    string memory description,
    uint256 goal,
    uint256 duration,
    uint256 tokenPrice,
    string memory tokenName,
    string memory tokenSymbol
) external returns (address campaignAddress, address tokenAddress)

function getCampaigns() external view returns (address[] memory)
function getCampaignInfo(address campaignAddress) external view returns (...)
```

### Campaign
```solidity
function contribute() external payable
function withdrawFunds() external
function claimRefund() external
function getCampaignInfo() external view returns (...)
```

## Security Features

- **Reentrancy Protection**: Prevents reentrancy attacks
- **Ownership Controls**: Only creators can withdraw funds
- **Automatic Refunds**: Failed campaigns automatically allow refunds
- **Token Burning**: Refunds burn corresponding tokens
- **Pausable**: Emergency pause functionality

## Gas Optimization

- Optimized Solidity compiler settings
- Efficient storage patterns
- Minimal external calls
- Batch operations where possible

## Testing

```bash
# Run tests
npx hardhat test

# Run specific test file
npx hardhat test test/Crowdfunding.test.js
```

## Deployment Addresses

### BSC Testnet
- Factory: `0x...` (Update after deployment)
- Network: BSC Testnet (Chain ID: 97)

### BSC Mainnet
- Factory: `0x...` (Update after deployment)
- Network: BSC Mainnet (Chain ID: 56)

## Troubleshooting

### Common Issues

1. **"Insufficient funds"**
   - Ensure your wallet has enough BNB for gas fees
   - BSC testnet requires test BNB from faucet

2. **"Contract not found"**
   - Verify the factory address is correct
   - Check if contracts are deployed to the correct network

3. **"Transaction failed"**
   - Check gas limits and prices
   - Ensure campaign is still active
   - Verify contribution amount is valid

### Getting Test BNB

For BSC Testnet:
- Visit [BSC Testnet Faucet](https://testnet.binance.org/faucet-smart)
- Enter your wallet address
- Receive test BNB

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Open an issue on GitHub
- Check the documentation
- Review the smart contract code

## Roadmap

- [ ] Multi-token support (USDT, BUSD)
- [ ] Campaign categories and tags
- [ ] Social features and comments
- [ ] Advanced analytics dashboard
- [ ] Mobile app
- [ ] Integration with other DeFi protocols 