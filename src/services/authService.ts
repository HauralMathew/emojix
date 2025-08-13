// Types
export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: number;
    address: string;
    ans_name?: string;
    display_name?: string;
    bio?: string;
    website?: string;
    twitter?: string;
    created_at: string;
    last_login: string;
  };
  error?: string;
}

export interface ChallengeResponse {
  success: boolean;
  challenge?: {
    message: string;
    timestamp: number;
    nonce: string;
  };
  error?: string;
}

// Configuration
const API_BASE_URL = import.meta.env.VITE_BACKEND_API || 'http://localhost:5000/api';

// AuthService class
class AuthService {
  private token: string | null = null;

  // Get stored token from localStorage
  getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  // Store token in localStorage
  setStoredToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      this.token = token;
    }
  }

  // Remove token from localStorage
  removeStoredToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('userAddress');
      localStorage.removeItem('userData');
      this.token = null;
    }
  }

  // Get current token (from memory or localStorage)
  getToken(): string | null {
    if (!this.token) {
      this.token = this.getStoredToken();
    }
    return this.token;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Get stored user data
  getStoredUserData(): any {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  // Generate authentication challenge
  async generateChallenge(address: string): Promise<ChallengeResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/challenge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to generate challenge'
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating challenge:', error);
      return {
        success: false,
        error: 'Failed to generate challenge'
      };
    }
  }

  // Authenticate with wallet signature
  async authenticateWithWallet(
    address: string,
    signature: string,
    message: string,
    timestamp: number,
    ans_name?: string
  ): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          signature,
          message,
          timestamp,
          ans_name
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Authentication failed'
        };
      }

      if (data.success && data.token) {
        this.setStoredToken(data.token);
        localStorage.setItem('userAddress', address);
        
        if (data.user) {
          localStorage.setItem('userData', JSON.stringify(data.user));
        }
        
        return data;
      } else {
        return {
          success: false,
          error: 'Invalid response from server'
        };
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        error: 'Authentication failed'
      };
    }
  }

  // Verify authentication token
  async verifyToken(): Promise<AuthResponse> {
    const token = this.getToken();
    
    if (!token) {
      return {
        success: false,
        error: 'No token found'
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!data.success) {
        this.removeStoredToken();
      }
      
      return data;
    } catch (error) {
      console.error('Error verifying token:', error);
      this.removeStoredToken();
      return {
        success: false,
        error: 'Token verification failed'
      };
    }
  }

  // Get user profile
  async getProfile(): Promise<AuthResponse> {
    const token = this.getToken();
    
    if (!token) {
      return {
        success: false,
        error: 'No token found'
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!data.success) {
        this.removeStoredToken();
      } else if (data.user) {
        localStorage.setItem('userData', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      this.removeStoredToken();
      return {
        success: false,
        error: 'Failed to fetch profile'
      };
    }
  }

  // Update user profile (legacy method for backward compatibility)
  updateProfile = async (ans_name: string): Promise<AuthResponse> => {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'No authentication token'
        };
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ans_name })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to update profile'
        };
      }

      if (data.success && data.user) {
        localStorage.setItem('userData', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        error: 'Failed to update profile'
      };
    }
  };

  // Update full user profile
  updateFullProfile = async (profileData: {
    ans_name?: string;
    display_name?: string;
    bio?: string;
    website?: string;
    twitter?: string;
  }): Promise<AuthResponse> => {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'No authentication token'
        };
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to update profile'
        };
      }

      if (data.success && data.user) {
        localStorage.setItem('userData', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        error: 'Failed to update profile'
      };
    }
  };

  // Logout
  async logout(): Promise<AuthResponse> {
    const token = this.getToken();
    
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }

    this.removeStoredToken();
    
    return {
      success: true
    };
  }

  // Test authentication
  async testAuth(): Promise<AuthResponse> {
    const token = this.getToken();
    
    if (!token) {
      return {
        success: false,
        error: 'No token found'
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/test`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!data.success) {
        this.removeStoredToken();
      }
      
      return data;
    } catch (error) {
      console.error('Error testing auth:', error);
      this.removeStoredToken();
      return {
        success: false,
        error: 'Authentication test failed'
      };
    }
  }

  // Health check for auth service
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth`);
      return response.ok;
    } catch (error) {
      console.error('Auth service health check failed:', error);
      return false;
    }
  }
}

// Create and export singleton instance
export const authService = new AuthService(); 