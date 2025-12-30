
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthState, User, UserRole } from './types';
import { StorageService } from './services/storageService';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function for SHA-256 hashing
async function hashPassword(password: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  const logout = useCallback(() => {
    setState({ user: null, isAuthenticated: false, isLoading: false });
    localStorage.removeItem('guestnama_session');
  }, []);

  // Effect to load session and verify with backend
  useEffect(() => {
    const initAuth = async () => {
      const savedSession = localStorage.getItem('guestnama_session');
      if (savedSession) {
        try {
          const user = JSON.parse(savedSession);
          
          // Background verification: check if user exists in sheet
          const isValid = await StorageService.verifySession(user.id);
          
          if (isValid) {
            setState({ user, isAuthenticated: true, isLoading: false });
          } else {
            // Fake or deleted user detected
            logout();
            window.location.reload();
          }
        } catch (e) {
          localStorage.removeItem('guestnama_session');
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };
    initAuth();
  }, [logout]);

  // Periodic heartbeat verification (Optional, runs every 5 minutes)
  useEffect(() => {
    if (!state.isAuthenticated || !state.user) return;

    const interval = setInterval(async () => {
      try {
        const isValid = await StorageService.verifySession(state.user!.id);
        if (!isValid) {
          logout();
          window.location.reload();
        }
      } catch (e) {
        // Network error - ignore to prevent disturbing real users
      }
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.user, logout]);

  const login = useCallback(async (email: string, password: string) => {
    const passHash = await hashPassword(password);
    const users = await StorageService.getUsers();
    const user = users.find(u => u.email === email && u.passwordHash === passHash);
    
    if (user) {
      const { passwordHash: _, ...userWithoutPassword } = user;
      setState({ user: userWithoutPassword, isAuthenticated: true, isLoading: false });
      localStorage.setItem('guestnama_session', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const users = await StorageService.getUsers();
    if (users.find(u => u.email === email)) return false;

    const passHash = await hashPassword(password);
    const newUser: User & { passwordHash: string } = {
      id: crypto.randomUUID(),
      name,
      email,
      role: UserRole.USER,
      passwordHash: passHash,
      createdAt: new Date().toISOString()
    };

    await StorageService.addUser(newUser);
    const { passwordHash: _, ...userWithoutPassword } = newUser;
    setState({ user: userWithoutPassword, isAuthenticated: true, isLoading: false });
    localStorage.setItem('guestnama_session', JSON.stringify(userWithoutPassword));
    return true;
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
