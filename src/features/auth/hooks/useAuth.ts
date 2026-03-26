import { useContext } from 'react';
import { AuthContext } from '@/features/auth/AuthContextDefinition'; // Updated import path
import { type AuthContextType } from '@/features/auth/types/AuthTypes';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
