import { useState, useEffect } from 'react';
import { WalletSelector } from "@/components/WalletSelector";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      // Check if we're at the very top of the page
      setIsScrolled(scrollTop > 0);
    };

    // Set initial state - force transparent on page load
    setIsScrolled(false);

    // Add a small delay to ensure proper scroll detection after page load
    const timer = setTimeout(() => {
      handleScroll();
    }, 100);

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 h-16 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-surface/20 backdrop-blur-xl border-b border-white/10 shadow-sm' 
        : 'bg-transparent border-transparent shadow-none'
    }`}>
      <div className="h-full w-full px-8">
        <div className="flex justify-between items-center h-full">
          {/* Search Bar */}
          <div className="flex-1 max-w-sm ml-[48px]">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className={`h-4 w-4 ${isScrolled ? 'text-text/60' : 'text-text/90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className={`text-[15px] block w-full pl-10 pr-10 py-2 border rounded-md text-text placeholder-text/80 focus:outline-none focus:ring-0 focus:border-white/10 transition-all duration-200 ${
                  isScrolled 
                    ? 'bg-surface/30 border-white/10' 
                    : 'bg-white/5 border-white/30'
                }`}
                style={{ outline: 'none', boxShadow: 'none' }}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="flex items-center space-x-1 text-text/90 text-xs">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>⌘K</span>
                </div>
              </div>
            </div>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4 ml-6">
            {/* Get Mobile App Button */}
            <button className="flex items-center space-x-2 px-3 py-2 text-text/80 hover:text-primary transition-colors duration-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">Get Mobile App</span>
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-white/20"></div>

            <WalletSelector />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden ml-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-text hover:text-primary transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Buttons */}
              <div className="pt-4 space-y-2">
                <button className="flex items-center space-x-2 px-3 py-2 text-text/80 hover:text-primary transition-colors duration-200 w-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">Get Mobile App</span>
                </button>

                {/* Mobile Sign In Button */}
                <div className="px-3 py-2">
                  <button className="w-full px-4 py-1.5 text-sm font-medium text-black bg-primary hover:bg-primary/90 rounded-sm transition-colors duration-200">
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 