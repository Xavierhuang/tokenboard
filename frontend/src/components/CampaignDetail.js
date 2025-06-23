import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ArrowLeft, Send, Download, Calendar, Target, TrendingUp, Users, CheckCircle, XCircle, Clock } from 'lucide-react';

const CampaignDetail = ({ campaign, account, signer, onBack }) => {
  const [contributionAmount, setContributionAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userContribution, setUserContribution] = useState('0');
  const [userTokens, setUserTokens] = useState('0');
  const [campaignContract, setCampaignContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);

  // Contract ABIs (you'll need to import these)
  const CampaignABI = []; // Add your Campaign ABI here
  const ProjectTokenABI = []; // Add your ProjectToken ABI here

  useEffect(() => {
    if (signer && campaign.address) {
      const campaignContract = new ethers.Contract(campaign.address, CampaignABI, signer);
      const tokenContract = new ethers.Contract(campaign.tokenAddress, ProjectTokenABI, signer);
      
      setCampaignContract(campaignContract);
      setTokenContract(tokenContract);
      
      loadUserData(campaignContract, tokenContract);
    }
  }, [signer, campaign]);

  const loadUserData = async (campaignContract, tokenContract) => {
    try {
      const contribution = await campaignContract.getContribution(account);
      const tokens = await tokenContract.balanceOf(account);
      
      setUserContribution(ethers.formatEther(contribution));
      setUserTokens(ethers.formatEther(tokens));
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
        throw new Error('Please enter a valid contribution amount');
      }

      const amount = ethers.parseEther(contributionAmount);
      
      const tx = await campaignContract.contribute({ value: amount });
      await tx.wait();

      setSuccess(`Successfully contributed ${contributionAmount} BNB!`);
      setContributionAmount('');
      
      // Reload user data
      loadUserData(campaignContract, tokenContract);
      
      // Refresh campaign data (you might want to add a callback for this)
    } catch (error) {
      console.error('Error contributing:', error);
      setError(error.message || 'Failed to contribute');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawFunds = async () => {
    if (!campaignContract) return;
    
    setLoading(true);
    setError('');
    
    try {
      const tx = await campaignContract.withdrawFunds();
      await tx.wait();
      setSuccess('Funds withdrawn successfully!');
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      setError(error.message || 'Failed to withdraw funds');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRefund = async () => {
    if (!campaignContract) return;
    
    setLoading(true);
    setError('');
    
    try {
      const tx = await campaignContract.claimRefund();
      await tx.wait();
      setSuccess('Refund claimed successfully!');
      loadUserData(campaignContract, tokenContract);
    } catch (error) {
      console.error('Error claiming refund:', error);
      setError(error.message || 'Failed to claim refund');
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = () => {
    const percentage = (parseFloat(campaign.totalRaised) / parseFloat(campaign.goal)) * 100;
    return Math.min(percentage, 100);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isCreator = account === campaign.creator;
  const isActive = !campaign.campaignEnded && new Date() < campaign.deadline;
  const canWithdraw = isCreator && campaign.goalReached && !campaign.fundsWithdrawn && !isActive;
  const canClaimRefund = !campaign.goalReached && parseFloat(userContribution) > 0 && !isActive;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Campaign Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About this project</h2>
            <p className="text-gray-700 leading-relaxed">{campaign.description}</p>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Campaign Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Target className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Funding Goal</p>
                  <p className="font-medium">{parseFloat(campaign.goal).toFixed(4)} BNB</p>
                </div>
              </div>
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Total Raised</p>
                  <p className="font-medium">{parseFloat(campaign.totalRaised).toFixed(4)} BNB</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Deadline</p>
                  <p className="font-medium">{formatDate(campaign.deadline)}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Creator</p>
                  <p className="font-medium">{formatAddress(campaign.creator)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="card">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
              <span className="text-sm text-gray-600">{getProgressPercentage().toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div
                className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{parseFloat(campaign.totalRaised).toFixed(4)} BNB raised</span>
              <span>Goal: {parseFloat(campaign.goal).toFixed(4)} BNB</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contribution Form */}
          {isActive && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contribute</h3>
              <form onSubmit={handleContribute} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (BNB)
                  </label>
                  <input
                    type="number"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    className="input-field"
                    placeholder="0.01"
                    step="0.001"
                    min="0"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Contributing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Contribute
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* User Info */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Activity</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Your Contribution:</span>
                <span className="font-medium">{parseFloat(userContribution).toFixed(4)} BNB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tokens Received:</span>
                <span className="font-medium">{parseFloat(userTokens).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Campaign Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              {canWithdraw && (
                <button
                  onClick={handleWithdrawFunds}
                  className="btn-primary w-full flex items-center justify-center"
                  disabled={loading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Withdraw Funds
                </button>
              )}
              
              {canClaimRefund && (
                <button
                  onClick={handleClaimRefund}
                  className="btn-secondary w-full flex items-center justify-center"
                  disabled={loading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Claim Refund
                </button>
              )}
            </div>
          </div>

          {/* Token Info */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Token Price:</span>
                <span className="font-medium">{parseFloat(campaign.tokenPrice).toFixed(6)} BNB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Token Address:</span>
                <span className="font-mono text-xs">{formatAddress(campaign.tokenAddress)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail; 