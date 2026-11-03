/**
 * JanSamadhan – useAuth Hook
 * Custom hook to easily consume the AuthContext across components.
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContextInstance';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;
