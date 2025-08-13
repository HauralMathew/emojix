// Contract function types for creator management

export interface CreatorManagementFunctions {
  // Change market creator (admin only)
  change_market_creator: {
    function: string;
    typeArguments: [];
    functionArguments: [string, string]; // [market_address, new_creator]
  };
  
  // Transfer creator rights (creator only)
  transfer_creator_rights: {
    function: string;
    typeArguments: [];
    functionArguments: [string, string]; // [market_address, new_creator]
  };
  
  // Get market creator
  get_market_creator: {
    function: string;
    typeArguments: [];
    functionArguments: [string]; // [market_address]
  };
  
  // Get market creator fees
  get_market_creator_fees: {
    function: string;
    typeArguments: [];
    functionArguments: [string]; // [market_address]
  };
  
  // Get total creator fees
  get_total_creator_fees: {
    function: string;
    typeArguments: [];
    functionArguments: [];
  };
}

export interface CreatorData {
  creator_address: string;
  creator_fees: string; // u128 as string
  total_creator_fees: string; // u128 as string
}

export interface CreatorManagementAPI {
  // Get creator data for a market
  getCreatorData: (marketAddress: string) => Promise<CreatorData | null>;
  
  // Change creator (admin only)
  changeCreator: (marketAddress: string, newCreator: string) => Promise<boolean>;
  
  // Transfer creator rights (creator only)
  transferCreatorRights: (marketAddress: string, newCreator: string) => Promise<boolean>;
} 