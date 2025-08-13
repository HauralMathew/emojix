// Types
export interface MarketSocials {
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  github?: string;
  medium?: string;
  reddit?: string;
}

export interface MarketData {
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

export interface MarketResponse {
  success: boolean;
  data?: MarketData;
  error?: string;
}

export interface MarketsResponse {
  success: boolean;
  data?: MarketData[];
  error?: string;
  pagination?: {
    limit: number;
    offset: number;
    total: number;
  };
}

// Configuration
const API_BASE_URL = import.meta.env.VITE_BACKEND_API || 'http://localhost:5000/api';

// MarketService class
class MarketService {
  // Get market data by address
  async getMarketData(marketAddress: string): Promise<MarketData | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/markets/${marketAddress}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // Market not found
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: MarketResponse = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch market backend data:', error);
      return null;
    }
  }

  // Get multiple markets by addresses
  async getMarketsData(marketAddresses: string[]): Promise<Map<string, MarketData>> {
    try {
      if (!marketAddresses || marketAddresses.length === 0) {
        return new Map();
      }

      const response = await fetch(`${API_BASE_URL}/markets/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ market_addresses: marketAddresses }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: MarketsResponse = await response.json();
      
      if (result.success && result.data) {
        const marketMap = new Map<string, MarketData>();
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

  // Create or update market data
  async createMarketData(marketData: Omit<MarketData, 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/markets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(marketData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to create market data:', errorData);
        return false;
      }
      
      const result: MarketResponse = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to create market backend data:', error);
      return false;
    }
  }

  // Update market data
  async updateMarketData(marketAddress: string, marketData: Partial<MarketData>): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/markets/${marketAddress}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(marketData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to update market data:', errorData);
        return false;
      }
      
      const result: MarketResponse = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to update market backend data:', error);
      return false;
    }
  }

  // Delete market data
  async deleteMarketData(marketAddress: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/markets/${marketAddress}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to delete market data:', errorData);
        return false;
      }
      
      const result: MarketResponse = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to delete market backend data:', error);
      return false;
    }
  }

  // Get all markets with optional filtering
  async getAllMarkets(options?: {
    limit?: number;
    offset?: number;
    featured?: boolean;
    verified?: boolean;
    search?: string;
  }): Promise<MarketData[]> {
    try {
      const params = new URLSearchParams();
      
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.offset) params.append('offset', options.offset.toString());
      if (options?.featured !== undefined) params.append('featured', options.featured.toString());
      if (options?.verified !== undefined) params.append('verified', options.verified.toString());
      if (options?.search) params.append('search', options.search);

      const url = `${API_BASE_URL}/markets${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: MarketsResponse = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch all markets:', error);
      return [];
    }
  }

  // Get featured markets
  async getFeaturedMarkets(): Promise<MarketData[]> {
    return this.getAllMarkets({ featured: true });
  }

  // Search markets
  async searchMarkets(query: string, limit: number = 20): Promise<MarketData[]> {
    return this.getAllMarkets({ search: query, limit });
  }

  // Health check for market service
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/markets`);
      return response.ok;
    } catch (error) {
      console.error('Market service health check failed:', error);
      return false;
    }
  }
}

// Create and export singleton instance
export const marketService = new MarketService(); 