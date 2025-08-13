import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useToast } from '@/hooks/use-toast';

interface ConnectedWallet {
  address: string;
  ansName?: string;
  walletName: string;
  isAuthenticated: boolean;
  isActive: boolean;
}

interface WalletManagerContextType {
  connectedWallets: ConnectedWallet[];
  activeWallet: ConnectedWallet | null;
  addWallet: (address: string, walletName: string, ansName?: string) => void;
  removeWallet: (address: string) => void;
  switchWallet: (address: string) => Promise<void>;
  authenticateWallet: (address: string) => Promise<boolean>;
  logoutWallet: (address: string) => Promise<void>;
  logoutAllWallets: () => Promise<void>;
}

const WalletManagerContext = createContext<WalletManagerContextType | undefined>(undefined);

export const useWalletManager = () => {
  const context = useContext(WalletManagerContext);
  if (!context) {
    throw new Error('useWalletManager must be used within a WalletManagerProvider');
  }
  return context;
};

interface WalletManagerProviderProps {
  children: React.ReactNode;
}

export const WalletManagerProvider: React.FC<WalletManagerProviderProps> = ({ children }) => {
  const { account, connected, disconnect } = useWallet();
  const { authenticate, logout: authLogout } = useWalletAuth();
  const { toast } = useToast();
  
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallet[]>([]);
  const [activeWallet, setActiveWallet] = useState<ConnectedWallet | null>(null);

  // Load wallets from localStorage on mount
  useEffect(() => {
    const savedWallets = localStorage.getItem('connectedWallets');
    if (savedWallets) {
      try {
        const wallets = JSON.parse(savedWallets);
        setConnectedWallets(wallets);
        
        // Set active wallet
        const active = wallets.find((w: ConnectedWallet) => w.isActive);
        setActiveWallet(active || null);
      } catch (error) {
        console.error('Failed to load saved wallets:', error);
      }
    }
  }, []);

  // Save wallets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('connectedWallets', JSON.stringify(connectedWallets));
  }, [connectedWallets]);

  // Handle wallet connection/disconnection
  useEffect(() => {
    if (connected && account?.address) {
      const address = account.address.toString();
      const existingWallet = connectedWallets.find(w => w.address === address);
      
      if (!existingWallet) {
        // New wallet connected
        addWallet(address, 'Aptos Wallet', account.ansName);
      }
    } else if (!connected) {
      // Wallet disconnected - this will be handled by the wallet adapter
    }
  }, [connected, account]);

  const addWallet = useCallback((address: string, walletName: string, ansName?: string) => {
    setConnectedWallets(prev => {
      const existing = prev.find(w => w.address === address);
      if (existing) return prev;
      
      const newWallet: ConnectedWallet = {
        address,
        ansName,
        walletName,
        isAuthenticated: false,
        isActive: prev.length === 0 // First wallet becomes active
      };
      
      const updated = [...prev, newWallet];
      
      // If this is the first wallet, set it as active
      if (prev.length === 0) {
        setActiveWallet(newWallet);
      }
      
      return updated;
    });
  }, []);

  const removeWallet = useCallback((address: string) => {
    setConnectedWallets(prev => {
      const updated = prev.filter(w => w.address !== address);
      
      // If we removed the active wallet, set the first remaining as active
      if (activeWallet?.address === address) {
        const newActive = updated[0] || null;
        setActiveWallet(newActive);
      }
      
      return updated;
    });
  }, [activeWallet]);

  const switchWallet = useCallback(async (address: string) => {
    const wallet = connectedWallets.find(w => w.address === address);
    if (!wallet) {
      toast('Wallet not found', { variant: 'destructive' });
      return;
    }

    // If switching to a different wallet, logout the current one first
    if (activeWallet && activeWallet.address !== address) {
      await logoutWallet(activeWallet.address);
    }

    // Update active wallet
    setConnectedWallets(prev => 
      prev.map(w => ({
        ...w,
        isActive: w.address === address
      }))
    );
    
    setActiveWallet(wallet);
    toast(`Switched to ${wallet.ansName || wallet.address.slice(0, 8)}...`);
  }, [connectedWallets, activeWallet, toast]);

  const authenticateWallet = useCallback(async (address: string): Promise<boolean> => {
    const wallet = connectedWallets.find(w => w.address === address);
    if (!wallet) {
      toast('Wallet not found', { variant: 'destructive' });
      return false;
    }

    // If another wallet is authenticated, logout it first
    const authenticatedWallet = connectedWallets.find(w => w.isAuthenticated);
    if (authenticatedWallet && authenticatedWallet.address !== address) {
      await logoutWallet(authenticatedWallet.address);
    }

    try {
      const result = await authenticate();
      if (result.success) {
        setConnectedWallets(prev => 
          prev.map(w => ({
            ...w,
            isAuthenticated: w.address === address
          }))
        );
        
        // Update active wallet
        setActiveWallet(prev => prev ? { ...prev, isAuthenticated: true } : null);
        
        toast('Wallet authenticated successfully!');
        return true;
      } else {
        toast(result.error || 'Authentication failed', { variant: 'destructive' });
        return false;
      }
    } catch (error) {
      toast('Authentication error', { variant: 'destructive' });
      return false;
    }
  }, [connectedWallets, authenticate, toast]);

  const logoutWallet = useCallback(async (address: string) => {
    try {
      await authLogout();
      
      setConnectedWallets(prev => 
        prev.map(w => ({
          ...w,
          isAuthenticated: w.address === address ? false : w.isAuthenticated
        }))
      );
      
      // Update active wallet
      setActiveWallet(prev => prev ? { ...prev, isAuthenticated: false } : null);
      
      toast('Wallet logged out');
    } catch (error) {
      toast('Logout error', { variant: 'destructive' });
    }
  }, [authLogout, toast]);

  const logoutAllWallets = useCallback(async () => {
    try {
      await authLogout();
      await disconnect();
      
      setConnectedWallets([]);
      setActiveWallet(null);
      
      toast('All wallets disconnected');
    } catch (error) {
      toast('Error disconnecting wallets', { variant: 'destructive' });
    }
  }, [authLogout, disconnect, toast]);

  const value: WalletManagerContextType = {
    connectedWallets,
    activeWallet,
    addWallet,
    removeWallet,
    switchWallet,
    authenticateWallet,
    logoutWallet,
    logoutAllWallets
  };

  return (
    <WalletManagerContext.Provider value={value}>
      {children}
    </WalletManagerContext.Provider>
  );
}; 