import { useState, useEffect, useCallback } from 'react';
import { IconBrandX, IconWorld, IconAlertTriangle, IconEdit, IconCopy } from '@tabler/icons-react';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { truncateAddress } from '@aptos-labs/wallet-adapter-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';

export default function Portfolio() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('tokens');
  const { isAuthenticated, getProfile } = useWalletAuth();
  const { account } = useWallet();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Debug authentication state (only log when it changes to true)
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🔍 Portfolio - Authentication state changed to true');
    }
  }, [isAuthenticated]);

  const tabs = [
    { id: 'tokens', label: 'Tokens' },
    { id: 'created', label: 'Created' },
    { id: 'watchlist', label: 'Watchlist' },
    { id: 'activity', label: 'Activity' }
  ];

  // Memoize the loadProfile function to prevent infinite re-renders
  const loadProfile = useCallback(async () => {
    // Check current authentication state directly from authService
    const hasToken = !!authService.getToken();
    console.log('🔄 Loading profile, isAuthenticated from state:', isAuthenticated, 'hasToken:', hasToken);
    
    if (isAuthenticated || hasToken) {
      setIsLoading(true);
      try {
        const result = await getProfile();
        console.log('📊 Profile result:', result);
        if (result.success && result.user) {
          setUserProfile(result.user);
          console.log('✅ Profile loaded successfully');
        } else {
          console.log('❌ Profile load failed:', result.error);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        toast('Failed to load profile', { variant: 'destructive' });
      }
    } else {
      setUserProfile(null);
      console.log('❌ Not authenticated, clearing profile');
    }
    setIsLoading(false);
  }, [isAuthenticated, getProfile, toast]);

  // Initial load when component mounts
  useEffect(() => {
    console.log('🚀 Portfolio: Component mounted, isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
      loadProfile();
    }
  }, []); // Only run on mount

  // Listen for authentication events and trigger reload
  useEffect(() => {
    const handleAuthEvent = (event: CustomEvent) => {
      console.log('🔔 Auth event received:', event.detail);
      if (event.detail.type === 'authenticated' || event.detail.type === 'logout') {
        console.log('🔄 Triggering profile reload due to auth event');
        loadProfile();
      }
    };

    // Listen for custom auth events
    window.addEventListener('auth-state-changed', handleAuthEvent as EventListener);
    console.log('👂 Portfolio: Auth event listener attached');
    
    return () => {
      window.removeEventListener('auth-state-changed', handleAuthEvent as EventListener);
      console.log('👂 Portfolio: Auth event listener removed');
    };
  }, [loadProfile]);

  // Fallback: Also trigger reload when isAuthenticated changes directly
  useEffect(() => {
    console.log('🔄 Portfolio: isAuthenticated changed to:', isAuthenticated);
    if (isAuthenticated) {
      console.log('🔄 Portfolio: Triggering loadProfile due to isAuthenticated change');
      loadProfile();
    }
  }, [isAuthenticated, loadProfile]);

  // Format joined date
  const formatJoinedDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  // Get display name (display_name, ANS name, or truncated address)
  const getDisplayName = () => {
    if (userProfile?.display_name) {
      return userProfile.display_name;
    }
    if (userProfile?.ans_name) {
      return userProfile.ans_name;
    }
    if (account?.ansName) {
      return account.ansName;
    }
    if (account?.address) {
      return truncateAddress(account.address.toString());
    }
    return 'Unknown User';
  };

  // Get wallet address
  const getWalletAddress = () => {
    if (account?.address) {
      return truncateAddress(account.address.toString());
    }
    return 'Not connected';
  };

  // Get domain name
  const getDomainName = () => {
    if (userProfile?.ans_name) {
      return `${userProfile.ans_name}.apt`;
    }
    if (account?.ansName) {
      return `${account.ansName}.apt`;
    }
    return 'No domain';
  };

  // Get joined date
  const getJoinedDate = () => {
    if (userProfile?.created_at) {
      return formatJoinedDate(userProfile.created_at);
    }
    return 'Unknown';
  };

  // Get user ID
  const getUserId = () => {
    if (userProfile?.id) {
      return `#${userProfile.id}`;
    }
    return '#Unknown';
  };

  // Navigate to edit profile page
  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  // Handle report user
  const handleReportUser = () => {
    // TODO: Implement report functionality
    toast('Report functionality coming soon');
  };

  // Copy wallet address to clipboard
  const handleCopyAddress = async () => {
    if (!account?.address) return;
    
    try {
      await navigator.clipboard.writeText(account.address.toString());
      toast('Wallet address copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy wallet address:', error);
    }
  };

  // Check if current user is viewing their own profile
  const isOwnProfile = () => {
    if (!account?.address || !userProfile?.address) return false;
    return account.address.toString().toLowerCase() === userProfile.address.toLowerCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text">Loading profile...</div>
      </div>
    );
  }

  if (!isAuthenticated && !authService.getToken()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-text text-xl mb-4">Please authenticate to view your portfolio</div>
          <div className="text-text/60">Connect your wallet and authenticate to see your profile information</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Section */}
      <div className="relative h-96 w-full">
        {/* Cover Image */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
          {/* Placeholder for cover image - you can replace with actual image */}
          <div className="w-full h-full bg-gradient-to-br from-surface/40 to-surface/20"></div>
        </div>
        
        {/* Bottom to up black gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        {/* Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end justify-between">
            {/* Left Side - Profile Info */}
            <div className="flex flex-col space-y-4">
              {/* Profile Picture - Above Username */}
              <div className="w-24 h-24 bg-primary/20 rounded-lg border-2 border-white/20 flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              
              {/* Username Row with Socials */}
              <div className="flex items-center space-x-4">
                {/* Username */}
                <h1 className="text-2xl font-bold text-white">{getDisplayName()}</h1>
                
                {/* Vertical Divider */}
                <div className="w-px h-6 bg-white/20"></div>
                
                {/* Socials and Action Buttons */}
                <div className="flex items-center space-x-3">
                  <a href="#" className="text-white/80 hover:text-white transition-colors">
                    <IconBrandX className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-white/80 hover:text-white transition-colors">
                    <IconWorld className="w-5 h-5" />
                  </a>
                  
                  {/* Show Edit button only for own profile */}
                  {isOwnProfile() && (
                    <button 
                      onClick={handleEditProfile}
                      className="relative text-white/80 hover:text-white transition-colors group"
                      aria-label="Edit profile"
                      title="Edit profile"
                    >
                      <IconEdit className="w-5 h-5" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                        Edit Profile
                      </div>
                    </button>
                  )}
                  
                  {/* Show Report button only for other users' profiles */}
                  {!isOwnProfile() && (
                    <button 
                      onClick={handleReportUser}
                      className="relative text-white/80 hover:text-white transition-colors group"
                      aria-label="Report user"
                      title="Report user"
                    >
                      <IconAlertTriangle className="w-5 h-5" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                        Report User
                      </div>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Bottom Row - User Info */}
              <div className="flex items-center space-x-4 text-white/80 text-sm">
                <span>Joined {getJoinedDate()}</span>
                <span>ID: {getUserId()}</span>
                
                {/* Domain Name */}
                <div className="flex items-center space-x-2">
                  <span>{getDomainName()}</span>
                </div>
                
                {/* Wallet Address with Copy Button */}
                <div className="flex items-center space-x-2">
                  <span>Wallet: {getWalletAddress()}</span>
                  {account?.address && (
                    <button
                      onClick={handleCopyAddress}
                      className="text-white/80 hover:text-white transition-colors"
                      aria-label="Copy wallet address"
                      title="Copy wallet address"
                    >
                      <IconCopy className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <span>XP: 2,450</span>
              </div>
            </div>
            
            {/* Right Side - Stats */}
            <div className="flex items-center space-x-10 mr-9">
              <div className="text-left">
                <div className="text-white font-bold text-lg mb-1">$12,450</div>
                <div className="text-white/60 text-xs">Net Worth</div>
              </div>
              <div className="text-left">
                <div className="text-white font-bold text-lg mb-1">$8,230</div>
                <div className="text-white/60 text-xs">USD Value</div>
              </div>
              <div className="text-left">
                <div className="text-white font-bold text-lg mb-1">156</div>
                <div className="text-white/60 text-xs">Tokens</div>
              </div>
              <div className="text-left">
                <div className="text-white font-bold text-lg mb-1">$2.4M</div>
                <div className="text-white/60 text-xs">Volume</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs Section */}
      <div className="border-b border-white/10">
        <div className="mx-auto px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text/60 hover:text-text'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-text/60 text-center py-12">
          {activeTab === 'tokens' && <p>Your tokens will appear here</p>}
          {activeTab === 'created' && <p>Your created emoticons will appear here</p>}
          {activeTab === 'watchlist' && <p>Your watchlist items will appear here</p>}
          {activeTab === 'activity' && <p>Your activity history will appear here</p>}
        </div>
      </div>
    </div>
  );
} 