import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { ethers } from 'ethers';
import Header from '../components/Header';
import CrowdsourceCampaignList from '../components/CrowdsourceCampaignList';
import CrowdsourceCreateCampaign from '../components/CrowdsourceCreateCampaign';
import CrowdsourceCampaignDetail from '../components/CrowdsourceCampaignDetail';

// Contract ABIs - you'll need to import these from your compiled contracts
import CrowdfundFactoryABI from '../artifacts/contracts/CrowdfundFactory.sol/CrowdfundFactory.json';
import CampaignABI from '../artifacts/contracts/Campaign.sol/Campaign.json';
import ProjectTokenABI from '../artifacts/contracts/ProjectToken.sol/ProjectToken.json';

// Contract addresses (update these after deployment)
const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || '0x...'; // Update with deployed address

interface Campaign {
  address: string;
  title: string;
  description: string;
  goal: string;
  deadline: Date;
  totalRaised: string;
  tokenPrice: string;
  goalReached: boolean;
  fundsWithdrawn: boolean;
  campaignEnded: boolean;
  creator: string;
  tokenAddress: string;
}

const Crowdsource: NextPage = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [factoryContract, setFactoryContract] = useState<ethers.Contract | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
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
  const loadCampaigns = async (factory: ethers.Contract) => {
    try {
      setLoading(true);
      const campaignAddresses = await factory.getCampaigns();
      const campaignData: Campaign[] = [];
      
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
  const selectCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setCurrentView('detail');
  };

  // Navigation
  const navigateTo = (view: 'list' | 'create' | 'detail') => {
    setCurrentView(view);
    if (view !== 'detail') {
      setSelectedCampaign(null);
    }
  };

  // Check if wallet is connected on page load
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
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
    <div className="bg-gray-50 min-h-screen">
      <Head>
        <title>Crowdsource - BNB Crowdfunding | tokenboard</title>
        <meta name="description" content="Create and fund crowdfunding campaigns on BNB Chain" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              BNB Crowdfunding Platform
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Create and fund amazing projects on the BNB Chain
            </p>
            
            {!account ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
                <p className="text-gray-600 mb-6">Connect your wallet to start creating or funding campaigns</p>
                <button
                  onClick={connectWallet}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  Connect Wallet
                </button>
              </div>
            ) : (
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => navigateTo('list')}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                    currentView === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  View Campaigns
                </button>
                <button
                  onClick={() => navigateTo('create')}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                    currentView === 'create' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  Create Campaign
                </button>
              </div>
            )}
          </div>

          {/* Main Content */}
          {account && (
            <>
              {currentView === 'list' && (
                <CrowdsourceCampaignList
                  campaigns={campaigns}
                  loading={loading}
                  onCampaignSelect={selectCampaign}
                  onRefresh={refreshCampaigns}
                />
              )}
              
              {currentView === 'create' && (
                <CrowdsourceCreateCampaign
                  factoryContract={factoryContract}
                  onCampaignCreated={refreshCampaigns}
                  onBack={() => navigateTo('list')}
                />
              )}
              
              {currentView === 'detail' && selectedCampaign && (
                <CrowdsourceCampaignDetail
                  campaign={selectedCampaign}
                  account={account}
                  signer={signer}
                  onBack={() => navigateTo('list')}
                />
              )}
            </>
          )}

          {/* Info Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-xl">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Campaign</h3>
                <p className="text-gray-600">Set your funding goal, duration, and token details to launch your campaign</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-xl">2</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Receive Funding</h3>
                <p className="text-gray-600">Investors contribute BNB and receive project tokens in return</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-xl">3</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Withdraw Funds</h3>
                <p className="text-gray-600">If goal is reached, withdraw funds. If not, investors can claim refunds</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Crowdsource; 