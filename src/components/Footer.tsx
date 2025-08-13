import { useState, useEffect } from 'react';
import { useAptPrice } from '../hooks/useAptPrice';
import aptosIcon from '../assets/icons/Aptos_mark_WHT (1).png';

export default function Footer() {
  const [isCreatorMode, setIsCreatorMode] = useState(true);
  const [isAptCurrency, setIsAptCurrency] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Real-time APT price from Panora API
  const { aptPrice, loading: priceLoading } = useAptPrice();

  // Dark mode functionality
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Format price with proper decimal places
  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return '$0.00';
    
    // Show 2 decimal places for prices >= $1, 4 for prices < $1
    if (numPrice >= 1) {
      return `$${numPrice.toFixed(2)}`;
    } else {
      return `$${numPrice.toFixed(4)}`;
    }
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-surface/20 backdrop-blur-xl border-t border-white/10 h-8 z-50">
      <div className="mx-auto px-12 h-full ml-[52px]">
        <div className="flex items-center justify-between h-full">
          {/* Left Section */}
          <div className="flex items-center space-x-6">
            {/* Live Indicator */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-text/80 text-xs font-medium tracking-wide">Live</span>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-3">
              {/* X (Twitter) */}
              <a href="#" className="text-text/60 hover:text-primary transition-colors duration-200 p-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              
              {/* Telegram */}
              <a href="#" className="text-text/60 hover:text-primary transition-colors duration-200 p-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.486 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
              
              {/* Discord */}
              <a href="#" className="text-text/60 hover:text-primary transition-colors duration-200 p-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
            </div>

            {/* Privacy & Terms */}
            <div className="flex items-center space-x-4">
              <a href="#" className="text-text/70 hover:text-primary transition-colors duration-200 text-xs font-medium tracking-wide">
                Privacy Policy
              </a>
              <a href="#" className="text-text/70 hover:text-primary transition-colors duration-200 text-xs font-medium tracking-wide">
                Terms of Use
              </a>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-6">
            {/* APT Price - Now with real-time data */}
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-primary/20 rounded-full flex items-center justify-center overflow-hidden">
                <img 
                  src={aptosIcon} 
                  alt="Aptos" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center space-x-1">
                {priceLoading ? (
                  <div className="w-3 h-3 border border-primary/30 border-t-primary rounded-full animate-spin"></div>
                ) : aptPrice ? (
                  <span className="text-text/80 text-xs font-medium tracking-wide">
                    {formatPrice(aptPrice.usdPrice)}
                  </span>
                ) : (
                  <span className="text-text/80 text-xs font-medium tracking-wide">$0.00</span>
                )}
              </div>
            </div>

            {/* APT/USD Currency Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-text/70 text-xs font-medium tracking-wide">Crypto</span>
              <button
                onClick={() => setIsAptCurrency(!isAptCurrency)}
                className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors duration-200 ${
                  isAptCurrency ? 'bg-primary' : 'bg-white/10 border border-white/20'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full transition-all duration-200 ${
                    isAptCurrency 
                      ? 'bg-background translate-x-4' 
                      : 'bg-white/40 translate-x-1'
                  }`}
                />
              </button>
              <span className="text-text/70 text-xs font-medium tracking-wide">USD</span>
            </div>

            {/* Creator/Explorer Mode Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-text/70 text-xs font-medium tracking-wide">Creator</span>
              <button
                onClick={() => setIsCreatorMode(!isCreatorMode)}
                className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors duration-200 ${
                  isCreatorMode ? 'bg-primary' : 'bg-white/10 border border-white/20'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full transition-all duration-200 ${
                    isCreatorMode 
                      ? 'bg-background translate-x-4' 
                      : 'bg-white/40 translate-x-1'
                  }`}
                />
              </button>
              <span className="text-text/70 text-xs font-medium tracking-wide">Explorer</span>
            </div>

            {/* Dark/Light Mode Toggle */}
            <div className="flex items-center space-x-2">
              <svg className="w-3.5 h-3.5 text-text/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors duration-200 ${
                  isDarkMode ? 'bg-primary' : 'bg-white/10 border border-white/20'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-background translate-x-4' 
                      : 'bg-white/40 translate-x-1'
                  }`}
                />
              </button>
              <svg className="w-3.5 h-3.5 text-text/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 