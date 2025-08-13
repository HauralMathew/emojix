import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Aptos, AptosConfig } from '@aptos-labs/ts-sdk';
import { CONTRACT_ADDRESS, APTOS_API_KEY, DEVNET } from '../constants/contract';
import { useToast } from '../hooks/use-toast';

interface SwapProps {
  marketAddress?: string;
  onDataRefresh?: () => void;
}

// Types for contract data
interface MarketVotingInfo {
  market_address: string;
  total_votes: number;
  bullish_votes: number;
  bearish_votes: number;
  bullish_percentage: number;
  bearish_percentage: number;
  last_vote_time: number;
}

interface SwapSimulation {
  market_id: number;
  time: number;
  market_nonce: number;
  swapper: string;
  input_amount: number;
  is_sell: boolean;
  net_proceeds: number;
  base_volume: number;
  quote_volume: number;
  avg_execution_price_q64: number;
  starts_in_bonding_curve: boolean;
  results_in_state_transition: boolean;
  balance_as_fraction_of_circulating_supply_before_q64: number;
  balance_as_fraction_of_circulating_supply_after_q64: number;
}

interface MarketDisplayData {
  market_id: number;
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
  total_supply: number;
  circulating_supply: number;
  aptos_balance: number;
  created_time: number;
  cumulative_volume: number;
  total_swaps: number;
  current_price: number;
  market_cap: number;
  fdv: number;
  liquidity: number;
  age_seconds: number;
  price_5m_ago: number;
  price_1h_ago: number;
  price_24h_ago: number;
}

// Slippage settings types
interface SlippageSettings {
  mode: 'auto' | 'custom';
  value: number; // percentage as decimal (e.g., 5 = 5%)
}

