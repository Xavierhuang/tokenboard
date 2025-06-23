import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import WalletConnect from './components/WalletConnect';
import CreateCampaign from './components/CreateCampaign';
import CampaignList from './components/CampaignList';
import CampaignDetail from './components/CampaignDetail';
import { Wallet, Plus, Home, Users } from 'lucide-react';

// Contract ABIs (you'll need to import these from your compiled contracts)
import CrowdfundFactoryABI from '../artifacts/contracts/CrowdfundFactory.sol/CrowdfundFactory.json';
import CampaignABI from '../artifacts/contracts/Campaign.sol/Campaign.json';
import ProjectTokenABI from '../artifacts/contracts/ProjectToken.sol/ProjectToken.json';

// Contract addresses (update these after deployment)
const FACTORY_ADDRESS = process.env.REACT_APP_FACTORY_ADDRESS || '0x...'; // Update with deployed address

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [factoryContract, setFactoryContract] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        
        setProvider(provider);
        setSigner(signer);
        setAccount(accounts[0]);
        
        // Initialize factory contract
        const factory = new ethers.Contract(FACTORY_ADDRESS, CrowdfundFactoryABI.abi, signer);
        setFactoryContract(factory);
        
        // Load campaigns
        loadCampaigns(factory);
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet');
    }
  };

  // Load all campaigns
  const loadCampaigns = async (factory) => {
    try {
      setLoading(true);
      const campaignAddresses = await factory.getCampaigns();
      const campaignData = [];
      
      for (const address of campaignAddresses) {
        try {
          const info = await factory.getCampaignInfo(address);
          campaignData.push({
            address,
            title: info.title,
            description: info.description,
            goal: ethers.formatEther(info.goal),
            deadline: new Date(info.deadline * 1000),
            totalRaised: ethers.formatEther(info.totalRaised),
            tokenPrice: ethers.formatEther(info.tokenPrice),
            goalReached: info.goalReached,
            fundsWithdrawn: info.fundsWithdrawn,
            campaignEnded: info.campaignEnded,
            creator: info.creator,
            tokenAddress: info.tokenAddress
          });
        } catch (error) {
          console.error(`Error loading campaign ${address}:`, error);
        }
      }
      
      setCampaigns(campaignData);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh campaigns after creating a new one
  const refreshCampaigns = () => {
    if (factoryContract) {
      loadCampaigns(factoryContract);
    }
  };

  // Handle campaign selection
  const selectCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setCurrentView('detail');
  };

  // Navigation
  const navigateTo = (view) => {
    setCurrentView(view);
    if (view !== 'detail') {
      setSelectedCampaign(null);
    }
  };

  // Check if wallet is connected on page load
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
          setProvider(null);
          setSigner(null);
          setFactoryContract(null);
        }
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">BNB Crowdfunding</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {account ? (
                <>
                  <nav className="flex space-x-4">
                    <button
                      onClick={() => navigateTo('home')}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                        currentView === 'home' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Home className="w-4 h-4 mr-1" />
                      Home
                    </button>
                    <button
                      onClick={() => navigateTo('create')}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                        currentView === 'create' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Create Campaign
                    </button>
                  </nav>
                  <div className="flex items-center space-x-2">
                    <Wallet className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </span>
                  </div>
                </>
              ) : (
                <WalletConnect onConnect={connectWallet} />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!account ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to BNB Crowdfunding</h2>
            <p className="text-gray-600 mb-6">Connect your wallet to start funding amazing projects</p>
            <WalletConnect onConnect={connectWallet} />
          </div>
        ) : (
          <>
            {currentView === 'home' && (
              <CampaignList
                campaigns={campaigns}
                loading={loading}
                onCampaignSelect={selectCampaign}
                onRefresh={refreshCampaigns}
              />
            )}
            
            {currentView === 'create' && (
              <CreateCampaign
                factoryContract={factoryContract}
                onCampaignCreated={refreshCampaigns}
                onBack={() => navigateTo('home')}
              />
            )}
            
            {currentView === 'detail' && selectedCampaign && (
              <CampaignDetail
                campaign={selectedCampaign}
                account={account}
                signer={signer}
                onBack={() => navigateTo('home')}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App; 