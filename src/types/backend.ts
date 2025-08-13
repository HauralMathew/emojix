// Backend registry types for market data

export interface MarketSocials {
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  github?: string;
  medium?: string;
  reddit?: string;
}

export interface MarketBackendData {
  market_address: string;
  socials: MarketSocials;
  description?: string;
  tags?: string[];
  featured?: boolean;
  verified?: boolean;
  community_score?: number;
  developer_score?: number;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export interface BackendMarketResponse {
  success: boolean;
  data?: MarketBackendData;
  error?: string;
}

export interface BackendMarketsResponse {
  success: boolean;
  data?: MarketBackendData[];
  error?: string;
  pagination?: {
    limit: number;
    offset: number;
    total: number;
  };
}

// API endpoints
export const BACKEND_API_BASE = process.env.VITE_BACKEND_API || 'http://localhost:5000/api';

export const BACKEND_ENDPOINTS = {
  // Get backend data for a specific market
  GET_MARKET: (marketAddress: string) => `${BACKEND_API_BASE}/markets/${marketAddress}`,
  
  // Get backend data for multiple markets
  GET_MARKETS: `${BACKEND_API_BASE}/markets`,
  
  // Create/update backend data for a market
  CREATE_MARKET: `${BACKEND_API_BASE}/markets`,
  
  // Update backend data for a market
  UPDATE_MARKET: (marketAddress: string) => `${BACKEND_API_BASE}/markets/${marketAddress}`,
  
  // Delete backend data for a market
  DELETE_MARKET: (marketAddress: string) => `${BACKEND_API_BASE}/markets/${marketAddress}`,
} as const;

// Legacy BackendAPI class for backward compatibility
// Note: This is deprecated. Use marketService from '../services/marketService' instead.
export class BackendAPI {
  static async getMarketData(marketAddress: string): Promise<MarketBackendData | null> {
    try {
      const response = await fetch(BACKEND_ENDPOINTS.GET_MARKET(marketAddress));
      const result: BackendMarketResponse = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch market backend data:', error);
      return null;
    }
  }

  static async getMarketsData(marketAddresses: string[]): Promise<Map<string, MarketBackendData>> {
    try {
      const response = await fetch(BACKEND_ENDPOINTS.GET_MARKETS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ market_addresses: marketAddresses }),
      });
      
      const result: BackendMarketsResponse = await response.json();
      
      if (result.success && result.data) {
        const marketMap = new Map<string, MarketBackendData>();
        result.data.forEach(market => {
          marketMap.set(market.market_address, market);
        });
        return marketMap;
      }
      return new Map();
    } catch (error) {
      console.error('Failed to fetch markets backend data:', error);
      return new Map();
    }
  }

  static async createMarketData(marketData: Omit<MarketBackendData, 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const response = await fetch(BACKEND_ENDPOINTS.CREATE_MARKET, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(marketData),
      });
      
      const result: BackendMarketResponse = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to create market backend data:', error);
      return false;
    }
  }

  static async updateMarketData(marketAddress: string, marketData: Partial<MarketBackendData>): Promise<boolean> {
    try {
      const response = await fetch(BACKEND_ENDPOINTS.UPDATE_MARKET(marketAddress), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(marketData),
      });
      
      const result: BackendMarketResponse = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to update market backend data:', error);
      return false;
    }
  }
} 