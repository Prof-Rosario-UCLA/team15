import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { backendService } from './BackendService';
import { AuthState } from './types';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  handleTokenExpiration: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
  });

  // Check if a JWT token is expired
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp < now;
    } catch {
      return true; // If we can't parse it, consider it expired
    }
  };

  useEffect(() => {
    // Check if user is already authenticated (has valid token in localStorage)
    const token = localStorage.getItem('jwt_token');
    if (token && !isTokenExpired(token)) {
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      // Token is missing or expired, clear it
      if (token) {
        localStorage.removeItem('jwt_token');
      }
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  const handleTokenExpiration = () => {
    localStorage.removeItem('jwt_token');
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      error: 'Session expired. Please log in again.',
    });
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const success = await backendService.login(username, password);
      
      if (success) {
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          error: 'Invalid credentials',
        });
      }
      
      return success;
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        error: 'Login failed',
      });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    handleTokenExpiration,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
