import { ethers } from 'ethers';

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

// PYUSD Contract Addresses (Ethereum Mainnet)
const PYUSD_CONTRACT_ADDRESS = '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8';
const PYUSD_DECIMALS = 6; // PYUSD has 6 decimal places

// PYUSD ABI (simplified for basic operations)
const PYUSD_ABI = [
  // Read functions
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
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
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
    "constant": true,
    "inputs": [
      {"name": "_owner", "type": "address"},
      {"name": "_spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  // Write functions
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
    "constant": false,
    "inputs": [
      {"name": "_spender", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_from", "type": "address"},
      {"name": "_to", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "transferFrom",
    "outputs": [{"name": "", "type": "bool"}],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "from", "type": "address"},
      {"indexed": true, "name": "to", "type": "address"},
      {"indexed": false, "name": "value", "type": "uint256"}
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "owner", "type": "address"},
      {"indexed": true, "name": "spender", "type": "address"},
      {"indexed": false, "name": "value", "type": "uint256"}
    ],
    "name": "Approval",
    "type": "event"
  }
];

export interface PYUSDTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  blockNumber: number;
  gasUsed: string;
  gasPrice: string;
}

export interface PYUSDBalance {
  balance: string;
  formatted: string;
  decimals: number;
}

// Add this mapping for supported networks
const NETWORKS = {
  mainnet: {
    chainId: 1,
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY',
    contract: '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8',
  },
  sepolia: {
    chainId: 11155111,
    rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY',
    contract: '0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9',
  },
  // add more if needed
};

export class PYUSDService {
  private provider: ethers.BrowserProvider | ethers.JsonRpcProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private isConnected: boolean = false;
  private contractAddress: string = '';

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      const network = await this.provider.getNetwork();
      console.log('Connected to network:', network);
      if (network.chainId === NETWORKS.sepolia.chainId) {
        this.contractAddress = NETWORKS.sepolia.contract;
      } else {
        this.contractAddress = NETWORKS.mainnet.contract;
      }
    } else {
      // fallback to Sepolia for dev
      this.provider = new ethers.JsonRpcProvider(NETWORKS.sepolia.rpcUrl);
      this.contractAddress = NETWORKS.sepolia.contract;
    }
  }

  async connectWallet(): Promise<boolean> {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('MetaMask connection successful! Accounts:', accounts);
      }
      if (!this.provider) {
        await this.initializeProvider();
      }

      if (!this.provider) {
        throw new Error('No provider available');
      }

      // Request account access
      this.signer = await this.provider.getSigner();
      const address = await this.signer.getAddress();
      
      // Initialize PYUSD contract
      this.contract = new ethers.Contract(this.contractAddress, PYUSD_ABI, this.signer);
      
      this.isConnected = true;
      console.log('PYUSD: Wallet connected:', address);
      return true;
    } catch (error) {
      console.error('PYUSD: Failed to connect wallet:', error);
      return false;
    }
  }

  async disconnectWallet(): Promise<void> {
    this.signer = null;
    this.contract = null;
    this.isConnected = false;
    console.log('PYUSD: Wallet disconnected');
  }

  async getBalance(address?: string): Promise<PYUSDBalance> {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      const targetAddress = address || (this.signer ? await this.signer.getAddress() : null);
      if (!targetAddress) {
        throw new Error('No address provided or wallet not connected');
      }

      const contract = new ethers.Contract(this.contractAddress, PYUSD_ABI, this.provider);
      const balance = await contract.balanceOf(targetAddress);
      const decimals = await contract.decimals();
      
      const formatted = ethers.formatUnits(balance, decimals);
      
      return {
        balance: balance.toString(),
        formatted,
        decimals: Number(decimals)
      };
    } catch (error) {
      console.error('PYUSD: Failed to get balance:', error);
      throw error;
    }
  }

  async transfer(to: string, amount: string): Promise<ethers.ContractTransactionResponse> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Wallet not connected');
      }

      const amountWei = ethers.parseUnits(amount, PYUSD_DECIMALS);
      const tx = await this.contract.transfer(to, amountWei);
      
      console.log('PYUSD: Transfer initiated:', tx.hash);
      return tx;
    } catch (error) {
      console.error('PYUSD: Transfer failed:', error);
      throw error;
    }
  }

  async approve(spender: string, amount: string): Promise<ethers.ContractTransactionResponse> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Wallet not connected');
      }

      const amountWei = ethers.parseUnits(amount, PYUSD_DECIMALS);
      const tx = await this.contract.approve(spender, amountWei);
      
      console.log('PYUSD: Approval initiated:', tx.hash);
      return tx;
    } catch (error) {
      console.error('PYUSD: Approval failed:', error);
      throw error;
    }
  }

  async getAllowance(owner: string, spender: string): Promise<string> {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      const contract = new ethers.Contract(this.contractAddress, PYUSD_ABI, this.provider);
      const allowance = await contract.allowance(owner, spender);
      
      return ethers.formatUnits(allowance, PYUSD_DECIMALS);
    } catch (error) {
      console.error('PYUSD: Failed to get allowance:', error);
      throw error;
    }
  }

  async getTransactionHistory(address: string, limit: number = 10): Promise<PYUSDTransaction[]> {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      // Get recent blocks
      const currentBlock = await this.provider.getBlockNumber();
      const transactions: PYUSDTransaction[] = [];
      
      // Get transfer events for the address
      const contract = new ethers.Contract(this.contractAddress, PYUSD_ABI, this.provider);
      const filter = contract.filters.Transfer(null, null, null);
      
      // Get events from recent blocks
      const events = await contract.queryFilter(filter, currentBlock - 10000, currentBlock);
      
      for (const event of events) {
        // Type guard to check if event has args
        if ('args' in event && event.args) {
          const args = event.args as any[];
          if (args[0] === address || args[1] === address) {
            const block = await event.getBlock();
            const receipt = await event.getTransactionReceipt();
            
            transactions.push({
              hash: event.transactionHash,
              from: args[0],
              to: args[1],
              value: ethers.formatUnits(args[2], PYUSD_DECIMALS),
              timestamp: block?.timestamp || 0,
              blockNumber: event.blockNumber,
              gasUsed: receipt?.gasUsed?.toString() || '0',
              gasPrice: receipt?.gasPrice?.toString() || '0'
            });
          }
        }
      }
      
      // Sort by timestamp (newest first) and limit results
      return transactions
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
    } catch (error) {
      console.error('PYUSD: Failed to get transaction history:', error);
      throw error;
    }
  }

  async getContractInfo(): Promise<{
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
  }> {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      const contract = new ethers.Contract(this.contractAddress, PYUSD_ABI, this.provider);
      
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply()
      ]);
      
      return {
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: ethers.formatUnits(totalSupply, Number(decimals))
      };
    } catch (error) {
      console.error('PYUSD: Failed to get contract info:', error);
      throw error;
    }
  }

  isWalletConnected(): boolean {
    return this.isConnected;
  }

  async getConnectedAddress(): Promise<string | null> {
    return this.signer ? await this.signer.getAddress() : null;
  }
}

// Export singleton instance
export const pyusdService = new PYUSDService(); 