// Slippage Settings Component
const SlippageSettings: React.FC<{
  settings: SlippageSettings;
  onSettingsChange: (settings: SlippageSettings) => void;
}> = ({ settings, onSettingsChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customValue, setCustomValue] = useState(settings.value.toString());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        // Check if the click is on the portal dropdown
        const portalDropdown = document.querySelector('[data-slippage-dropdown]');
        if (!portalDropdown || !portalDropdown.contains(target)) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleModeChange = (mode: 'auto' | 'custom') => {
    if (mode === 'auto') {
      onSettingsChange({ mode: 'auto', value: 5 });
    } else {
      onSettingsChange({ mode: 'custom', value: parseFloat(customValue) || 5 });
    }
  };

  const handleCustomValueChange = (value: string) => {
    setCustomValue(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 50) {
      onSettingsChange({ mode: 'custom', value: numValue });
    }
  };

  const presetValues = [0.1, 0.5, 1, 5];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-xs text-white/70 hover:text-white/90 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className={settings.mode === 'custom' && settings.value > 10 ? 'text-yellow-400' : ''}>
          Slippage: {settings.value}%
        </span>
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && createPortal(
        <div 
          data-slippage-dropdown
          className="fixed w-64 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 z-[9999] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          style={{
            top: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().bottom + 8 : 0,
            left: dropdownRef.current ? Math.max(16, dropdownRef.current.getBoundingClientRect().right - 256) : 0,
          }}
        >
          <div className="text-sm font-semibold text-text mb-3">Slippage Tolerance</div>
          
          {/* Auto/Custom Toggle */}
          <div className="flex mb-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleModeChange('auto');
              }}
              className={`flex-1 py-2 px-3 text-xs rounded-l-lg transition-colors ${
                settings.mode === 'auto' 
                  ? 'bg-primary/30 text-primary border border-primary/50' 
                  : 'bg-white/5 text-white/70 border border-white/10'
              }`}
            >
              Auto
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleModeChange('custom');
              }}
              className={`flex-1 py-2 px-3 text-xs rounded-r-lg transition-colors ${
                settings.mode === 'custom' 
                  ? 'bg-primary/30 text-primary border border-primary/50' 
                  : 'bg-white/5 text-white/70 border border-white/10'
              }`}
            >
              Custom
            </button>
          </div>

          {settings.mode === 'auto' ? (
            <div className="text-xs text-white/50 mb-3">
              Auto slippage: 5% (recommended for most trades)
            </div>
          ) : (
            <>
              {/* Preset Values */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {presetValues.map((value) => (
                  <button
                    key={value}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCustomValueChange(value.toString());
                    }}
                    className={`py-2 px-3 text-xs rounded transition-colors ${
                      settings.value === value
                        ? 'bg-primary/30 text-primary border border-primary/50'
                        : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {value}%
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={customValue}
                  onChange={(e) => handleCustomValueChange(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="0.5"
                  className="flex-1 bg-white/5 border border-white/20 rounded px-3 py-2 text-xs text-text placeholder:text-white/30"
                  step="0.1"
                  min="0.1"
                  max="50"
                />
                <span className="text-xs text-white/50">%</span>
              </div>
              
              <div className="text-xs text-white/50 mt-2">
                Your transaction will revert if the price changes unfavorably by more than this percentage.
              </div>
              
              {settings.value > 10 && (
                <div className="text-xs text-yellow-400 mt-2">
                  ⚠️ High slippage may result in significant price impact
                </div>
              )}
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

const Swap: React.FC<SwapProps> = ({ marketAddress, onDataRefresh }) => {
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const { toast } = useToast();
  
  // Initialize Aptos client
  const aptosConfig = useMemo(() => new AptosConfig({ 
    network: DEVNET,
    clientConfig: {
      API_KEY: APTOS_API_KEY
    }
  }), []);
  const aptos = useMemo(() => new Aptos(aptosConfig), [aptosConfig]);
  
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Trading state
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isSell, setIsSell] = useState(false);
  const [isLoadingBullish, setIsLoadingBullish] = useState(false);
  const [isLoadingBearish, setIsLoadingBearish] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationTimeout, setSimulationTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Slippage settings state
  const [slippageSettings, setSlippageSettings] = useState<SlippageSettings>({
    mode: 'auto',
    value: 5
  });
  
  // Contract data state
  const [votingData, setVotingData] = useState<MarketVotingInfo | null>(null);
  const [marketData, setMarketData] = useState<MarketDisplayData | null>(null);
  const [bondingCurveProgress, setBondingCurveProgress] = useState(0);
  const [bondingCurveRaised, setBondingCurveRaised] = useState(0);
  const [bondingCurveToGraduate, setBondingCurveToGraduate] = useState(0);

  // APT Balance state
  const [aptBalance, setAptBalance] = useState<bigint>(0n);
  const [aptBalanceError, setAptBalanceError] = useState<string | null>(null);

  // ===== ENTRY FUNCTIONS (Write to Blockchain) =====

  // Vote bullish on a market
  const voteBullish = async () => {
    if (!connected || !account?.address || !marketAddress || !CONTRACT_ADDRESS) {
      toast('Please connect your wallet to vote', { variant: 'destructive' });
      return;
    }

    try {
      setIsLoadingBullish(true);
      
      const response = await signAndSubmitTransaction({
        data: {
          function: `${CONTRACT_ADDRESS}::emojixcore::vote_on_market`,
          typeArguments: [],
          functionArguments: [
            marketAddress,
            1 // VOTE_TYPE_BULLISH = 1
          ]
        }
      });

      if (response) {
        toast('Successfully voted bullish! 🐂', { variant: 'default' });
        // Refresh all data after successful transaction
        setTimeout(() => {
          refreshAllData();
        }, 1500);
      }
    } catch (error) {
      toast('Failed to vote bullish. Please try again.', { variant: 'destructive' });
    } finally {
      setIsLoadingBullish(false);
    }
  };

  // Vote bearish on a market
  const voteBearish = async () => {
    if (!connected || !account?.address || !marketAddress || !CONTRACT_ADDRESS) {
      toast('Please connect your wallet to vote', { variant: 'destructive' });
      return;
    }

    try {
      setIsLoadingBearish(true);
      
      const response = await signAndSubmitTransaction({
        data: {
          function: `${CONTRACT_ADDRESS}::emojixcore::vote_on_market`,
          typeArguments: [],
          functionArguments: [
            marketAddress,
            2 // VOTE_TYPE_BEARISH = 2
          ]
        }
      });

      if (response) {
        toast('Successfully voted bearish! 🐻', { variant: 'default' });
        // Refresh all data after successful transaction
        setTimeout(() => {
          refreshAllData();
        }, 1500);
      }
    } catch (error) {
      toast('Failed to vote bearish. Please try again.', { variant: 'destructive' });
    } finally {
      setIsLoadingBearish(false);
    }
  };

  // ===== VIEW FUNCTIONS (Read from Blockchain) =====

  // Fetch voting data from contract
  const fetchVotingData = useCallback(async () => {
    if (!marketAddress || !CONTRACT_ADDRESS) return;
    
    try {
      const response = await aptos.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::emojixcore::get_market_voting_info`,
          typeArguments: [],
          functionArguments: [marketAddress]
        }
      });
      
      if (response && Array.isArray(response) && response.length > 0) {
        const firstElement = response[0] as any;
        if (firstElement && firstElement.vec && Array.isArray(firstElement.vec) && firstElement.vec.length > 0) {
          const rawVotingInfo = firstElement.vec[0] as any;
          
          const votingInfo: MarketVotingInfo = {
            market_address: rawVotingInfo.market_address,
            total_votes: parseInt(rawVotingInfo.total_votes) || 0,
            bullish_votes: parseInt(rawVotingInfo.bullish_votes) || 0,
            bearish_votes: parseInt(rawVotingInfo.bearish_votes) || 0,
            bullish_percentage: parseInt(rawVotingInfo.bullish_percentage) || 0,
            bearish_percentage: parseInt(rawVotingInfo.bearish_percentage) || 0,
            last_vote_time: parseInt(rawVotingInfo.last_vote_time) || 0,
          };
          
          setVotingData(votingInfo);
        }
      }
    } catch (error) {
      // Error fetching voting data
    }
  }, [marketAddress, aptos]);

  // Get bullish percentage
  const getBullishPercentage = (): number => {
    if (!votingData) return 0;
    return votingData.bullish_percentage / 100;
  };

  // Get bearish percentage
  const getBearishPercentage = (): number => {
    if (!votingData) return 0;
    return votingData.bearish_percentage / 100;
  };

  // Get total votes count
  const getTotalVotesCount = (): number => {
    if (!votingData) return 0;
    return votingData.total_votes || 0;
  };

  // ===== APT BALANCE FUNCTIONS =====

  // Fetch APT balance
  const fetchAptBalance = useCallback(async () => {
    if (!connected || !account?.address) {
      setAptBalance(0n);
      setAptBalanceError(null);
      return;
    }

    try {
      setAptBalanceError(null);

      const response = await aptos.view({
        payload: {
          function: '0x1::coin::balance',
          typeArguments: ['0x1::aptos_coin::AptosCoin'],
          functionArguments: [account.address]
        }
      });

      if (response && Array.isArray(response) && response.length > 0) {
        const balance = BigInt(response[0] as string);
        setAptBalance(balance);
      } else {
        setAptBalance(0n);
      }
    } catch (error) {
      setAptBalanceError(error instanceof Error ? error.message : 'Failed to fetch APT balance');
      setAptBalance(0n);
    }
  }, [connected, account?.address, aptos]);

  // Format APT balance for display
  const formatAptBalance = useCallback((decimals: number = 8): string => {
    const divisor = BigInt(10 ** decimals);
    const whole = aptBalance / divisor;
    const fraction = aptBalance % divisor;
    const fractionStr = fraction.toString().padStart(decimals, '0').replace(/0+$/, '');
    
    if (fractionStr === '') {
      return whole.toString();
    }
    return `${whole}.${fractionStr}`;
  }, [aptBalance]);

  // ===== SWAP FUNCTIONS =====

  // Handle swap execution
  const handleSwap = async () => {
    if (!connected || !account?.address || !marketAddress || !CONTRACT_ADDRESS) {
      toast('Please connect your wallet to trade', { variant: 'destructive' });
      return;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast('Please enter a valid amount', { variant: 'destructive' });
      return;
    }

    try {
      setIsLoading(true);
      
      const inputAmount = Math.floor(parseFloat(fromAmount) * 100000000); // Convert to octas
      
      // Calculate minimum output amount using user-defined slippage
      let minOutputAmount: number;
      const slippageMultiplier = 1 - (slippageSettings.value / 100);
      
      // Use the simulation result for slippage calculation
      minOutputAmount = Math.floor(parseFloat(toAmount) * 100000000 * slippageMultiplier);
      
      const functionArguments = [
        marketAddress,
        inputAmount,
        Boolean(isSell),
        minOutputAmount
      ];
      
      const response = await signAndSubmitTransaction({
        data: {
          function: `${CONTRACT_ADDRESS}::emojixcore::swap`,
          typeArguments: [],
          functionArguments
        }
      });

      if (response) {
        toast(`Successfully ${isSell ? 'sold' : 'bought'} tokens!`, { variant: 'default' });
        setFromAmount('');
        setToAmount('');
        // Refresh all data after successful transaction
        setTimeout(() => {
          refreshAllData();
        }, 1500);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('User has rejected')) {
          toast('Transaction was rejected. Please try again.', { variant: 'destructive' });
        } else if (error.message.includes('insufficient funds')) {
          toast('Insufficient APT balance. Please check your wallet.', { variant: 'destructive' });
        } else {
          toast('Failed to execute swap. Please try again.', { variant: 'destructive' });
        }
      } else {
        toast('Failed to execute swap. Please try again.', { variant: 'destructive' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch market data for bonding curve progress
  const fetchMarketData = useCallback(async () => {
    if (!marketAddress || !CONTRACT_ADDRESS) return;
    
    try {
      const response = await aptos.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::emojixcore::get_market_display_data`,
          typeArguments: [],
          functionArguments: [marketAddress]
        }
      });
      
      if (response && Array.isArray(response) && response.length > 0) {
        const firstElement = response[0] as any;
        if (firstElement && firstElement.vec && Array.isArray(firstElement.vec) && firstElement.vec.length > 0) {
          const marketInfo = firstElement.vec[0] as MarketDisplayData;
          setMarketData(marketInfo);
          
          // Calculate bonding curve progress
          if (marketInfo.in_bonding_curve) {
            const targetAPT = 2100; // 2,100 APT target from contract
            const raisedAPT = marketInfo.aptos_balance / 100000000; // Convert from octas
            const progress = Math.min((raisedAPT / targetAPT) * 100, 100);
            setBondingCurveProgress(progress);
            setBondingCurveRaised(raisedAPT);
            setBondingCurveToGraduate(targetAPT - raisedAPT);
          } else {
            setBondingCurveProgress(100);
            setBondingCurveRaised(2100);
            setBondingCurveToGraduate(0);
          }
        }
      }
    } catch (error) {
      // Error fetching market data
    }
  }, [marketAddress, aptos]);

  // ===== DATA REFRESH FUNCTION =====
  
  // Refresh all data after successful transactions
  const refreshAllData = useCallback(async () => {
    try {
      // Refresh Swap component data
      await Promise.all([
        fetchVotingData(),
        fetchMarketData(),
        fetchAptBalance()
      ]);
      
      // Refresh Trading page data if callback provided
      if (onDataRefresh) {
        onDataRefresh();
      }
    } catch (error) {
      // Silently handle refresh errors
    }
  }, [fetchVotingData, fetchMarketData, fetchAptBalance, onDataRefresh]);



  // Simulate swap to calculate output amount
  const simulateSwap = async (inputAmount: number, isSell: boolean) => {
    if (!marketAddress || !CONTRACT_ADDRESS) {
      console.log('Simulation failed: Missing required parameters', { marketAddress, CONTRACT_ADDRESS });
      return 0;
    }
    
    // Use connected account address or a dummy address for simulation
    const swapperAddress = account?.address || "0x0000000000000000000000000000000000000000000000000000000000000001";
    
    try {
      const functionArguments = [
        swapperAddress,
        marketAddress,
        Math.floor(inputAmount * 100000000), // Convert to octas
        Boolean(isSell),
        75 // 0.75% swap fee in basis points
      ];
      
      console.log('Simulating swap with arguments:', functionArguments);
      
      const response = await aptos.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::emojixcore::simulate_swap`,
          typeArguments: [],
          functionArguments
        }
      });
      
      console.log('Simulation response:', response);
      
      if (response && Array.isArray(response) && response.length > 0) {
        const swapResult = response[0] as SwapSimulation;
        const netProceeds = swapResult.net_proceeds / 100000000; // Convert from octas
        console.log('Simulation successful, net proceeds:', netProceeds);
        return netProceeds;
      }
      
      console.log('Simulation failed: Invalid response format');
      return 0;
    } catch (error) {
      console.error('Simulation error:', error);
      return 0;
    }
  };

  // Handle amount input changes
  const handleFromAmountChange = async (value: string) => {
    setFromAmount(value);
    
    // Clear any existing simulation timeout
    if (simulationTimeout) {
      clearTimeout(simulationTimeout);
    }
    
    if (value && parseFloat(value) > 0) {
      const inputAmount = parseFloat(value);
      
      // Set loading state for simulation
      setIsSimulating(true);
      setToAmount('');
      
      // Debounce simulation with 500ms delay
      const timeout = setTimeout(async () => {
        try {
          const outputAmount = await simulateSwap(inputAmount, isSell);
          if (outputAmount > 0) {
            setToAmount(outputAmount.toFixed(4));
          } else {
            setToAmount('');
          }
        } catch (error) {
          setToAmount('');
        } finally {
          setIsSimulating(false);
        }
      }, 500);
      
      setSimulationTimeout(timeout);
    } else {
      setToAmount('');
      setIsSimulating(false);
    }
  };

  const handleToAmountChange = async (value: string) => {
    setToAmount(value);
    
    // For reverse calculation, we'll just clear the input amount
    // and let the user enter the input amount to see the output
    setFromAmount('');
  };

  // Handle swap direction change
  const handleSwapDirection = () => {
    setIsSell(!isSell);
    // Swap amounts
    const temp = fromAmount;
    setFromAmount(toAmount);
    setToAmount(temp);
  };

  // Helper function to get the proper emoji symbol
  const getEmojiSymbol = () => {
    if (!marketData) return 'Token';
    
    // Try to use emoji_bytes first, fallback to token_symbol
    if (marketData.emoji_bytes && marketData.emoji_bytes.length > 0) {
      try {
        // Handle hex format (e.g., "0xf09f91bb")
        if (marketData.emoji_bytes.startsWith('0x')) {
          const hexString = marketData.emoji_bytes.slice(2); // Remove '0x'
          const bytes = new Uint8Array(hexString.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
          const decoder = new TextDecoder('utf-8');
          const emoji = decoder.decode(bytes);
          return emoji || marketData.token_symbol || 'Token';
        } else {
          // Handle comma-separated format
          const emoji = String.fromCharCode(...marketData.emoji_bytes.split(',').map(Number));
          return emoji || marketData.token_symbol || 'Token';
        }
      } catch (error) {
        return marketData.token_symbol || 'Token';
      }
    }
    
    return marketData.token_symbol || 'Token';
  };

  // Helper function to get appropriate text size class for token symbols
  const getTokenSymbolClass = (symbol: string) => {
    const isEmoji = symbol !== 'APT' && symbol !== 'Token' && (
      symbol.length === 1 && symbol.charCodeAt(0) > 127 ||
      symbol.length > 1 && /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(symbol)
    );
    
    return isEmoji ? 'text-3xl' : 'text-lg';
  };

  // Get current token info based on swap direction
  const getFromTokenInfo = () => {
    if (isSell) {
      return {
        symbol: getEmojiSymbol(),
        balance: '0', // TODO: Implement token balance fetching
        error: null
      };
    } else {
      return {
        symbol: 'APT',
        balance: formatAptBalance(),
        error: aptBalanceError
      };
    }
  };

  const getToTokenInfo = () => {
    if (isSell) {
      return {
        symbol: 'APT',
        balance: formatAptBalance(),
        error: aptBalanceError
      };
    } else {
      return {
        symbol: getEmojiSymbol(),
        balance: '0', // TODO: Implement token balance fetching
        error: null
      };
    }
  };

  const fromTokenInfo = getFromTokenInfo();
  const toTokenInfo = getToTokenInfo();

  // Fetch data only once on mount
  useEffect(() => {
    if (marketAddress) {
      fetchVotingData();
      fetchMarketData();
    }
  }, [marketAddress, fetchVotingData, fetchMarketData]);

  // Fetch APT balance when account changes
  useEffect(() => {
    if (connected && account?.address) {
      fetchAptBalance();
    }
  }, [connected, account?.address, fetchAptBalance]);

  // Animate the bar when contract data changes
  useEffect(() => {
    if (votingData) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [votingData]);

  // Cleanup simulation timeout on unmount
  useEffect(() => {
    return () => {
      if (simulationTimeout) {
        clearTimeout(simulationTimeout);
      }
    };
  }, [simulationTimeout]);

  return (
    <>
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
        {/* Title and Vote Count */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text">Community Sentiment</h3>
          <span className="text-xs text-white/70">
            {getTotalVotesCount().toLocaleString()} votes
          </span>
        </div>

        {/* Sentiment Bar */}
        <div className="mb-4">
          <div className="flex items-center space-x-3">
            <span 
              className="text-xs text-white/70 min-w-[30px] transition-all duration-300"
              id="bullish-percentage"
            >
              {getBullishPercentage().toFixed(1)}%
            </span>

            <div className="flex-1 h-3 rounded-full overflow-hidden relative group">
              {/* Bullish Section */}
              <div 
                className="absolute top-0 left-0 h-full bg-green-600 transition-all duration-300 ease-out cursor-pointer z-10"
                style={{ 
                  width: `${getBullishPercentage()}%`,
                  transform: isAnimating ? 'scaleX(0.95)' : 'scaleX(1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.4)';
                  e.currentTarget.style.height = '44px';
                  e.currentTarget.style.marginTop = '-16px';
                  e.currentTarget.style.zIndex = '20';
                  
                  const bullishPercentage = document.getElementById('bullish-percentage');
                  if (bullishPercentage) {
                    bullishPercentage.style.transform = 'scale(1.4)';
                    bullishPercentage.style.fontWeight = 'bold';
                    bullishPercentage.style.color = '#22c55e';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = isAnimating ? 'scaleX(0.95)' : 'scaleX(1)';
                  e.currentTarget.style.height = '12px';
                  e.currentTarget.style.marginTop = '0px';
                  e.currentTarget.style.zIndex = '10';
                  
                  const bullishPercentage = document.getElementById('bullish-percentage');
                  if (bullishPercentage) {
                    bullishPercentage.style.transform = 'scale(1)';
                    bullishPercentage.style.fontWeight = 'normal';
                    bullishPercentage.style.color = '';
                  }
                }}
                title="Bullish sentiment"
              />
              
              {/* Bearish Section */}
              <div 
                className="absolute top-0 right-0 h-full bg-red-600 transition-all duration-300 ease-out cursor-pointer z-10"
                style={{ 
                  width: `${getBearishPercentage()}%`,
                  transform: isAnimating ? 'scaleX(0.95)' : 'scaleX(1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.4)';
                  e.currentTarget.style.height = '44px';
                  e.currentTarget.style.marginTop = '-16px';
                  e.currentTarget.style.zIndex = '20';
                  
                  const bearishPercentage = document.getElementById('bearish-percentage');
                  if (bearishPercentage) {
                    bearishPercentage.style.transform = 'scale(1.4)';
                    bearishPercentage.style.fontWeight = 'bold';
                    bearishPercentage.style.color = '#dc2626';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = isAnimating ? 'scaleX(0.95)' : 'scaleX(1)';
                  e.currentTarget.style.height = '12px';
                  e.currentTarget.style.marginTop = '0px';
                  e.currentTarget.style.zIndex = '10';
                  
                  const bearishPercentage = document.getElementById('bearish-percentage');
                  if (bearishPercentage) {
                    bearishPercentage.style.transform = 'scale(1)';
                    bearishPercentage.style.fontWeight = 'normal';
                    bearishPercentage.style.color = '';
                  }
                }}
                title="Bearish sentiment"
              />
            </div>

            <span 
              className="text-xs text-white/70 min-w-[30px] text-right transition-all duration-300"
              id="bearish-percentage"
            >
              {getBearishPercentage().toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Voting Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={voteBullish}
            disabled={isLoadingBullish || isLoadingBearish || !connected}
            className="flex-1 py-2 px-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingBullish ? 'Voting...' : '🐂 Bullish'}
          </button>
          <button
            onClick={voteBearish}
            disabled={isLoadingBullish || isLoadingBearish || !connected}
            className="flex-1 py-2 px-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingBearish ? 'Voting...' : '🐻 Bearish'}
          </button>
        </div>
      </div>

      {/* Slippage Settings - Outside trading container */}
      <div className="mt-4 mb-4">
        <div className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
          <span className="text-sm text-white/70">Slippage Tolerance</span>
          <SlippageSettings 
            settings={slippageSettings}
            onSettingsChange={setSlippageSettings}
          />
        </div>
      </div>

      {/* Trading Setup - Outside Sentiment Box */}
      <div className="mt-4">
        <div className="relative">
          {/* Top Box - From */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 mb-2">
            <div className="flex items-center justify-between">
              {/* Left side - Amount */}
              <div className="flex-1">
                <div className="text-sm text-white/70 mb-1">Amount</div>
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent text-lg font-semibold text-text border-none outline-none placeholder:text-white/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  step="0.0001"
                  min="0"
                  disabled={isLoading}
                />
              </div>
              
              {/* Right side - Token Info */}
              <div className="text-right ml-4">
                <div className={`font-semibold text-text ${getTokenSymbolClass(fromTokenInfo.symbol)}`}>
                  {fromTokenInfo.symbol}
                </div>
                <div className="text-xs text-white/50">
                  {fromTokenInfo.error ? `Error: ${fromTokenInfo.error}` : 
                   `Balance: ${fromTokenInfo.balance}`}
                </div>
              </div>
            </div>
          </div>

          {/* Center Circle with Arrow - Overlapping both boxes */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-1/2 w-8 h-8 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:border-lime-400 hover:bg-white/15 z-10"
            onClick={handleSwapDirection}
          >
            <svg 
              className="w-4 h-4 text-white transition-transform duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>

          {/* Bottom Box - To */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 mt-2">
            <div className="flex items-center justify-between">
              {/* Left side - Amount */}
              <div className="flex-1">
                <div className="text-sm text-white/70 mb-1">Amount</div>
                <div className="relative">
                  <input
                    type="number"
                    value={toAmount}
                    onChange={(e) => handleToAmountChange(e.target.value)}
                    placeholder={isSimulating ? "" : "0.00"}
                    className={`w-full bg-transparent text-lg font-semibold border-none outline-none placeholder:text-white/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                      isSimulating ? 'text-white/50' : 'text-text'
                    }`}
                    step="0.0001"
                    min="0"
                    disabled={isLoading || isSimulating}
                  />
                  {isSimulating && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 border border-white/30 border-t-white/70 rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right side - Token Info */}
              <div className="text-right ml-4">
                <div className={`font-semibold text-text ${getTokenSymbolClass(toTokenInfo.symbol)}`}>
                  {toTokenInfo.symbol}
                </div>
                <div className="text-xs text-white/50">
                  {toTokenInfo.error ? `Error: ${toTokenInfo.error}` : 
                   `Balance: ${toTokenInfo.balance}`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="mt-4">
          <button
            onClick={handleSwap}
            disabled={!fromAmount || !toAmount || parseFloat(fromAmount) <= 0 || isLoading || isSimulating || !connected}
            className="w-full py-3 px-4 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : (isSell ? 'Sell Tokens' : 'Buy Tokens')}
          </button>
        </div>
      </div>

      {/* Bonding Curve Progress */}
      <div className="mt-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-white/70">Bonding Curve Progress</div>
          <div className="text-sm font-semibold text-text">{bondingCurveProgress.toFixed(1)}%</div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${bondingCurveProgress}%` }}
          ></div>
        </div>
        
        {/* Values Row */}
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-sm font-semibold text-text text-left">{bondingCurveRaised.toFixed(2)} APT</div>
            <div className="text-xs text-white/50 text-left">Raised</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-text text-left">{bondingCurveToGraduate.toFixed(2)} APT</div>
            <div className="text-xs text-white/50 text-left">to Graduate</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Swap; 