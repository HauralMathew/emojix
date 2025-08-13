import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation } from 'swiper/modules';
import { Aptos, AptosConfig } from '@aptos-labs/ts-sdk';
import { CONTRACT_ADDRESS, APTOS_API_KEY, DEVNET } from '../constants/contract';
import { useToast } from '../hooks/use-toast';
import { useCurrency } from '../context/CurrencyContext';
import { useAptPrice } from '../hooks/useAptPrice';
import { convertAptToUsd, formatAptAmount } from '../utils/priceConversion';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// Interfaces for real data
interface MarketDisplayData {
  market_id: string;
  market_address: string;
  emoji_bytes: string;
  token_symbol: string;
  market_name: string;
  token_name: string;
  canonical_image: string;
  category: number;
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
  creator_address: string;
}



const Discover: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAptCurrency } = useCurrency();
  const { aptPrice } = useAptPrice();
  const [loading, setLoading] = useState(true);
  const [allMarkets, setAllMarkets] = useState<TokenMarketData[]>([]);
  const [featuredMarkets, setFeaturedMarkets] = useState<TokenMarketData[]>([]);
  const [trendingMarkets, setTrendingMarkets] = useState<TokenMarketData[]>([]);
  
  // Initialize Aptos client
  const aptosConfig = useMemo(() => new AptosConfig({ 
    network: DEVNET,
    clientConfig: {
      API_KEY: APTOS_API_KEY
    }
  }), []);
  const aptos = useMemo(() => new Aptos(aptosConfig), [aptosConfig]);

  // Helper function to format prices based on currency toggle
  const formatPrice = (aptAmount: number): string => {
    if (!aptPrice) return isAptCurrency ? `${aptAmount.toFixed(7)} APT` : '$0.00';
    
    if (isAptCurrency) {
      return `${formatAptAmount(aptAmount)} APT`;
    } else {
      return convertAptToUsd(aptAmount, aptPrice);
    }
  };

  const formatMarketCap = (aptAmount: number): string => {
    if (!aptPrice) return isAptCurrency ? `${aptAmount.toFixed(3)} APT` : '$0.00';
    
    if (isAptCurrency) {
      return `${aptAmount.toFixed(3)} APT`;
    } else {
      return convertAptToUsd(aptAmount, aptPrice);
    }
  };

  const formatVolume = (aptAmount: number): string => {
    if (!aptPrice) return isAptCurrency ? `${aptAmount.toFixed(3)} APT` : '$0.00';
    
    if (isAptCurrency) {
      return `${aptAmount.toFixed(3)} APT`;
    } else {
      return convertAptToUsd(aptAmount, aptPrice);
    }
  };

  // Fetch all markets data
  const fetchMarketsData = async () => {
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
      
      // Convert to TokenMarketData format
      const processedMarkets: TokenMarketData[] = actualMarketData.map((market: MarketDisplayData) => {
        // Convert emoji bytes to emoji
        const emoji = market.token_symbol;
        
        // Convert price from contract precision to APT
        const price = parseFloat(market.current_price || '0') / 100000000;
        const marketCap = parseFloat(market.market_cap || '0') / 100000000;
        const fdv = parseFloat(market.fdv || '0') / 100000000;
        const volume24h = parseFloat(market.cumulative_volume || '0') / 100000000;
        
        // Calculate price changes
        const currentPrice = parseFloat(market.current_price) / 100000000;
        const currentTime = Date.now() * 1000;
        
        const price5mAgo = parseFloat(market.price_5m_ago) / (2 ** 64);
        const price1hAgo = parseFloat(market.price_1h_ago) / (2 ** 64);
        const price24hAgo = parseFloat(market.price_24h_ago) / (2 ** 64);
        
        const price5mTime = parseFloat(market.price_5m_time);
        const price1hTime = parseFloat(market.price_1h_time);
        const price24hTime = parseFloat(market.price_24h_time);
        
        // Calculate time-based price changes
        const calculateTimeBasedPriceChange = (current: number, historical: number, historicalTime: number, periodSeconds: number): number => {
          if (isNaN(historical) || isNaN(current) || isNaN(historicalTime) || current <= 0 || historical <= 0) {
            return 0;
          }
          
          const timeDiff = (currentTime - historicalTime) / 1000000;
          const periodDiff = Math.abs(timeDiff - periodSeconds);
          
          if (periodDiff > (periodSeconds * 0.1)) {
            return 0;
          }
          
          return ((current - historical) / historical) * 100;
        };
        
        const change5m = calculateTimeBasedPriceChange(currentPrice, price5mAgo, price5mTime, 5 * 60);
        const change1h = calculateTimeBasedPriceChange(currentPrice, price1hAgo, price1hTime, 60 * 60);
        const change24h = calculateTimeBasedPriceChange(currentPrice, price24hAgo, price24hTime, 24 * 60 * 60);
        
        // Format age
        const formatAge = (seconds: number): string => {
          if (seconds < 60) return `${seconds}s`;
          if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
          if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
          return `${Math.floor(seconds / 86400)}d`;
        };
        
                  return {
            market_id: parseInt(market.market_id),
            market_address: market.market_address,
            emoji,
            token_name: market.token_name,
            market_name: market.market_name,
            price,
            marketCap,
            fdv,
            liquidity: parseFloat(market.liquidity || '0') / 100000000,
            total_supply: parseFloat(market.total_supply || '0') / 100000000,
            circulating_supply: parseFloat(market.circulating_supply || '0') / 100000000,
            age: formatAge(parseInt(market.age_seconds)),
            age_seconds: parseInt(market.age_seconds),
            volume24h,
            change5m,
            change1h,
            change24h,
            category: market.category_string,
            total_swaps: parseInt(market.total_swaps),
            imageDataUrl: market.canonical_image,
            in_bonding_curve: market.in_bonding_curve,
            creator_address: market.creator_address
          };
      });
      
      setAllMarkets(processedMarkets);
      
      // Set featured markets (top 5 by volume)
      const sortedByVolume = [...processedMarkets].sort((a, b) => b.volume24h - a.volume24h);
      setFeaturedMarkets(sortedByVolume.slice(0, 5));
      
      // Set trending markets (top 16 by 24h change)
      const sortedByChange = [...processedMarkets].sort((a, b) => b.change24h - a.change24h);
      setTrendingMarkets(sortedByChange.slice(0, 16));
      
    } catch (error) {
      console.error('Error fetching markets data:', error);
      toast('Failed to fetch markets data', { variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Handle navigation to trading page
  const handleTokenClick = (market: TokenMarketData) => {
    navigate(`/trading/${market.market_address}`);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchMarketsData();
  }, []);

  const handleSlideChange = () => {
    // Slide change handled by Swiper component
  };

  // Simple scroll state management
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll position
  const checkScrollPosition = () => {
    const topRow = document.getElementById('top-row');
    const bottomRow = document.getElementById('bottom-row');
    
    if (topRow && bottomRow) {
      const topAtStart = topRow.scrollLeft <= 0;
      const bottomAtStart = bottomRow.scrollLeft <= 0;
      const topAtEnd = topRow.scrollLeft >= topRow.scrollWidth - topRow.clientWidth - 1;
      const bottomAtEnd = bottomRow.scrollLeft >= bottomRow.scrollWidth - bottomRow.clientWidth - 1;
      
      setCanScrollLeft(!topAtStart || !bottomAtStart);
      setCanScrollRight(!topAtEnd || !bottomAtEnd);
    }
  };

  // Drag to scroll state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragScrollLeft, setDragScrollLeft] = useState(0);

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent, containerId: string) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    setIsDragging(true);
    setDragStartX(e.pageX - container.offsetLeft);
    setDragScrollLeft(container.scrollLeft);
    container.style.cursor = 'grabbing';
  };

  // Handle drag move
  const handleMouseMove = (e: React.MouseEvent, containerId: string) => {
    if (!isDragging) return;
    
    const container = document.getElementById(containerId);
    if (!container) return;
    
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - dragStartX) * 2; // Scroll speed multiplier
    container.scrollLeft = dragScrollLeft - walk;
  };

  // Handle drag end
  const handleMouseUp = (containerId: string) => {
    const container = document.getElementById(containerId);
    if (container) {
      container.style.cursor = 'grab';
    }
    setIsDragging(false);
  };

  // Handle mouse leave
  const handleMouseLeave = (containerId: string) => {
    if (isDragging) {
      const container = document.getElementById(containerId);
      if (container) {
        container.style.cursor = 'grab';
      }
      setIsDragging(false);
    }
  };

  // Initialize scroll position check
  React.useEffect(() => {
    checkScrollPosition();
    
    const topRow = document.getElementById('top-row');
    const bottomRow = document.getElementById('bottom-row');
    
    if (topRow) topRow.addEventListener('scroll', checkScrollPosition);
    if (bottomRow) bottomRow.addEventListener('scroll', checkScrollPosition);
    
    return () => {
      if (topRow) topRow.removeEventListener('scroll', checkScrollPosition);
      if (bottomRow) bottomRow.removeEventListener('scroll', checkScrollPosition);
    };
  }, []);

  // Simple price chart component
  const PriceChart = ({ data }: { data: number[] }) => {
    // Filter out NaN and invalid values
    const validData = data.filter(price => !isNaN(price) && isFinite(price));
    
    if (validData.length === 0) {
      // Return a flat line if no valid data
      return (
        <div className="w-48 h-20 bg-surface/30 rounded-lg p-2">
          <div className="text-center mb-1">
            <p className="text-xs text-text/60">7D CHART</p>
          </div>
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="0" y1="50" x2="100" y2="50" stroke="#84CC16" strokeWidth="2" />
          </svg>
        </div>
      );
    }
    
    const maxPrice = Math.max(...validData);
    const minPrice = Math.min(...validData);
    const range = maxPrice - minPrice || 1; // Prevent division by zero
    
    // Add padding to prevent chart from touching edges
    const padding = range * 0.3; // 30% padding
    const adjustedMax = maxPrice + padding;
    const adjustedMin = minPrice - padding;
    const adjustedRange = adjustedMax - adjustedMin;
    
    const points = validData.map((price, index) => {
      const x = (index / (validData.length - 1)) * 100; // Add 10% margin on sides
      const y = 100 - ((price - adjustedMin) / adjustedRange) * 80 - 10; // Add 10% margin top/bottom
      return `${x},${y}`;
    }).join(' ');

    // Create proper polygon points for gradient fill
    const firstPoint = points.split(' ')[0];
    const lastPoint = points.split(' ')[points.split(' ').length - 1];
    const firstX = firstPoint.split(',')[0];
    const lastX = lastPoint.split(',')[0];
    const polygonPoints = `${points} ${lastX},90 ${firstX},90`;

    return (
      <div className="w-48 h-20 bg-surface/30 rounded-lg p-2">
        <div className="text-center mb-1">
          <p className="text-xs text-text/60">7D CHART</p>
        </div>
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          <line x1="10" y1="25" x2="90" y2="25" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
          <line x1="10" y1="50" x2="90" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
          <line x1="10" y1="75" x2="90" y2="75" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
          
          {/* Gradient fill */}
          <defs>
            <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#84CC16" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#84CC16" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <polygon
            fill="url(#priceGradient)"
            points={polygonPoints}
          />
          
          {/* Price line */}
          <polyline
            fill="none"
            stroke="#84CC16"
            strokeWidth="2"
            points={points}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  };

    if (loading) {
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
            <div className="animate-pulse">
              <div className="h-96 bg-surface/30 rounded-2xl mb-12"></div>
              <div className="h-8 bg-surface/30 rounded w-48 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} className="h-32 bg-surface/30 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

  return (
    <div className="min-h-screen bg-background p-4 relative overflow-hidden">
      {/* Spotlight from bottom right */}
      <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
      
      {/* Flare from top left */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      
      {/* Tiny Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '15px 15px'
        }}
      />
      
      {/* Content */}
      <div className="mx-auto relative z-10 mt-16 px-4">
        <div className="w-full mx-auto relative group">
        
        {/* Navigation Arrows - Only visible on hover */}
        <button
          className="swiper-button-prev absolute left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-surface/20 backdrop-blur-xl border border-white/10 rounded-full text-primary hover:text-primary/90 hover:bg-surface/30 transition-all duration-300 shadow-lg opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
          aria-label="Previous slide"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          className="swiper-button-next absolute right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-surface/20 backdrop-blur-xl border border-white/10 rounded-full text-primary hover:text-primary/90 hover:bg-surface/30 transition-all duration-300 shadow-lg opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0"
          aria-label="Next slide"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 18l6-6-6-6" />
          </svg>
        </button>
        
        <Swiper
          spaceBetween={32}
          slidesPerView={1}
          loop={featuredMarkets.length > 1}
          pagination={{ clickable: true, el: '.custom-swiper-pagination' }}
          navigation={{ nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }}
          autoplay={featuredMarkets.length > 1 ? { delay: 2500, disableOnInteraction: false } : false}
          modules={[Pagination, Autoplay, Navigation]}
          className="rounded-2xl shadow-2xl"
          onSlideChange={handleSlideChange}
        >
          {featuredMarkets.map((market, idx) => (
            <SwiperSlide key={idx}>
              <div 
                className="relative h-96 rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform duration-300"
                onClick={() => handleTokenClick(market)}
              >
                {/* Cover Image or Gradient Background */}
                <div className="w-full h-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent"></div>
                
                {/* Bottom to Top Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent"></div>
                
                {/* Content Overlay - Left Aligned */}
                <div className="absolute bottom-6 left-6 z-20">
                  {/* Token Icon */}
                  <div className="flex items-center justify-center w-20 h-20 bg-surface/50 rounded-xl mb-4 overflow-hidden">
                    {market.imageDataUrl ? (
                      <img 
                        src={market.imageDataUrl} 
                        alt={market.token_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to emoji if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <span className={`text-4xl ${market.imageDataUrl ? 'hidden' : ''}`}>{market.emoji}</span>
                  </div>
                  
                  {/* Emoji Name */}
                  <h3 className="text-3xl font-semibold text-text mb-1">{market.token_name}</h3>
                  
                  {/* Creator Username */}
                  <button 
                    className="text-sm text-text mb-3 font-medium hover:text-primary transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(market.creator_address);
                      toast('Creator address copied to clipboard!');
                    }}
                    title="Click to copy creator address"
                  >
                    By @{market.creator_address?.slice(0, 8)}...
                  </button>
                  
                  {/* Stats Rectangle - Separate Component */}
                  <div className="bg-surface/20 backdrop-blur-2xl border border-white/10 rounded-lg p-4 shadow-2xl">
                    <div className="flex items-center justify-between space-x-6">
                      <div className="text-left">
                        <p className="text-xs text-text/60 mb-2">PRICE</p>
                        <p className="text-sm font-semibold text-primary">{formatPrice(market.price)}</p>
                      </div>
                      <div className="w-px h-12 bg-white/10"></div>
                      <div className="text-left">
                        <p className="text-xs text-text/60 mb-2">MARKET CAP</p>
                        <p className="text-sm font-semibold text-text">{formatMarketCap(market.marketCap)}</p>
                      </div>
                      <div className="w-px h-12 bg-white/10"></div>
                      <div className="text-left">
                        <p className="text-xs text-text/60 mb-2">24H VOL</p>
                        <p className="text-sm font-semibold text-text">{formatVolume(market.volume24h)}</p>
                      </div>
                      <div className="w-px h-12 bg-white/10"></div>
                      <div className="text-left">
                        <p className="text-xs text-text/60 mb-2">HOLDERS</p>
                        <p className="text-sm font-semibold text-text">{market.total_swaps.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Chart - Bottom Right */}
                <div className="absolute bottom-6 right-6 z-20">
                  <PriceChart data={[
                    market.price * (1 + (market.change24h || 0) / 100), // 7 days ago
                    market.price * (1 + (market.change24h || 0) / 100 * 0.8), // 6 days ago
                    market.price * (1 + (market.change24h || 0) / 100 * 0.6), // 5 days ago
                    market.price * (1 + (market.change24h || 0) / 100 * 0.4), // 4 days ago
                    market.price * (1 + (market.change24h || 0) / 100 * 0.2), // 3 days ago
                    market.price * (1 + (market.change1h || 0) / 100), // 1 day ago
                    market.price // current price
                  ]} />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        
                        {/* Custom Swiper Pagination */}
        <div className="custom-swiper-pagination flex justify-center mt-8 gap-1"></div>
      </div>

      {/* Trending Tokens Section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-text mb-6">Trending Tokens</h2>
        
        <div className="relative">
          {/* Two Row Grid Container */}
          <div className="space-y-1">
            {/* Top Row */}
            <div className="relative">
              <div 
                className="flex space-x-4 overflow-x-auto scrollbar-hide pb-3 cursor-grab" 
                id="top-row"
                onMouseDown={(e) => handleMouseDown(e, 'top-row')}
                onMouseMove={(e) => handleMouseMove(e, 'top-row')}
                onMouseUp={() => handleMouseUp('top-row')}
                onMouseLeave={() => handleMouseLeave('top-row')}
              >
                {trendingMarkets.slice(0, 8).map((market, index) => (
                  <div 
                    key={index}
                    className="flex-shrink-0 w-80 bg-surface/20 backdrop-blur-xl border border-white/10 rounded-xl p-3 hover:bg-surface/30 transition-all duration-300 cursor-pointer"
                    onClick={() => handleTokenClick(market)}
                  >
                    <div className="flex items-center justify-between h-full">
                      {/* Left side: Icon and text info */}
                      <div className="flex items-center space-x-3 flex-1">
                        {/* Icon */}
                        <div className="w-14 h-14 bg-surface/30 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {market.imageDataUrl ? (
                            <img 
                              src={market.imageDataUrl} 
                              alt={market.token_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback to emoji if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <span className={`text-2xl ${market.imageDataUrl ? 'hidden' : ''}`}>{market.emoji}</span>
                        </div>
                        
                        {/* Name and price info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-text">
                            {market.token_name.length > 15 ? `${market.token_name.slice(0, 15)}...` : market.token_name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-primary">{formatPrice(market.price)}</p>
                            <span className={`text-sm font-medium ${market.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {market.change24h >= 0 ? '+' : ''}{market.change24h.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right side: Line chart */}
                      <div className="flex-shrink-0 ml-4">
                        <svg className="w-16 h-8" viewBox="0 0 64 32" preserveAspectRatio="none">
                          <polyline
                            fill="none"
                            stroke="#84CC16"
                            strokeWidth="1.5"
                            points="4,28 8,26 12,22 16,18 20,14 24,10 28,8 32,6 36,8 40,12 44,16 48,20 52,24 56,26 60,28"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Bottom Row */}
            <div className="relative">
              <div 
                className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4 cursor-grab" 
                id="bottom-row"
                onMouseDown={(e) => handleMouseDown(e, 'bottom-row')}
                onMouseMove={(e) => handleMouseMove(e, 'bottom-row')}
                onMouseUp={() => handleMouseUp('bottom-row')}
                onMouseLeave={() => handleMouseLeave('bottom-row')}
              >
                {trendingMarkets.slice(8, 16).map((market, index) => (
                  <div 
                    key={index + 8}
                    className="flex-shrink-0 w-80 bg-surface/20 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:bg-surface/30 transition-all duration-300 cursor-pointer"
                    onClick={() => handleTokenClick(market)}
                  >
                    <div className="flex items-center justify-between h-full">
                      {/* Left side: Icon and text info */}
                      <div className="flex items-center space-x-3 flex-1">
                        {/* Icon */}
                        <div className="w-14 h-14 bg-surface/30 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {market.imageDataUrl ? (
                            <img 
                              src={market.imageDataUrl} 
                              alt={market.token_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback to emoji if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <span className={`text-2xl ${market.imageDataUrl ? 'hidden' : ''}`}>{market.emoji}</span>
                        </div>
                        
                        {/* Name and price info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-text">
                            {market.token_name.length > 15 ? `${market.token_name.slice(0, 15)}...` : market.token_name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-primary">{formatPrice(market.price)}</p>
                            <span className={`text-sm font-medium ${market.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {market.change24h >= 0 ? '+' : ''}{market.change24h.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right side: Line chart */}
                      <div className="flex-shrink-0 ml-4">
                        <svg className="w-16 h-8" viewBox="0 0 64 32" preserveAspectRatio="none">
                          <polyline
                            fill="none"
                            stroke="#84CC16"
                            strokeWidth="1.5"
                            points="4,28 8,26 12,22 16,18 20,14 24,10 28,8 32,6 36,8 40,12 44,16 48,20 52,24 56,26 60,28"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Navigation Arrows - Left and Right Middle */}
          <button 
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-surface/20 backdrop-blur-xl border border-white/10 rounded-full text-primary hover:text-primary/90 hover:bg-surface/30 transition-all duration-300 shadow-lg ${
              canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => {
              const topContainer = document.getElementById('top-row');
              const bottomContainer = document.getElementById('bottom-row');
              if (topContainer && bottomContainer) {
                const scrollAmount = 800; // Simple fixed scroll amount
                topContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                bottomContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
              }
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          
          <button 
            className={`absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-surface/20 backdrop-blur-xl border border-white/10 rounded-full text-primary hover:text-primary/90 hover:bg-surface/30 transition-all duration-300 shadow-lg ${
              canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => {
              const topContainer = document.getElementById('top-row');
              const bottomContainer = document.getElementById('bottom-row');
              if (topContainer && bottomContainer) {
                const scrollAmount = 800; // Simple fixed scroll amount
                topContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                bottomContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
              }
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* New Tokens Section */}
      <div className="mt-12">
        {/* Header with Filter Tabs and Arrow */}
        <div className="flex items-center justify-between mb-6">
          {/* Filter Tabs */}
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 border bg-primary text-background border-primary">
              All Tokens
            </button>
            <button className="px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 border bg-surface/20 text-text/70 hover:bg-surface/30 hover:text-text border-white/5">
              Trending
            </button>
            <button className="px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 border bg-surface/20 text-text/70 hover:bg-surface/30 hover:text-text border-white/5">
              New
            </button>
          </div>

          {/* Animated Arrow */}
          <div className="flex items-center space-x-2 text-primary">
            <span className="text-sm font-medium">View All</span>
            <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>

        {/* Grid of Tokens */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {allMarkets.map((market, index) => {

            return (
              <div 
                key={index}
                className="bg-surface/20 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:bg-surface/30 transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                onClick={() => handleTokenClick(market)}
              >
                    <div className="flex items-stretch space-x-2 h-full">
                   {/* Token Icon - Full Height */}
                   <div className="w-16 bg-surface/30 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                     {market.imageDataUrl ? (
                       <img 
                         src={market.imageDataUrl} 
                         alt={market.token_name}
                         className="w-[85%] h-[85%] object-cover"
                         onError={(e) => {
                           // Fallback to emoji if image fails to load
                           const target = e.target as HTMLImageElement;
                           target.style.display = 'none';
                           target.nextElementSibling?.classList.remove('hidden');
                         }}
                       />
                     ) : null}
                     <span className={`text-3xl ${market.imageDataUrl ? 'hidden' : ''}`}>{market.emoji}</span>
                   </div>

                   {/* Token Info */}
                   <div className="flex-1 min-w-0 flex justify-between">
                     {/* Left Column: Token, Creator, Vol, Age, CA */}
                     <div className="flex flex-col space-y-2">
                       {/* Token Name and Creator */}
                       <div className="space-y-0.5">
                         <h3 className="font-semibold text-text truncate">
                          {market.token_name.length > 15 ? `${market.token_name.slice(0, 12)}...` : market.token_name}
                         </h3>
                         <button 
                           className="text-xs text-text/60 hover:text-primary transition-colors cursor-pointer"
                           onClick={(e) => {
                             e.stopPropagation();
                             navigator.clipboard.writeText(market.creator_address);
                             toast('Creator address copied to clipboard!');
                           }}
                           title="Click to copy creator address"
                         >
                           @{market.creator_address?.slice(0, 8)}...
                         </button>
                       </div>
                       
                       {/* Volume */}
                       <div className="flex items-center space-x-1">
                         <svg className="w-4 h-4 text-text" fill="currentColor" viewBox="0 0 24 24">
                           <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
                         </svg>
                         <span className="text-xs text-text whitespace-nowrap">{formatVolume(market.volume24h)}</span>
                       </div>
                       
                       {/* Age */}
                       <div className="flex items-center space-x-1">
                         <svg className="w-4 h-4 text-text" fill="currentColor" viewBox="0 0 24 24">
                           <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                           <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                         </svg>
                         <span className="text-xs text-text">{market.age}</span>
                       </div>
                       
                       {/* Contract Address */}
                       <button 
                         className="text-xs text-text/60 truncate hover:text-primary transition-colors cursor-pointer"
                         onClick={(e) => {
                           e.stopPropagation();
                           navigator.clipboard.writeText(market.market_address);
                           toast('Contract address copied to clipboard!');
                         }}
                         title="Click to copy contract address"
                       >
                         CA: {market.market_address?.slice(0, 8)}...{market.market_address?.slice(-8)}
                       </button>
                     </div>

                     {/* Right Column: Price, Change, Mkt Cap, Holders, Socials */}
                     <div className="flex flex-col space-y-2 items-end">
                       {/* Price and 24h Change */}
                       <div className="space-y-0.5 text-right">
                         <p className="text-sm font-medium text-primary whitespace-nowrap">{formatPrice(market.price)}</p>
                         <span className={`text-xs font-medium ${market.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                           {market.change24h >= 0 ? '+' : ''}{market.change24h.toFixed(2)}%
                         </span>
                       </div>
                       
                       {/* Market Cap */}
                       <div className="flex items-center space-x-1">
                         <svg className="w-4 h-4 text-text" fill="currentColor" viewBox="0 0 24 24">
                           <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                         </svg>
                         <span className="text-xs text-text whitespace-nowrap">{formatMarketCap(market.marketCap)}</span>
                       </div>
                       
                       {/* Holders */}
                       <div className="flex items-center space-x-1">
                         <svg className="w-4 h-4 text-text" fill="currentColor" viewBox="0 0 24 24">
                           <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01 1l-1.7 2.26V9c0-.55-.45-1-1-1s-1 .45-1 1v6h2v7h4z"/>
                           <path d="M8 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 6.54 8H5c-.8 0-1.54.37-2.01 1L1.29 11.26V9c0-.55-.45-1-1-1s-1 .45-1 1v6h2v7h4z"/>
                         </svg>
                         <span className="text-xs text-text">{market.total_swaps.toLocaleString()}</span>
                       </div>
                       
                       {/* Social Icons */}
                       <div className="flex items-center space-x-1">
                         <button className="w-5 h-5 bg-surface/30 rounded flex items-center justify-center hover:bg-surface/40 transition-colors">
                           <svg className="w-3 h-3 text-text/60" fill="currentColor" viewBox="0 0 24 24">
                             <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                           </svg>
                         </button>
                         <button className="w-5 h-5 bg-surface/30 rounded flex items-center justify-center hover:bg-surface/40 transition-colors">
                           <svg className="w-3 h-3 text-text/60" fill="currentColor" viewBox="0 0 24 24">
                             <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                           </svg>
                         </button>
                         <button className="w-5 h-5 bg-surface/30 rounded flex items-center justify-center hover:bg-surface/40 transition-colors">
                           <svg className="w-3 h-3 text-text/60" fill="currentColor" viewBox="0 0 24 24">
                             <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                           </svg>
                         </button>
                       </div>
                     </div>
                   </div>
                 </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <style>{`

        
        /* Override Swiper's default styling to match our custom arrows */
        .swiper-button-prev,
        .swiper-button-next {
          width: 48px !important; /* w-12 = 48px */
          height: 48px !important; /* w-12 = 48px */
          background: rgba(35, 45, 26, 0.2) !important; /* bg-surface/20 */
          backdrop-filter: blur(16px) !important; /* backdrop-blur-xl */
          border: 1px solid rgba(255, 255, 255, 0.1) !important; /* border-white/10 */
          border-radius: 50% !important; /* rounded-full */
          color: #84CC16 !important; /* primary color */
          margin-top: 0 !important;
          transition: all 0.3s !important;
        }
        
        .swiper-button-prev:hover,
        .swiper-button-next:hover {
          background: rgba(35, 45, 26, 0.3) !important; /* hover:bg-surface/30 */
          color: rgba(132, 204, 22, 0.9) !important; /* hover:text-primary/90 */
        }
        
        .swiper-button-prev:after,
        .swiper-button-next:after {
          display: none !important; /* Hide Swiper's default arrows */
        }
        
        /* Ensure our custom SVG icons are properly sized */
        .swiper-button-prev svg,
        .swiper-button-next svg {
          width: 20px !important; /* w-5 = 20px */
          height: 20px !important; /* w-5 = 20px */
        }
        
        .custom-swiper-pagination .swiper-pagination-bullet {
          width: 40px;
          height: 6px;
          background: #232D1A; /* surface */
          border-radius: 8px;
          box-shadow: none;
          border: none;
          opacity: 1;
          margin: 0 3px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-block;
          position: relative;
          overflow: hidden;
        }
        .custom-swiper-pagination .swiper-pagination-bullet-active {
          background: #84CC16; /* primary */
          width: 80px;
          box-shadow: 0 0 20px rgba(132, 204, 22, 0.3);
        }
        .custom-swiper-pagination .swiper-pagination-bullet:hover {
          background: #84CC16;
          transform: scaleY(1.2);
        }
        
        /* Hide scrollbar */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Simple scroll behavior */
        #top-row, #bottom-row {
          scroll-behavior: smooth;
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
        
        /* Prevent text selection during drag */
        #top-row:active, #bottom-row:active {
          cursor: grabbing !important;
        }
      `}</style>
        </div>
      </div>
  );
};

export default Discover;