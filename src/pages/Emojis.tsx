import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconFilter, IconRefresh, IconChevronDown } from '@tabler/icons-react';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { CONTRACT_ADDRESS, APTOS_API_KEY } from '../constants/contract';
import { useToast } from '../hooks/use-toast';
import { useAptPrice } from '../hooks/useAptPrice';
import type { MarketBackendData } from '../types/backend';
import PriceChange from '../components/PriceChange';

// Types
interface MarketDisplayData {
  market_id: string;
  market_address: string;
  emoji_bytes: string;
  token_symbol: string;
  market_name: string;
  token_name: string;
  canonical_image: string;
  category: number; // 0: Meme, 1: Product, 2: Gaming
  category_string: string;
  creator_address: string;
  in_bonding_curve: boolean;
  total_supply: string;
  circulating_supply: string;
  aptos_balance: string;
  created_time: string;
  cumulative_volume: string;
  total_swaps: string;
  current_price: string;
  market_cap: string;
  fdv: string;
  liquidity: string;
  age_seconds: string;
  price_5m_ago: string;
  price_1h_ago: string;
  price_24h_ago: string;
  price_5m_time: string;
  price_1h_time: string;
  price_24h_time: string;
}

interface TokenMarketData {
  market_id: number;
  market_address: string;
  emoji: string;
  token_name: string;
  market_name: string;
  price: number;
  marketCap: number;
  fdv: number;
  age: string;
  age_seconds: number;
  volume24h: number;
  change5m: number;
  change1h: number;
  change24h: number;
  category: string;
  total_swaps: number;
  imageDataUrl?: string;
  backendData?: MarketBackendData;
}

// Constants
const FILTER_OPTIONS = [
  { id: 'new', label: 'New' },
  { id: 'trending', label: 'Trending' },
  { id: 'verified', label: 'Verified' },
  { id: 'all', label: 'All' }
];

const CATEGORY_OPTIONS = [
  { id: 'all', label: 'All Categories' },
  { id: 'Meme', label: 'Meme' },
  { id: 'Gaming', label: 'Gaming' },
  { id: 'Product', label: 'Product' }
];

const TIME_FILTER_OPTIONS = [
  { id: 'all', label: 'All Time' },
  { id: '1h', label: 'Last Hour' },
  { id: '24h', label: 'Last 24 Hours' },
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' }
];


