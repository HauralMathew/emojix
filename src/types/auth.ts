export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: number;
    address: string;
    ans_name?: string;
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