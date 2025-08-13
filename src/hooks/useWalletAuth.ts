import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useEffect, useState, useCallback } from "react";
import { authService } from "@/services/authService";

// Import types explicitly
import type { AuthResponse } from "@/services/authService";

export const useWalletAuth = () => {
  const { account, connected, signMessage } = useWallet();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Listen for changes in localStorage (e.g., login/logout in other tabs)
  useEffect(() => {
    const handleStorage = () => {
      setIsAuthenticated(!!authService.getToken());
    };
    
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = authService.getToken();
      
      if (token) {
        const result = await authService.verifyToken();
        setIsAuthenticated(result.success);
      }
    };
    
    checkAuth();
  }, []);

  const authenticate = useCallback(async (): Promise<AuthResponse> => {
    if (!connected || !account?.address) {
      return {
        success: false,
        error: 'Wallet not connected'
      };
    }

    setIsLoading(true);
    
    try {
      const addressString = typeof account.address === 'string' 
        ? account.address 
        : account.address.toString();

      // Step 1: Generate challenge
      const challengeResponse = await authService.generateChallenge(addressString);
      
      if (!challengeResponse.success || !challengeResponse.challenge) {
        return {
          success: false,
          error: challengeResponse.error || 'Failed to generate challenge'
        };
      }

      // Step 2: Sign the challenge message
      const signature = await signMessage({
        message: challengeResponse.challenge.message,
        nonce: challengeResponse.challenge.timestamp.toString(),
      });

      if (!signature) {
        return {
          success: false,
          error: 'Failed to sign message'
        };
      }

      // Step 3: Authenticate with backend
      const authResponse = await authService.authenticateWithWallet(
        addressString,
        signature.signature.toString(),
        challengeResponse.challenge.message,
        challengeResponse.challenge.timestamp,
        account.ansName
      );

      setIsAuthenticated(authResponse.success);
      
      // Dispatch custom event for authentication
      if (authResponse.success) {
        window.dispatchEvent(new CustomEvent('auth-state-changed', {
          detail: { type: 'authenticated', success: true }
        }));
      }
      
      return authResponse;
    } catch (error) {
      setIsAuthenticated(false);
      return {
        success: false,
        error: 'Authentication failed: ' + (error instanceof Error ? error.message : String(error))
      };
    } finally {
      setIsLoading(false);
    }
  }, [connected, account, signMessage]);

  const logout = useCallback(async (): Promise<AuthResponse> => {
    const result = await authService.logout();
    setIsAuthenticated(false);
    
    // Dispatch custom event for logout
    window.dispatchEvent(new CustomEvent('auth-state-changed', {
      detail: { type: 'logout', success: false }
    }));
    
    return result;
  }, []);

  const verifyToken = async (): Promise<AuthResponse> => {
    const result = await authService.verifyToken();
    setIsAuthenticated(result.success);
    return result;
  };

  const getProfile = useCallback(async (): Promise<AuthResponse> => {
    const result = await authService.getProfile();
    if (!result.success) {
      setIsAuthenticated(false);
    }
    return result;
  }, []);

  const updateProfile = async (ans_name: string): Promise<AuthResponse> => {
    const result = await authService.updateProfile(ans_name);
    if (!result.success) {
      setIsAuthenticated(false);
    }
    return result;
  };

  const updateFullProfile = async (profileData: {
    ans_name?: string;
    display_name?: string;
    bio?: string;
    website?: string;
    twitter?: string;
  }): Promise<AuthResponse> => {
    const result = await authService.updateFullProfile(profileData);
    if (!result.success) {
      setIsAuthenticated(false);
    }
    return result;
  };

  const testAuth = async (): Promise<AuthResponse> => {
    const result = await authService.testAuth();
    if (!result.success) {
      setIsAuthenticated(false);
    }
    return result;
  };

  // Test wallet signature capability
  const testSignature = async (): Promise<boolean> => {
    if (!connected || !account?.address || !signMessage) {
      return false;
    }

    try {
      const testMessage = 'Test signature for Emoticons';
      
      const signature = await signMessage({
        message: testMessage,
        nonce: Date.now().toString(),
      });

      return !!signature;
    } catch (error) {
      return false;
    }
  };

  return {
    authenticate,
    isAuthenticated,
    isLoading,
    logout,
    verifyToken,
    getProfile,
    updateProfile,
    updateFullProfile,
    testAuth,
    testSignature,
  };
}; 