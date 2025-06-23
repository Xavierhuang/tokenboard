import React, { useState } from 'react';
import { ethers } from 'ethers';
import { ArrowLeft, Plus, Loader } from 'lucide-react';

const CreateCampaign = ({ factoryContract, onCampaignCreated, onBack }) => {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
      setError(error.message || 'Failed to create campaign');
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

      <div className="card">
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
              className="input-field"
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
              className="input-field"
              rows="4"
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
                className="input-field"
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
                className="input-field"
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
                className="input-field"
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
                className="input-field"
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
                className="input-field"
                placeholder="PROJ"
                maxLength="10"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center"
              disabled={loading}
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
};

export default CreateCampaign; 