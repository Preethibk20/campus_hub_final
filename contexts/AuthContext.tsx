import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
  collegeName?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, collegeName: string) => Promise<boolean>;
  logout: () => void;
  verifyEmail: (code: string) => Promise<boolean>;
  resendVerification: () => Promise<boolean>;
  isLoading: boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('campusHubUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const isValidCollegeEmail = (email: string): boolean => {
    // For now, we'll accept any email with @gmail.com
    // Later this can be updated to specific college domains
    return email.endsWith('@gmail.com');
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!isValidCollegeEmail(email)) {
        throw new Error('Please use a valid college email address');
      }

      // Mock user data
      const userData: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        isVerified: true, // Auto-verify for demo
        collegeName: 'Demo University',
        avatar: `https://picsum.photos/seed/${email}/100`
      };

      setUser(userData);
      localStorage.setItem('campusHubUser', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, collegeName: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!isValidCollegeEmail(email)) {
        throw new Error('Please use a valid college email address');
      }

      // Mock user data
      const userData: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
        isVerified: false, // Requires verification
        collegeName,
        avatar: `https://picsum.photos/seed/${email}/100`
      };

      setUser(userData);
      localStorage.setItem('campusHubUser', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (code: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        const updatedUser = { ...user, isVerified: true };
        setUser(updatedUser);
        localStorage.setItem('campusHubUser', JSON.stringify(updatedUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Verification error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate sending verification email
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Resend verification error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('campusHubUser');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      verifyEmail,
      resendVerification,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
