import { createContext } from 'react';
import { type AuthContextType } from '@/features/auth/types/AuthTypes';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);