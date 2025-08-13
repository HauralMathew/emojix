import { useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Aptos, AptosConfig } from '@aptos-labs/ts-sdk';
import { APTOS_API_KEY, DEVNET, CONTRACT_ADDRESS } from '../constants/contract';
import { useToast } from './use-toast';
import type { CreatorData, CreatorManagementAPI } from '../types/contract';

export const useCreatorManagement = (): CreatorManagementAPI => {
  const { signAndSubmitTransaction } = useWallet();
  const { toast } = useToast();
  const [, setIsLoading] = useState(false);

  // Initialize Aptos client
  const aptosConfig = new AptosConfig({ 
    network: DEVNET,
    clientConfig: {
      API_KEY: APTOS_API_KEY
    }
  });
  const aptos = new Aptos(aptosConfig);

  const getCreatorData = async (marketAddress: string): Promise<CreatorData | null> => {
    try {
      // Get creator address
      const creatorResponse = await aptos.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::emojixcore::get_market_creator`,
          typeArguments: [],
          functionArguments: [marketAddress],
        },
      });

      // Get creator fees for this market
      const creatorFeesResponse = await aptos.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::emojixcore::get_market_creator_fees`,
          typeArguments: [],
          functionArguments: [marketAddress],
        },
      });

      // Get total creator fees
      const totalCreatorFeesResponse = await aptos.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::emojixcore::get_total_creator_fees`,
          typeArguments: [],
          functionArguments: [],
        },
      });

      const creatorAddress = creatorResponse ? creatorResponse.toString() : '';
      const creatorFees = creatorFeesResponse ? creatorFeesResponse.toString() : '0';
      const totalCreatorFees = totalCreatorFeesResponse ? totalCreatorFeesResponse.toString() : '0';

      return {
        creator_address: creatorAddress,
        creator_fees: creatorFees,
        total_creator_fees: totalCreatorFees,
      };
    } catch (error) {
      console.error('Failed to get creator data:', error);
      return null;
    }
  };

  const changeCreator = async (marketAddress: string, newCreator: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const response = await signAndSubmitTransaction({
        data: {
          function: `${CONTRACT_ADDRESS}::emojixcore::change_market_creator`,
          typeArguments: [],
          functionArguments: [marketAddress, newCreator],
        },
      });

      await aptos.waitForTransaction({ transactionHash: response.hash });
      toast('Creator changed successfully!', { variant: 'default' });
      return true;
    } catch (error) {
      console.error('Failed to change creator:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast(`Failed to change creator: ${errorMessage}`, { variant: 'destructive' });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const transferCreatorRights = async (marketAddress: string, newCreator: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const response = await signAndSubmitTransaction({
        data: {
          function: `${CONTRACT_ADDRESS}::emojixcore::transfer_creator_rights`,
          typeArguments: [],
          functionArguments: [marketAddress, newCreator],
        },
      });

      await aptos.waitForTransaction({ transactionHash: response.hash });
      toast('Creator rights transferred successfully!', { variant: 'default' });
      return true;
    } catch (error) {
      console.error('Failed to transfer creator rights:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast(`Failed to transfer creator rights: ${errorMessage}`, { variant: 'destructive' });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getCreatorData,
    changeCreator,
    transferCreatorRights,
  };
}; 