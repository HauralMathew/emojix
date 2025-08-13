import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { Aptos, AptosConfig } from '@aptos-labs/ts-sdk';
import { CONTRACT_ADDRESS, APTOS_API_KEY, DEVNET } from '../constants/contract';
import Swap from '../components/Swap';
import PriceChange from '../components/PriceChange';
import { useCurrency } from '../context/CurrencyContext';
import { useAptPrice } from '../hooks/useAptPrice';
import { convertAptToUsd, formatAptAmount, formatUsdAmount } from '../utils/priceConversion';

// Types for trading data based on contract structure
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
  liquidity: number;
  total_supply: number;
  circulating_supply: number;
  age: string;
  age_seconds: number;
  volume24h: number;
  change5m: number;
  change1h: number;
  change24h: number;
  category: string;
  total_swaps: number;
  imageDataUrl?: string;
  in_bonding_curve: boolean;
}



export default function Trading() {
  const { marketAddress } = useParams<{ marketAddress: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAptCurrency } = useCurrency();
  const { aptPrice } = useAptPrice();
  
  // Initialize Aptos client
  const aptosConfig = new AptosConfig({ 
    network: DEVNET,
    clientConfig: {
      API_KEY: APTOS_API_KEY
    }
  });
  const aptos = new Aptos(aptosConfig);
  
  // State
  const [token, setToken] = useState<TokenMarketData | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper functions for currency formatting
  const formatPrice = (aptAmount: number): string => {
    if (isAptCurrency) {
      return formatAptAmount(aptAmount);
    } else {
      if (!aptPrice) return '$0.00';
      return convertAptToUsd(aptAmount, aptPrice);
    }
  };

  const formatMarketCap = (aptAmount: number): string => {
    if (isAptCurrency) {
      return `${aptAmount.toLocaleString()} APT`;
    } else {
      if (!aptPrice) return '$0.00';
      return convertAptToUsd(aptAmount, aptPrice);
    }
  };

  const formatVolume = (aptAmount: number): string => {
    if (isAptCurrency) {
      return `${aptAmount.toLocaleString()} APT`;
    } else {
      if (!aptPrice) return '$0.00';
      return convertAptToUsd(aptAmount, aptPrice);
    }
  };

  const formatFdv = (aptAmount: number): string => {
    if (isAptCurrency) {
      return `${aptAmount.toLocaleString()} APT`;
    } else {
      if (!aptPrice) return '$0.00';
      return convertAptToUsd(aptAmount, aptPrice);
    }
  };

  const formatLiquidity = (aptAmount: number): string => {
    if (isAptCurrency) {
      return `${aptAmount.toLocaleString()} APT`;
    } else {
      if (!aptPrice) return '$0.00';
      return convertAptToUsd(aptAmount, aptPrice);
    }
  };

  // Fetch token data using the exact same logic as Tokens page
  const fetchTokenData = async () => {
    if (!marketAddress) return;
    
    try {
      setLoading(true);
      
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
      
      // Find the market with matching market address
      const foundMarket = actualMarketData.find((market: MarketDisplayData) => {
        if (!market || !market.market_address) return false;
        return market.market_address === decodeURIComponent(marketAddress);
      });
      
      if (!foundMarket) {
        toast('Token not found', { variant: 'destructive' });
        navigate('/tokens');
        return;
      }
      
      // Convert emoji bytes to emoji
      const emoji = foundMarket.token_symbol;
      
      // Convert price from contract precision to APT
      const price = parseFloat(foundMarket.current_price || '0') / 100000000;
      const marketCap = parseFloat(foundMarket.market_cap || '0') / 100000000;
      const fdv = parseFloat(foundMarket.fdv || '0') / 100000000;
      const volume24h = parseFloat(foundMarket.cumulative_volume || '0') / 100000000;
      
            // Calculate price changes from historical prices with proper time-based logic
      const currentPrice = parseFloat(foundMarket.current_price) / 100000000;
      const currentTime = Date.now() * 1000; // Convert to microseconds
      
      // Historical prices are in Q64 format, need to convert to same format as current price
      // Q64 format: value / (2^64) gives us the actual price
      const price5mAgo = parseFloat(foundMarket.price_5m_ago) / (2 ** 64);
      const price1hAgo = parseFloat(foundMarket.price_1h_ago) / (2 ** 64);
      const price24hAgo = parseFloat(foundMarket.price_24h_ago) / (2 ** 64);
      
      // Get the timing information for when these prices were recorded
      const price5mTime = parseFloat(foundMarket.price_5m_time);
      const price1hTime = parseFloat(foundMarket.price_1h_time);
      const price24hTime = parseFloat(foundMarket.price_24h_time);
      

      
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
          console.log(`Historical price time mismatch: expected ~${periodSeconds}s ago, got ${timeDiff}s ago`);
          return 0;
        }
        
        return ((current - historical) / historical) * 100;
      };
      
      const change5m = calculateTimeBasedPriceChange(currentPrice, price5mAgo, price5mTime, 5 * 60); // 5 minutes
      const change1h = calculateTimeBasedPriceChange(currentPrice, price1hAgo, price1hTime, 60 * 60); // 1 hour
      const change24h = calculateTimeBasedPriceChange(currentPrice, price24hAgo, price24hTime, 24 * 60 * 60); // 24 hours

      // Format age
      const formatAge = (seconds: number): string => {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
        return `${Math.floor(seconds / 86400)}d`;
      };
      
      const tokenData: TokenMarketData = {
        market_id: parseInt(foundMarket.market_id),
        market_address: foundMarket.market_address,
        emoji,
        token_name: foundMarket.token_name,
        market_name: foundMarket.market_name,
        price,
        marketCap,
        fdv,
        liquidity: parseFloat(foundMarket.liquidity || '0') / 100000000,
        total_supply: parseFloat(foundMarket.total_supply || '0') / 100000000,
        circulating_supply: parseFloat(foundMarket.circulating_supply || '0') / 100000000,
        age: formatAge(parseInt(foundMarket.age_seconds)),
        age_seconds: parseInt(foundMarket.age_seconds),
        volume24h,
        change5m,
        change1h,
        change24h,
        category: foundMarket.category_string,
        total_swaps: parseInt(foundMarket.total_swaps),
        imageDataUrl: foundMarket.canonical_image,
        in_bonding_curve: foundMarket.in_bonding_curve
      };
      
      setToken(tokenData);
      
    } catch (error) {
      console.error('Error fetching token data:', error);
      toast('Failed to fetch token data', { variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };
  
  // Effects
  useEffect(() => {
    fetchTokenData();
  }, [marketAddress]);





  if (loading) {
    return (
      <div className="bg-surface relative overflow-x-hidden" style={{ height: 'calc(100vh - 32px)' }}>
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Gradient Base */}
          <div className="absolute inset-0 bg-background"></div>
          
          {/* Large Circle - Right Center */}
          <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-lime-500/10 rounded-full blur-3xl animate-pulse transform translate-x-1/3 -translate-y-1/2" style={{ animationDuration: '4s' }}></div>
          
          {/* Small Circle - Top Left */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-lime-400/20 rounded-full blur-2xl animate-pulse transform -translate-x-1/2 -translate-y-1/2" style={{ animationDuration: '6s' }}></div>
          
          {/* Subtle Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-35"
            style={{
              backgroundImage: `
                radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          ></div>
          
          {/* Subtle Wave Effect */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-lime-500/5 to-transparent"></div>
        </div>
        
        {/* Content Layer */}
        <div className="relative z-10 flex flex-col h-full pt-16">
          {/* Top Section - Fixed */}
          <div className="h-24 border-b border-primary/5 flex items-center px-6 flex-shrink-0 overflow-x-auto">
            <div className="animate-pulse flex items-center space-x-4">
              {/* Token Icon */}
              <div className="w-20 h-20 bg-surface/30 rounded-lg"></div>
              
              {/* Token Name */}
              <div className="space-y-2">
                <div className="h-6 bg-surface/30 rounded w-32"></div>
                <div className="h-3 bg-surface/30 rounded w-20"></div>
              </div>
              
              {/* Vertical Divider */}
              <div className="h-10 w-px bg-primary/10"></div>
              
              {/* Price */}
              <div className="space-y-2">
                <div className="h-6 bg-surface/30 rounded w-24"></div>
                <div className="h-3 bg-surface/30 rounded w-16"></div>
              </div>
              
              {/* Vertical Divider */}
              <div className="h-10 w-px bg-primary/10"></div>
              
              {/* Followers Count */}
              <div className="space-y-2">
                <div className="h-6 bg-surface/30 rounded w-20"></div>
                <div className="h-3 bg-surface/30 rounded w-16"></div>
              </div>
              
              {/* Social Links */}
              <div className="flex items-center space-x-3 ml-auto">
                <div className="w-5 h-5 bg-surface/30 rounded"></div>
                <div className="w-5 h-5 bg-surface/30 rounded"></div>
                <div className="w-5 h-5 bg-surface/30 rounded"></div>
              </div>
              
              {/* Vertical Divider */}
              <div className="h-10 w-px bg-primary/10"></div>
              
              {/* Follow Button */}
              <div className="w-20 h-8 bg-surface/30 rounded-lg"></div>
            </div>
          </div>
          
          {/* Bottom Section - Divided into Three */}
          <div className="flex border-r border-primary/10 overflow-hidden min-h-0 flex-1">
            {/* Left Section - 25% */}
            <div className="w-1/4 border-r border-primary/10 p-4 pb-4 overflow-y-auto scrollbar-hide min-w-0">
              <div className="animate-pulse space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface/30 rounded-lg p-3 h-16"></div>
                  <div className="bg-surface/30 rounded-lg p-3 h-16"></div>
                  <div className="bg-surface/30 rounded-lg p-3 h-16"></div>
                  <div className="bg-surface/30 rounded-lg p-3 h-16"></div>
                  <div className="bg-surface/30 rounded-lg p-3 h-16"></div>
                  <div className="bg-surface/30 rounded-lg p-3 h-16 col-span-2"></div>
                </div>
                
                {/* Price Changes */}
                <div className="bg-surface/30 rounded-lg p-3 h-16"></div>
                
                {/* List Stats */}
                <div className="space-y-2">
                  <div className="bg-surface/30 rounded-lg p-3 h-20"></div>
                  <div className="flex justify-between py-2">
                    <div className="h-3 bg-surface/30 rounded w-16"></div>
                    <div className="h-3 bg-surface/30 rounded w-12"></div>
                  </div>
                  <div className="flex justify-between py-2">
                    <div className="h-3 bg-surface/30 rounded w-20"></div>
                    <div className="h-3 bg-surface/30 rounded w-16"></div>
                  </div>
                  <div className="flex justify-between py-2">
                    <div className="h-3 bg-surface/30 rounded w-24"></div>
                    <div className="h-3 bg-surface/30 rounded w-16"></div>
                  </div>
                  <div className="flex justify-between py-2">
                    <div className="h-3 bg-surface/30 rounded w-28"></div>
                    <div className="h-3 bg-surface/30 rounded w-20"></div>
                  </div>
                  <div className="flex justify-between py-2">
                    <div className="h-3 bg-surface/30 rounded w-32"></div>
                    <div className="h-3 bg-surface/30 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Center Section - 50% */}
            <div className="w-1/2 border-r border-primary/10 p-4 pb-4 overflow-y-auto scrollbar-hide min-w-0">
              <div className="animate-pulse space-y-6">
                {/* Chart Section */}
                <div className="bg-surface/30 rounded-lg p-4 h-64"></div>
                
                {/* Transaction Table */}
                <div className="bg-surface/30 rounded-lg p-4">
                  {/* Tabs */}
                  <div className="flex space-x-6 mb-4">
                    <div className="h-4 bg-surface/30 rounded w-24"></div>
                    <div className="h-4 bg-surface/30 rounded w-16"></div>
                  </div>
                  
                  {/* Table Headers */}
                  <div className="grid grid-cols-6 gap-4 pb-3 border-b border-white/10">
                    <div className="h-3 bg-surface/30 rounded"></div>
                    <div className="h-3 bg-surface/30 rounded"></div>
                    <div className="h-3 bg-surface/30 rounded"></div>
                    <div className="h-3 bg-surface/30 rounded"></div>
                    <div className="h-3 bg-surface/30 rounded"></div>
                    <div className="h-3 bg-surface/30 rounded"></div>
                  </div>
                  
                  {/* Table Rows */}
                  <div className="space-y-3 mt-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="grid grid-cols-6 gap-4 py-3">
                        <div className="h-4 bg-surface/30 rounded"></div>
                        <div className="h-4 bg-surface/30 rounded"></div>
                        <div className="h-4 bg-surface/30 rounded"></div>
                        <div className="h-4 bg-surface/30 rounded"></div>
                        <div className="h-4 bg-surface/30 rounded"></div>
                        <div className="h-4 bg-surface/30 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Section - 25% */}
            <div className="w-1/4 p-4 overflow-y-auto scrollbar-hide min-w-0">
              <div className="animate-pulse">
                <div className="bg-surface/30 rounded-lg p-4 h-96"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!token) {
    return (
      <div className=" bg-background p-4">
        {/* Content */}
        <div className="relative z-10 text-center mt-16">
          <p className="text-white">Token not found</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-surface relative overflow-x-hidden" style={{ height: 'calc(100vh - 32px)' }}>
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Base */}
        <div className="absolute inset-0 bg-background"></div>
        
        {/* Large Circle - Right Center */}
        <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-lime-500/10 rounded-full blur-3xl animate-pulse transform translate-x-1/3 -translate-y-1/2" style={{ animationDuration: '4s' }}></div>
        
        {/* Small Circle - Top Left */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-lime-400/20 rounded-full blur-2xl animate-pulse transform -translate-x-1/2 -translate-y-1/2" style={{ animationDuration: '6s' }}></div>
        
        {/* Subtle Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage: `
              radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        ></div>
        
        {/* Subtle Wave Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-lime-500/5 to-transparent"></div>
      </div>
      
      {/* Content Layer */}
      <div className="relative z-10 flex flex-col h-full pt-16">
        {/* Top Section - Fixed */}
        <div className="h-24 border-b border-primary/5 flex items-center px-6 flex-shrink-0 overflow-x-auto">
        
            {/* Token Icon */}
          <div>
            {token.imageDataUrl ? (
              <img 
                src={token.imageDataUrl} 
                alt={token.token_name}
                className="w-20 h-20 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : (
              <span className="text-2xl">{token.emoji}</span>
            )}
          </div>
            
          {/* Token Name */}
          <div className="text-left mr-2">
            <h1 className="text-xl font-semibold text-text">{token.token_name}</h1>
            <p className="text-xs text-white">{token.category}</p>
            </div>

          {/* Vertical Divider */}
          <div className="h-10 w-px bg-primary/10 mx-4"></div>
          
          {/* Price */}
          <div className="text-left mr-4">
            <div className="text-xl font-semibold text-text">
              {token?.price ? formatPrice(token.price) : (isAptCurrency ? '0 APT' : '$0.00')}
            </div>
            <div className="text-xs text-white/70">Price</div>
          </div>
          
          {/* Vertical Divider */}
          <div className="h-10 w-px bg-primary/10 mx-4"></div>
          
          {/* Followers Count */}
          <div className="text-left mr-4">
            <div className="text-xl font-semibold text-text">532</div>
            <div className="text-xs text-white/70">Followers</div>
          </div>
          
          {/* Social Links - Right Side */}
          <div className="flex items-center space-x-3 ml-auto mr-4">
            <a 
              href="#" 
              className="text-white/70 hover:text-primary transition-colors"
              aria-label="Telegram"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </a>
            <a 
              href="#" 
              className="text-white/70 hover:text-primary transition-colors"
              aria-label="X (Twitter)"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a 
              href="#" 
              className="text-white/70 hover:text-primary transition-colors"
              aria-label="Website"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </a>
          </div>
          
          {/* Vertical Divider */}
          <div className="h-10 w-px bg-primary/10 mx-4"></div>
          
          {/* Follow Button */}
          <button className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg font-medium hover:bg-primary/20 hover:border-white/30 transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-1.5">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
            </svg>
            <span className="text-sm">Follow</span>
          </button>
        </div>
        
        {/* Bottom Section - Divided into Three */}
        <div className="flex border-r border-primary/10 overflow-hidden min-h-0 flex-1">
          {/* Left Section - 25% */}
          <div className="w-1/4 border-r border-primary/10 p-4 pb-4 overflow-y-auto scrollbar-hide min-w-0">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* 24h Volume */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 text-center col-span-2">
                <div className="text-xs text-white/70 mb-1">24h Volume</div>
                <div className="text-sm font-semibold text-text">{token.volume24h ? formatVolume(token.volume24h) : (isAptCurrency ? '0 APT' : '$0.00')}</div>
              </div>
              
              {/* FDV */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 text-center">
                <div className="text-xs text-white/70 mb-1">FDV</div>
                <div className="text-sm font-semibold text-text">{token.fdv ? formatFdv(token.fdv) : (isAptCurrency ? '0 APT' : '$0.00')}</div>
              </div>
              
              {/* Holders */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 text-center">
                <div className="text-xs text-white/70 mb-1">Holders</div>
                <div className="text-sm font-semibold text-text">{token.total_swaps?.toLocaleString() || '0'}</div>
              </div>
              
              {/* Market Cap */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 text-center">
                <div className="text-xs text-white/70 mb-1">Market Cap</div>
                <div className="text-sm font-semibold text-text">{token.marketCap ? formatMarketCap(token.marketCap) : (isAptCurrency ? '0 APT' : '$0.00')}</div>
              </div>
              
              {/* Liquidity */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 text-center">
                <div className="text-xs text-white/70 mb-1">Liquidity</div>
                <div className="text-sm font-semibold text-text">{token.liquidity ? formatLiquidity(token.liquidity) : (isAptCurrency ? '0 APT' : '$0.00')}</div>
              </div>
              
              {/* Circulating Supply */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 col-span-2 text-center">
                <div className="text-xs text-white/70 mb-1">Circulating Supply</div>
                <div className="text-sm font-semibold text-text">{token.circulating_supply?.toLocaleString() || '0'}</div>
              </div>
            </div>
            
            {/* Price Changes Horizontal Box */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3">
              <div className="flex justify-between items-center h-12">
                {/* 5m Change */}
                <div className="text-center flex-1">
                  <div className="text-xs text-white/70 mb-1">5m</div>
                  <PriceChange value={token.change5m} />
                </div>
                
                {/* Divider */}
                <div className="w-px h-full bg-white/10"></div>
                
                {/* 1h Change */}
                <div className="text-center flex-1">
                  <div className="text-xs text-white/70 mb-1">1h</div>
                  <PriceChange value={token.change1h} />
                </div>
                
                {/* Divider */}
                <div className="w-px h-full bg-white/10"></div>
                
                {/* 24h Change */}
                <div className="text-center flex-1">
                  <div className="text-xs text-white/70 mb-1">24h</div>
                  <PriceChange value={token.change24h} />
                </div>
              </div>
            </div>
            
            {/* List Stats */}
            <div className="mt-4 space-y-2">
              {/* Token Description */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3">
                <div className="text-xs text-white/70 mb-1">About</div>
                <div className="text-sm text-text">
                  {token.token_name} is a community-driven token on the Aptos blockchain, designed to bring people together through shared interests and collective growth.
                </div>
              </div>
              
              {/* Age */}
              <div className="flex justify-between items-center py-2">
                <div className="text-xs text-white/70">Age</div>
                <div className="text-sm font-semibold text-text">{token.age || '0d 0h'}</div>
              </div>
              
              {/* Total Supply */}
              <div className="flex justify-between items-center py-2">
                <div className="text-xs text-white/70">Total Supply</div>
                <div className="text-sm font-semibold text-text">{token.total_supply?.toLocaleString() || '0'}</div>
              </div>
              
              {/* Bonding Curve State */}
              <div className="flex justify-between items-center py-2">
                <div className="text-xs text-white/70">Bonding Curve</div>
                <div className="text-sm font-semibold text-text">
                  {token.in_bonding_curve ? 'Active' : 'Graduated'}
                </div>
              </div>
              
              {/* Locked Liquidity */}
              <div className="flex justify-between items-center py-2">
                <div className="text-xs text-white/70">Locked Liquidity</div>
                <div className="text-sm font-semibold text-text">{token.liquidity ? formatLiquidity(token.liquidity) : (isAptCurrency ? '0 APT' : '$0.00')}</div>
              </div>
              
              {/* Total Transactions */}
              <div className="flex justify-between items-center py-2">
                <div className="text-xs text-white/70">Total Transactions</div>
                <div className="text-sm font-semibold text-text">{token.total_swaps?.toLocaleString() || '0'}</div>
              </div>
            </div>
        </div>
        
          {/* Center Section - 50% */}
          <div className="w-1/2 border-r border-primary/10 p-4 pb-4 overflow-y-auto scrollbar-hide min-w-0">
            {/* Chart Section */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 mb-6">
              <div className="h-64 flex items-center justify-center">
                <div className="text-white/50 text-sm">Chart Component</div>
              </div>
            </div>
            
            {/* Transaction Table */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
              {/* Tabs */}
              <div className="flex space-x-6 mb-4">
                <div className="text-sm font-medium text-text border-b-2 border-primary pb-1">
                  Transactions
                </div>
                <div className="text-sm font-medium text-white/50 hover:text-white/70 transition-colors cursor-pointer">
                  Holders
                </div>
              </div>
              
              {/* Table Headers */}
              <div className="grid grid-cols-6 gap-4 pb-3 border-b border-white/10 text-xs text-white/70 font-medium min-w-max">
                <div>Time</div>
                <div>Type</div>
                <div>Price</div>
                <div>Volume</div>
                <div>Amount</div>
                <div>Trader</div>
              </div>
              
              {/* Table Rows */}
              <div className="space-y-0 mt-3 overflow-x-auto">
                <div className="min-w-max">
                  {/* Sample Transaction Row 1 */}
                  <div className="grid grid-cols-6 gap-4 py-3 text-sm border-b border-white/10">
                    <div className="text-white/70">2m ago</div>
                    <div className="text-green-400">Buy</div>
                    <div className="text-text">{isAptCurrency ? '0.00123' : '$0.00123'}</div>
                    <div className="text-text">1,000</div>
                    <div className="text-text">{isAptCurrency ? '1.23 APT' : '$1.23'}</div>
                    <div className="text-white/70">0x1234...5678</div>
                  </div>
                  
                  {/* Sample Transaction Row 2 */}
                  <div className="grid grid-cols-6 gap-4 py-3 text-sm border-b border-white/10">
                    <div className="text-white/70">5m ago</div>
                    <div className="text-red-400">Sell</div>
                    <div className="text-text">{isAptCurrency ? '0.00122' : '$0.00122'}</div>
                    <div className="text-text">500</div>
                    <div className="text-text">{isAptCurrency ? '0.61 APT' : '$0.61'}</div>
                    <div className="text-white/70">0xabcd...efgh</div>
                  </div>
                  
                  {/* Sample Transaction Row 3 */}
                  <div className="grid grid-cols-6 gap-4 py-3 text-sm border-b border-white/10">
                    <div className="text-white/70">12m ago</div>
                    <div className="text-green-400">Buy</div>
                    <div className="text-text">{isAptCurrency ? '0.00121' : '$0.00121'}</div>
                    <div className="text-text">2,000</div>
                    <div className="text-text">{isAptCurrency ? '2.42 APT' : '$2.42'}</div>
                    <div className="text-white/70">0x9876...5432</div>
                  </div>
                  
                  {/* Sample Transaction Row 4 */}
                  <div className="grid grid-cols-6 gap-4 py-3 text-sm border-b border-white/10">
                    <div className="text-white/70">1h ago</div>
                    <div className="text-red-400">Sell</div>
                    <div className="text-text">{isAptCurrency ? '0.00120' : '$0.00120'}</div>
                    <div className="text-text">750</div>
                    <div className="text-text">{isAptCurrency ? '0.90 APT' : '$0.90'}</div>
                    <div className="text-white/70">0x5678...1234</div>
                  </div>
                  
                  {/* Sample Transaction Row 5 */}
                  <div className="grid grid-cols-6 gap-4 py-3 text-sm border-b border-white/10">
                    <div className="text-white/70">3h ago</div>
                    <div className="text-green-400">Buy</div>
                    <div className="text-text">{isAptCurrency ? '0.00119' : '$0.00119'}</div>
                    <div className="text-text">1,500</div>
                    <div className="text-text">{isAptCurrency ? '1.79 APT' : '$1.79'}</div>
                    <div className="text-white/70">0xdcba...hgfe</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Section - 25% */}
          <div className="w-1/4 p-4 overflow-y-auto scrollbar-hide min-w-0">
            <Swap
              marketAddress={marketAddress}
              onDataRefresh={fetchTokenData}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 