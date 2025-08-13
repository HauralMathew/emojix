// Import services
import { authService } from './authService';
import { marketService } from './marketService';

// Export all services
export { authService } from './authService';
export { marketService } from './marketService';

// Export types
export type { 
  AuthResponse, 
  ChallengeResponse 
} from './authService';

export type { 
  MarketData, 
  MarketSocials, 
  MarketResponse, 
  MarketsResponse 
} from './marketService';

// Service utilities
export const services = {
  auth: authService,
  market: marketService,
} as const;

// Health check for all services
export const checkAllServices = async () => {
  const results = {
    auth: await authService.healthCheck(),
    market: await marketService.healthCheck(),
  };
  
  const allHealthy = Object.values(results).every(healthy => healthy);
  
  return {
    healthy: allHealthy,
    services: results,
  };
}; 