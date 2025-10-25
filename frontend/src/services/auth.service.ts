import { apiClient } from '@/lib/api-client';

export interface TonProofPayload {
  payload: string;
  ttlSec: number;
}

export interface TonProof {
  address: string;
  proof: {
    domain: {
      value: string;
    };
    payload: string;
    timestamp: number;
    signature: string;
  };
}

export interface AuthResponse {
  ok: boolean;
  token: string;
  user: {
    id: string;
    address: string;
  };
}

export interface LogoutResponse {
  ok: boolean;
  message: string;
}

class AuthService {
  /**
   * Get nonce/payload for TON Proof authentication
   */
  async getPayload(): Promise<TonProofPayload> {
    const response = await apiClient.get<TonProofPayload>('/auth/ton-proof/payload');
    return response.data;
  }

  /**
   * Verify TON Proof and get JWT token
   */
  async verifyProof(proof: TonProof): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/ton-proof/verify', proof);

    if (response.data.token) {
      // Store token in localStorage
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_address', response.data.user.address);
    }

    return response.data;
  }

  /**
   * Logout and revoke token
   */
  async logout(): Promise<LogoutResponse> {
    try {
      const response = await apiClient.post<LogoutResponse>('/auth/logout');

      // Clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_address');

      return response.data;
    } catch (error) {
      // Even if server fails, clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_address');
      throw error;
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser() {
    const response = await apiClient.get('/me');
    return response.data;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  /**
   * Get stored auth token
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Get stored user address
   */
  getUserAddress(): string | null {
    return localStorage.getItem('user_address');
  }
}

export const authService = new AuthService();
