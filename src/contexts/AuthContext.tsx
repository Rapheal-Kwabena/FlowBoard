import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { pb } from '../lib/pocketbase';
import { RecordModel } from 'pocketbase';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loginWithProvider: (provider: 'google' | 'microsoft') => Promise<void>;
  verify2FA: (otp: string) => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const mapRecordToUser = (record: RecordModel): User => {
  return {
    id: record.id,
    email: record.email,
    name: record.name,
    avatar: record.avatar ? pb.getFileUrl(record, record.avatar) : undefined,
    twoFactor: record.twoFactor,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    is2FARequired: false,
  });

  useEffect(() => {
    const storedUser = pb.authStore.model;
    if (storedUser) {
      const user = mapRecordToUser(storedUser);
      setAuthState({
        user,
        isAuthenticated: true,
        loading: false,
        is2FARequired: false,
      });
    } else {
      setAuthState(prev => ({ ...prev, loading: false, is2FARequired: false }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      if (authData.meta?.twoFactor) {
        setAuthState(prev => ({ ...prev, is2FARequired: true }));
      } else {
        const user = mapRecordToUser(authData.record);
        setAuthState({
          user,
          isAuthenticated: true,
          loading: false,
          is2FARequired: false,
        });
      }
    } catch (err: any) {
      if (err.data?.data?.twoFactor) {
        setAuthState(prev => ({ ...prev, is2FARequired: true }));
      } else {
        throw err;
      }
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    await pb.collection('users').create({
      name,
      email,
      password,
      passwordConfirm: password,
    });
    await login(email, password);
  };

  const logout = () => {
    pb.authStore.clear();
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
      is2FARequired: false,
    });
  };

  const loginWithProvider = async (provider: 'google' | 'microsoft') => {
    const authData = await pb.collection('users').authWithOAuth2({ provider });
    const user = mapRecordToUser(authData.record);
    setAuthState({
      user,
      isAuthenticated: true,
      loading: false,
      is2FARequired: false,
    });
  };

  const verify2FA = async (otp: string) => {
    // Assuming you store the email and password temporarily for 2FA, or you have a custom endpoint
    // Replace this with your actual 2FA verification logic
    const email = pb.authStore.model?.email;
    const password = pb.authStore.token; // Or however you store the password/temp token
    if (!email || !password) {
      throw new Error('Missing credentials for 2FA verification');
    }
    // Example: If your backend expects OTP as a third parameter
    const authData = await pb.collection('users').authWithPassword(email, password, { otp });
    const user = mapRecordToUser(authData.record);
    setAuthState({
      user,
      isAuthenticated: true,
      loading: false,
      is2FARequired: false,
    });
  };

  const setUser = (user: User) => {
    setAuthState(prev => ({ ...prev, user }));
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, signup, logout, loginWithProvider, verify2FA, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};