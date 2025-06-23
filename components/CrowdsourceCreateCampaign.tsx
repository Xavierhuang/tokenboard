import React, { useState } from 'react';
import { ethers } from 'ethers';
import { ArrowLeft, Plus, Loader } from 'lucide-react';

interface CrowdsourceCreateCampaignProps {
  factoryContract: ethers.Contract | null;
  onCampaignCreated: () => void;
  onBack: () => void;
}

export default function CrowdsourceCreateCampaign({ 
  factoryContract, 
  onCampaignCreated, 
  onBack 
}: CrowdsourceCreateCampaignProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    duration: '',
    tokenPrice: '',
    tokenName: '',
    tokenSymbol: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!factoryContract) {
      setError('Factory contract not connected');
      setLoading(false);
      return;
    }

    try {
      // Validate inputs
      if (!formData.title || !formData.description || !formData.goal || 
          !formData.duration || !formData.tokenPrice || !formData.tokenName || !formData.tokenSymbol) {
        throw new Error('All fields are required');
      }

      const goal = ethers.parseEther(formData.goal);
      const duration = parseInt(formData.duration) * 24 * 60 * 60; // Convert days to seconds
      const tokenPrice = ethers.parseEther(formData.tokenPrice);

      if (goal <= 0) throw new Error('Goal must be greater than 0');
      if (duration <= 0) throw new Error('Duration must be greater than 0');
      if (tokenPrice <= 0) throw new Error('Token price must be greater than 0');

      // Create campaign
      const tx = await factoryContract.createCampaign(
        formData.title,
        formData.description,
        goal,
        duration,
        tokenPrice,
        formData.tokenName,
        formData.tokenSymbol
      );

      await tx.wait();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        goal: '',
        duration: '',
        tokenPrice: '',
        tokenName: '',
        tokenSymbol: ''
      });

      // Refresh campaigns list
      onCampaignCreated();
      onBack();
    } catch (error) {
      console.error('Error creating campaign:', error);
      setError(error instanceof Error ? error.message : 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create New Campaign</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter campaign title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Describe your project..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Funding Goal (BNB) *
              </label>
              <input
                type="number"
                name="goal"
                value={formData.goal}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.1"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (Days) *
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="30"
                min="1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Price (BNB) *
              </label>
              <input
                type="number"
                name="tokenPrice"
                value={formData.tokenPrice}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.001"
                step="0.0001"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Name *
              </label>
              <input
                type="text"
                name="tokenName"
                value={formData.tokenName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Project Token"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Symbol *
              </label>
              <input
                type="text"
                name="tokenSymbol"
                value={formData.tokenSymbol}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="PTK"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 