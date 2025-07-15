import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { pb } from '../lib/pocketbase';
import { RecordModel } from 'pocketbase';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
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
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    const storedUser = pb.authStore.model;
    if (storedUser) {
      const user = mapRecordToUser(storedUser);
      setAuthState({
        user,
        isAuthenticated: true,
        loading: false,
      });
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const authData = await pb.collection('users').authWithPassword(email, password);
    const user = mapRecordToUser(authData.record);
    setAuthState({
      user,
      isAuthenticated: true,
      loading: false,
    });
  };

  const signup = async (name: string, email: string, password: string) => {
    const newUser = await pb.collection('users').create({
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
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};