import React from 'react';
import { ethers } from 'ethers';
import { RefreshCw, Calendar, Target, Users, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';

const CampaignList = ({ campaigns, loading, onCampaignSelect, onRefresh }) => {
  const getProgressPercentage = (raised, goal) => {
    const percentage = (parseFloat(raised) / parseFloat(goal)) * 100;
    return Math.min(percentage, 100);
  };

  const getStatusBadge = (campaign) => {
    if (campaign.campaignEnded) {
      return campaign.goalReached ? (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Successful
        </span>
      ) : (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Failed
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Clock className="w-3 h-3 mr-1" />
          Active
        </span>
      );
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
        <p className="text-gray-600">Loading campaigns...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Campaigns</h1>
        <button
          onClick={onRefresh}
          className="btn-secondary flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No campaigns yet</h2>
          <p className="text-gray-600">Be the first to create a campaign!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign, index) => (
            <div
              key={campaign.address}
              className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              onClick={() => onCampaignSelect(campaign)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {campaign.title}
                </h3>
                {getStatusBadge(campaign)}
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {campaign.description}
              </p>

              <div className="space-y-3">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{getProgressPercentage(campaign.totalRaised, campaign.goal).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(campaign.totalRaised, campaign.goal)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Funding Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Target className="w-4 h-4 text-gray-400 mr-2" />
                    <div>
                      <p className="text-gray-500">Goal</p>
                      <p className="font-medium">{parseFloat(campaign.goal).toFixed(4)} BNB</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-gray-400 mr-2" />
                    <div>
                      <p className="text-gray-500">Raised</p>
                      <p className="font-medium">{parseFloat(campaign.totalRaised).toFixed(4)} BNB</p>
                    </div>
                  </div>
                </div>

                {/* Token Info */}
                <div className="text-sm">
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">Token Price:</span>
                    <span className="font-medium">{parseFloat(campaign.tokenPrice).toFixed(6)} BNB</span>
                  </div>
                </div>

                {/* Deadline */}
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Ends {formatDate(campaign.deadline)}</span>
                </div>

                {/* Creator */}
                <div className="text-sm text-gray-500">
                  <span>By {formatAddress(campaign.creator)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignList; 