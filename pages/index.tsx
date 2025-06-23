import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import AssetCard from '../components/AssetCard';
import { useDebounce } from '../lib/utils';
import { TokenizedAsset, AssetFilters, Platform } from '../types';
import StatsPanel from '../components/StatsPanel';
import PlatformSelector from '../components/PlatformSelector';
import SecuritizeIframe from '../components/SecuritizeIframe';
import TextureCapitalListings from '../components/TextureCapitalListings';
import CentrifugePoolsListings from '../components/CentrifugePoolsListings';
import SecuritizeListings from '../components/SecuritizeListings';
import PYUSDWallet from '../components/PYUSDWallet';

// This is the shape of the stats object expected by StatsPanel
interface Stats {
  totalAssets: number;
  totalMarketCap: number;
  totalVolume24h: number;
  averageYield: number;
  activePlatforms: number;
  totalInvestors: number;
}

const Home: NextPage = () => {
  const [filters, setFilters] = useState<AssetFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [assets, setAssets] = useState<TokenizedAsset[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [assetsRes, statsRes] = await Promise.all([
          fetch('/api/assets'),
          fetch('/api/stats'),
        ]);

        if (!assetsRes.ok) {
          const text = await assetsRes.text();
          throw new Error(text || 'Failed to fetch assets');
        }
        const assetsData = await assetsRes.json();
        setAssets(assetsData.data || []);

        if (!statsRes.ok) {
            const errorData = await statsRes.json();
            throw new Error(errorData.message || 'Failed to fetch stats');
        }
        const statsData = await statsRes.json();
        setStats(statsData.data);

      } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredAssets = assets
    .filter(asset => {
        return debouncedSearchQuery ? asset.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) : true
    })
    .filter(asset => {
        return selectedPlatforms.length > 0 ? selectedPlatforms.includes(asset.platform) : true;
    })
    .filter(asset => {
        // Asset Type filter
        if (filters.assetType && !filters.assetType.includes(asset.assetType)) return false;
        
        // Price range filters
        if (filters.minPrice && asset.currentPrice < filters.minPrice) return false;
        if (filters.maxPrice && asset.currentPrice > filters.maxPrice) return false;
        
        // Yield filters
        if (asset.yield !== undefined) {
            if (filters.minYield && asset.yield < filters.minYield) return false;
            if (filters.maxYield && asset.yield > filters.maxYield) return false;
            
            // Yield range filter (string format like "5-10")
            if (filters.yieldRange) {
                const [min, max] = filters.yieldRange.split('-').map(Number);
                if (filters.yieldRange === '20+') {
                    if (asset.yield < 20) return false;
                } else if (min !== undefined && max !== undefined) {
                    if (asset.yield < min || asset.yield > max) return false;
                }
            }
        }
        
        // Minimum Investment filter
        if (filters.minInvestment) {
            const minInvestment = Number(filters.minInvestment);
            if (asset.minInvestment < minInvestment) return false;
        }
        
        // Risk Level filter (if asset has risk level data)
        if (filters.riskLevel && asset.riskLevel && asset.riskLevel !== filters.riskLevel) return false;
        
        // Liquidity filter (if asset has liquidity data)
        if (filters.liquidity && asset.liquidity && asset.liquidity !== filters.liquidity) return false;
        
        // Regulatory Status filter (if asset has regulatory status data)
        if (filters.regulatoryStatus && asset.regulatoryStatus && asset.regulatoryStatus !== filters.regulatoryStatus) return false;
        
        // Region filter (if asset has region data)
        if (filters.region && asset.region && asset.region !== filters.region) return false;
        
        // Platform filter
        if (filters.platform && !filters.platform.includes(asset.platform)) return false;
        
        // Token Standard filter
        if (filters.tokenStandard && !filters.tokenStandard.includes(asset.tokenStandard)) return false;
        
        // Compliance Status filter
        if (filters.complianceStatus && !filters.complianceStatus.includes(asset.complianceStatus)) return false;
        
        // Blockchain filter
        if (filters.blockchain && !filters.blockchain.includes(asset.blockchain)) return false;
        
        return true;
    });

  return (
    <div className="bg-gray-50 min-h-screen">
      <Head>
        <title>tokenboard</title>
        <meta name="description" content="Aggregating tokenized assets from multiple platforms" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <SearchBar onSearch={setSearchQuery} placeholder="Search by asset name..." />
            </div>
            <div className="lg:col-span-1 row-start-1 lg:row-start-auto">
              {stats && !isLoading && <StatsPanel stats={stats} />}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <PYUSDWallet 
                  onConnect={(address) => console.log('PYUSD wallet connected:', address)}
                  onDisconnect={() => console.log('PYUSD wallet disconnected')}
                />
                <PlatformSelector 
                  selectedPlatforms={selectedPlatforms} 
                  onPlatformChange={setSelectedPlatforms} 
                />
                <FilterPanel filters={filters} onFilterChange={setFilters} />
              </div>
            </div>

            <div className="lg:col-span-3">
              {selectedPlatforms.length === 1 && selectedPlatforms[0] === 'texture' ? (
                <TextureCapitalListings />
              ) : selectedPlatforms.length === 1 && selectedPlatforms[0] === 'centrifuge' ? (
                <CentrifugePoolsListings />
              ) : selectedPlatforms.length === 1 && selectedPlatforms[0] === 'securitize' ? (
                <SecuritizeListings />
              ) : (
                <>
                  {isLoading && <div className="text-center p-12">Loading assets...</div>}
                  {error && <div className="text-center p-12 text-red-500">{error}</div>}
                  {!isLoading && !error && (
                    <>
                      {filteredAssets.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {filteredAssets.map((asset) => (
                            <AssetCard key={asset.id} asset={asset} />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-12">
                          <p>No assets found matching your criteria.</p>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home; 