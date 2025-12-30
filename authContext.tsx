
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthState, User, UserRole } from './types';
import { StorageService } from './services/storageService';

interface AuthContextType extends AuthState {
  login: (email: string, passwordHash: string) => Promise<boolean>;
  signup: (name: string, email: string, passwordHash: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    const savedSession = localStorage.getItem('guestnama_session');
    if (savedSession) {
      try {
        const user = JSON.parse(savedSession);
        setState({ user, isAuthenticated: true, isLoading: false });
      } catch (e) {
        localStorage.removeItem('guestnama_session');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, passwordHash: string) => {
    const users = StorageService.getUsers();
    const user = users.find(u => u.email === email && u.passwordHash === passwordHash);
    
    if (user) {
      const { passwordHash: _, ...userWithoutPassword } = user;
      setState({ user: userWithoutPassword, isAuthenticated: true, isLoading: false });
      localStorage.setItem('guestnama_session', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  }, []);

  const signup = useCallback(async (name: string, email: string, passwordHash: string) => {
    const users = StorageService.getUsers();
    if (users.find(u => u.email === email)) return false;

    const newUser: User & { passwordHash: string } = {
      id: crypto.randomUUID(),
      name,
      email,
      role: UserRole.USER,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    StorageService.addUser(newUser);
    const { passwordHash: _, ...userWithoutPassword } = newUser;
    setState({ user: userWithoutPassword, isAuthenticated: true, isLoading: false });
    localStorage.setItem('guestnama_session', JSON.stringify(userWithoutPassword));
    return true;
  }, []);

  const logout = useCallback(() => {
    setState({ user: null, isAuthenticated: false, isLoading: false });
    localStorage.removeItem('guestnama_session');
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