export default function Emojis() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Real-time APT price from Panora API
  const { aptPrice } = useAptPrice();
   
    // Add custom CSS for grid path animations
    useEffect(() => {
      const style = document.createElement('style');
      style.textContent = `
        /* Grid pattern is handled by inline styles */
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }, []);
   
    // State
  const [Emojis, setEmojis] = useState<TokenMarketData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  
  // Refs
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const timeDropdownRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  
  // Aptos client
  const aptosConfig = new AptosConfig({ 
    network: Network.DEVNET,
    clientConfig: {
      API_KEY: APTOS_API_KEY
    }
  });
  const aptos = new Aptos(aptosConfig);

  const formatAge = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  // Fetch Emojis from contract
  const fetchEmojis = async () => {
    // Prevent multiple simultaneous calls
    if (loading) {
      console.log('fetchEmojis already in progress, skipping...');
      return;
    }
    
    try {
      setLoading(true);
      console.log('fetchEmojis started');
      
      if (!CONTRACT_ADDRESS) {
        toast('Contract address not configured', { variant: 'destructive' });
        return;
      }

      // Fetch market data from contract
      const response = await aptos.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::emojixcore::get_all_markets_display_data`,
          typeArguments: [],
          functionArguments: []
        }
      });

      if (!response || !Array.isArray(response)) {
        toast('Failed to fetch market data', { variant: 'destructive' });
        return;
      }

      // Process market data
      const marketData = response as MarketDisplayData[];
      
      // The response is nested - extract the actual market data
      const actualMarketData = marketData[0] as any;
      
      // Convert to frontend format
      const EmojisData = actualMarketData.map((market: MarketDisplayData): TokenMarketData => {
        // Convert emoji bytes to emoji
        const emoji = market.token_symbol;
        
        // Convert price from contract precision to APT
        const price = parseFloat(market.current_price || '0') / 100000000;
        const marketCap = parseFloat(market.market_cap || '0') / 100000000;
        const fdv = parseFloat(market.fdv || '0') / 100000000;
        const volume24h = parseFloat(market.cumulative_volume || '0') / 100000000;
        
        // Calculate price changes from historical prices with proper time-based logic
        const currentPrice = parseFloat(market.current_price) / 100000000;
        const currentTime = Date.now() * 1000; // Convert to microseconds
        
        // Historical prices are in Q64 format, need to convert to same format as current price
        // Q64 format: value / (2^64) gives us the actual price
        const price5mAgo = parseFloat(market.price_5m_ago) / (2 ** 64);
        const price1hAgo = parseFloat(market.price_1h_ago) / (2 ** 64);
        const price24hAgo = parseFloat(market.price_24h_ago) / (2 ** 64);
        
        // Get the timing information for when these prices were recorded
        const price5mTime = parseFloat(market.price_5m_time);
        const price1hTime = parseFloat(market.price_1h_time);
        const price24hTime = parseFloat(market.price_24h_time);
        
        // Time-based price change calculation
        const calculateTimeBasedPriceChange = (current: number, historical: number, historicalTime: number, periodSeconds: number): number => {
          // If either price is invalid, return 0
          if (isNaN(historical) || isNaN(current) || isNaN(historicalTime)) {
            return 0;
          }
          
          // If current price is 0, return 0
          if (current <= 0) {
            return 0;
          }
          
          // If historical price is 0, return 0 (no meaningful change)
          if (historical <= 0) {
            return 0;
          }
          
          // Check if the historical price is actually from the time period we're claiming
          const timeDiff = (currentTime - historicalTime) / 1000000; // Convert to seconds
          const periodDiff = Math.abs(timeDiff - periodSeconds);
          
          // If the historical price is not from the expected time period (within 10% tolerance), return 0
          if (periodDiff > (periodSeconds * 0.1)) {
            return 0;
          }
          
          return ((current - historical) / historical) * 100;
        };
        
        const change5m = calculateTimeBasedPriceChange(currentPrice, price5mAgo, price5mTime, 5 * 60); // 5 minutes
        const change1h = calculateTimeBasedPriceChange(currentPrice, price1hAgo, price1hTime, 60 * 60); // 1 hour
        const change24h = calculateTimeBasedPriceChange(currentPrice, price24hAgo, price24hTime, 24 * 60 * 60); // 24 hours
        
        return {
          market_id: parseInt(market.market_id),
          market_address: market.market_address,
          emoji,
          token_name: market.token_name,
          market_name: market.market_name,
          price,
          marketCap,
          fdv,
          age: formatAge(parseInt(market.age_seconds)),
          age_seconds: parseInt(market.age_seconds),
          volume24h,
          change5m,
          change1h,
          change24h,
          category: market.category_string,
          total_swaps: parseInt(market.total_swaps),
          imageDataUrl: market.canonical_image
        };
      });

      setEmojis(EmojisData);
      console.log('fetchEmojis completed, showing toast');
      toast(`Loaded ${EmojisData.length} Emojis`, { variant: 'default' });
      
    } catch (error) {
      console.error('Error fetching Emojis:', error);
      toast('Failed to fetch Emojis', { variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Filter Emojis
  // Memoize filtered Emojis to prevent unnecessary recalculations
  const filteredEmojis = useMemo(() => {
    let filtered = Emojis;
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(token => 
        token.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Apply time filter
    if (selectedTimeFilter !== 'all') {
      const getTimeFilterInSeconds = (timeFilter: string): number => {
        switch (timeFilter) {
          case '1h': return 60 * 60; // 1 hour
          case '24h': return 24 * 60 * 60; // 24 hours
          case '7d': return 7 * 24 * 60 * 60; // 7 days
          case '30d': return 30 * 24 * 60 * 60; // 30 days
          default: return 0;
        }
      };
      
      const timeFilterSeconds = getTimeFilterInSeconds(selectedTimeFilter);
      
      filtered = filtered.filter(token => {
        // Use the raw age_seconds from the token data
        return token.age_seconds <= timeFilterSeconds;
      });
    }
    
    // Apply active filter
    switch (activeFilter) {
      case 'trending':
        return filtered.filter(token => token.volume24h > 1000);
      case 'new':
        // Sort by creation time (newest first) and return all Emojis
        return filtered.sort((a, b) => {
          // Use the raw age_seconds for comparison
          return a.age_seconds - b.age_seconds;
        });
      case 'verified':
        return filtered.filter(token => token.total_swaps > 10);
      default:
        return filtered;
    }
  }, [Emojis, selectedCategory, selectedTimeFilter, activeFilter]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node)) {
        setShowTimeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Emojis on mount
  useEffect(() => {
    // Prevent duplicate fetches in React StrictMode
    if (hasInitialized.current) {
      console.log('Already initialized, skipping fetchEmojis');
      return;
    }
    
    let isMounted = true;
    
    const loadEmojis = async () => {
      if (isMounted && !hasInitialized.current) {
        hasInitialized.current = true;
        await fetchEmojis();
      }
    };
    
    loadEmojis();
    
    return () => {
      isMounted = false;
    };
  }, []);


  return (
    <div className="min-h-screen bg-background p-4 relative overflow-hidden">
      {/* Spotlight from bottom right */}
      <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
      
      {/* Tiny Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />
      

      
      {/* Content */}
      <div className="mx-auto relative z-10 mt-16 px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          {/* Filter Buttons - Left Side */}
          <div className="flex items-center space-x-2">
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setActiveFilter(option.id)}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 border ${
                  activeFilter === option.id
                    ? 'bg-primary text-background border-primary'
                    : 'bg-surface/20 text-text/70 hover:bg-surface/30 hover:text-text border-white/5'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Refresh Button */}
            <button
              onClick={fetchEmojis}
              disabled={loading}
              className="px-4 py-2 bg-surface/20 text-text rounded-lg font-medium text-sm hover:bg-surface/30 transition-all duration-200 flex items-center space-x-2 border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            
            {/* Category Dropdown */}
            <div className="relative" ref={categoryDropdownRef}>
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="px-4 py-2 bg-surface/20 text-text rounded-lg font-medium text-sm border border-white/5 focus:outline-none focus:border-primary/50 transition-all duration-200 flex items-center space-x-2 min-w-[160px]"
              >
                <IconFilter className="w-4 h-4" />
                <span>{CATEGORY_OPTIONS.find(c => c.id === selectedCategory)?.label || 'Category'}</span>
                <IconChevronDown className={`w-4 h-4 transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-surface/95 backdrop-blur-xl rounded-lg border border-white/10 shadow-xl z-10">
                  {CATEGORY_OPTIONS.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setShowCategoryDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-text hover:bg-white/10 transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Time Filter Dropdown */}
            <div className="relative" ref={timeDropdownRef}>
              <button
                onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                className="px-4 py-2 bg-surface/20 text-text rounded-lg font-medium text-sm border border-white/5 focus:outline-none focus:border-primary/50 transition-all duration-200 flex items-center space-x-2 min-w-[140px]"
              >
                <IconFilter className="w-4 h-4" />
                <span>{TIME_FILTER_OPTIONS.find(t => t.id === selectedTimeFilter)?.label || 'Time'}</span>
                <IconChevronDown className={`w-4 h-4 transition-transform duration-200 ${showTimeDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showTimeDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-surface/95 backdrop-blur-xl rounded-lg border border-white/10 shadow-xl z-10">
                  {TIME_FILTER_OPTIONS.map((timeFilter) => (
                    <button
                      key={timeFilter.id}
                      onClick={() => {
                        setSelectedTimeFilter(timeFilter.id);
                        setShowTimeDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-text hover:bg-white/10 transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      {timeFilter.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Emojis Table */}
        <div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text/70 uppercase tracking-wider border-t border-white/10">Emoji</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text/70 uppercase tracking-wider border-t border-white/10">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text/70 uppercase tracking-wider border-t border-white/10">Age</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text/70 uppercase tracking-wider border-t border-white/10">5M Change</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text/70 uppercase tracking-wider border-t border-white/10">1H Change</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text/70 uppercase tracking-wider border-t border-white/10">24h Change</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text/70 uppercase tracking-wider border-t border-white/10">Volume (24h)</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text/70 uppercase tracking-wider border-t border-white/10">Market Cap</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text/70 uppercase tracking-wider border-t border-white/10">FDV</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text/70 uppercase tracking-wider border-t border-white/10">Chart</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr key="loading">
                    <td colSpan={10} className="px-6 py-8 text-center text-text/70 border-t border-white/10">
                      <div className="flex items-center justify-center space-x-2">
                        <IconRefresh className="w-5 h-5 animate-spin" />
                        <span>Loading Emojis...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredEmojis.length === 0 ? (
                  <tr key="empty">
                    <td colSpan={10} className="px-6 py-8 text-center text-text/70 border-t border-white/10">
                      No Emojis found
                    </td>
                  </tr>
                ) : (
                  filteredEmojis.map((token) => {
                    
                    return (
                      <tr 
                        key={`${token.market_id}-${token.market_address}`}
                        className="hover:bg-surface/10 transition-colors cursor-pointer"
                        onClick={() => navigate(`/trading/${token.market_address}`)}
                      >
                        {/* Token Info */}
                        <td className="px-6 py-2 border-t border-white/10">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-surface/30 rounded-lg flex items-center justify-center text-lg overflow-hidden">
                              {token.imageDataUrl ? (
                                <img 
                                  src={token.imageDataUrl} 
                                  alt={token.token_name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Fallback to emoji if image fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling!.textContent = token.emoji;
                                  }}
                                />
                              ) : null}
                              <span className={token.imageDataUrl ? 'hidden' : ''}>{token.emoji}</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-text">{token.token_name}</div>
                              <div className="text-xs text-text/60">{token.category}</div>
                            </div>
                          </div>
                        </td>
                        
                        {/* Price */}
                        <td className="px-6 py-2 text-sm text-text border-t border-white/10">
                          <div className="flex flex-col">
                            <span className="font-medium">{token.price} APT</span>
                            {aptPrice && (
                              <span className="text-xs text-text/60">
                                ${(token.price * parseFloat(aptPrice.usdPrice)).toFixed(4)}
                              </span>
                            )}
                          </div>
                        </td>
                        
                        {/* Age */}
                        <td className="px-6 py-2 text-sm text-text border-t border-white/10">
                          {token.age}
                        </td>
                        
                        {/* 5M Change */}
                        <td className="px-6 py-2 border-t border-white/10">
                          <PriceChange value={token.change5m} showPlus={false} />
                        </td>
                        
                        {/* 1H Change */}
                        <td className="px-6 py-2 border-t border-white/10">
                          <PriceChange value={token.change1h} showPlus={false} />
                        </td>
                        
                        {/* 24h Change */}
                        <td className="px-6 py-2 border-t border-white/10">
                          <PriceChange value={token.change24h} showPlus={false} />
                        </td>
                        
                        {/* Volume */}
                        <td className="px-6 py-2 text-sm text-text border-t border-white/10">
                          <div className="flex flex-col">
                            <span className="font-medium">{token.volume24h} APT</span>
                            {aptPrice && (
                              <span className="text-xs text-text/60">
                                ${(token.volume24h * parseFloat(aptPrice.usdPrice)).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </td>
                        
                        {/* Market Cap */}
                        <td className="px-6 py-2 text-sm text-text border-t border-white/10">
                          <div className="flex flex-col">
                            <span className="font-medium">{token.marketCap} APT</span>
                            {aptPrice && (
                              <span className="text-xs text-text/60">
                                ${(token.marketCap * parseFloat(aptPrice.usdPrice)).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </td>
                        
                        {/* FDV */}
                        <td className="px-6 py-2 text-sm text-text border-t border-white/10">
                          <div className="flex flex-col">
                            <span className="font-medium">{token.fdv} APT</span>
                            {aptPrice && (
                              <span className="text-xs text-text/60">
                                ${(token.fdv * parseFloat(aptPrice.usdPrice)).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </td>
                        
                        {/* Chart */}
                        <td className="px-6 py-2 text-sm text-text border-t border-white/10">
                          <svg width="80" height="30" viewBox="0 0 80 30" className="w-20 h-8">
                            <path
                              d="M0 25 L10 20 L20 15 L30 10 L40 5 L50 8 L60 12 L70 8 L80 5"
                              stroke={isNaN(token.change24h) || token.change24h >= 0 ? "#10b981" : "#ef4444"}
                              strokeWidth="2"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 