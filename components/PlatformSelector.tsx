import React from 'react';
import { Platform } from '@/types';

interface PlatformSelectorProps {
  selectedPlatforms: Platform[];
  onPlatformChange: (platforms: Platform[]) => void;
}

const platforms: { value: Platform; label: string; color: string }[] = [
  { value: 'securitize', label: 'Securitize', color: 'bg-blue-500' },
  { value: 'texture', label: 'Texture Capital', color: 'bg-pink-500' },
  { value: 'centrifuge', label: 'Centrifuge', color: 'bg-yellow-400' },
];

export default function PlatformSelector({ selectedPlatforms, onPlatformChange }: PlatformSelectorProps) {
  const handlePlatformToggle = (platform: Platform) => {
    const newSelection = selectedPlatforms.includes(platform)
      ? selectedPlatforms.filter(p => p !== platform)
      : [...selectedPlatforms, platform];
    onPlatformChange(newSelection);
  };

  const selectAllPlatforms = () => {
    onPlatformChange(platforms.map(p => p.value));
  };

  const clearAllPlatforms = () => {
    onPlatformChange([]);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">Platforms</h3>
        <div className="flex space-x-2">
          <button
            onClick={selectAllPlatforms}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            All
          </button>
          <button
            onClick={clearAllPlatforms}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {platforms.map((platform) => (
          <label
            key={platform.value}
            className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
          >
            <input
              type="radio"
              checked={selectedPlatforms[0] === platform.value}
              onChange={() => onPlatformChange([platform.value])}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${platform.color}`}></div>
              <span className="text-sm text-gray-700">{platform.label}</span>
            </div>
          </label>
        ))}
      </div>

      {selectedPlatforms.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  );
} 