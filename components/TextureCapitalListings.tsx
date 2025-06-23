import { useState, useEffect } from 'react';

interface TextureAsset {
  title: string;
  link: string;
  image_url: string;
  closing: string;
  details_left: string;
  details_right: string;
  footer: string;
}

const TextureCapitalListings = () => {
  const [assets, setAssets] = useState<TextureAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch('/texture_listings.json');
        if (!response.ok) {
          throw new Error('Failed to fetch Texture Capital assets');
        }
        const data = await response.json();
        setAssets(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load assets');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading Texture Capital assets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-12 text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="text-center p-12 text-gray-500">
        <p>No Texture Capital assets found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <img src="/textcapital.png" alt="Texture Capital" className="w-8 h-8" />
        <h2 className="text-2xl font-bold text-gray-900">Texture Capital Assets</h2>
        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
          {assets.length} assets
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {assets.map((asset, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
            <div className="relative">
              <img
                src={asset.image_url.startsWith('http') ? asset.image_url : `https://app.texture.capital${asset.image_url}`}
                alt={asset.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/textcapital.png';
                }}
              />
              <div className="absolute top-2 right-2">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                  {asset.footer}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-2 text-xs text-gray-500">{asset.closing}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">{asset.title}</h3>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>{asset.details_left}</p>
                <p>{asset.details_right}</p>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <a
                  href={asset.link.startsWith('http') ? asset.link : `https://app.texture.capital${asset.link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View on Texture Capital
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TextureCapitalListings;
