import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "@/services/api";
import { toast } from "sonner";

export type UserRole = "buyer" | "seller" | "admin" | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  sellerStatus?: 'pending' | 'approved' | 'rejected';
  storeName?: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Initialize user from localStorage on mount
  useEffect(() => {
    const currentUser = authAPI.getCurrentUser();
    const token = authAPI.getToken();
    
    console.log('AuthContext - Initial mount - User:', currentUser, 'Token:', token ? 'exists' : 'none');
    
    if (currentUser && token) {
      setUser(currentUser);
      console.log('AuthContext - User set from localStorage:', currentUser);
    }
  }, []);

  // Add a fallback to prevent blank page
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentUser = authAPI.getCurrentUser();
      const token = authAPI.getToken();
      
      console.log('AuthContext - Fallback check - User:', user, 'CurrentUser:', currentUser, 'Token:', token ? 'exists' : 'none');
      
      if (!user && currentUser && token) {
        setUser(currentUser);
        console.log('AuthContext - User set from fallback:', currentUser);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [user]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      
      console.log('Login response:', response);
      
      // Use the role from backend response
      setUser(response.user);
      toast.success(`Signed in as ${response.user.role}`);
      
      // Store user data for persistence
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Navigate based on role from backend
      if (response.user.role === "buyer") {
        navigate('/dashboard');
      } else if (response.user.role === "seller") {
        navigate('/seller');
      } else if (response.user.role === "admin") {
        navigate('/admin');
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/'); // Use React Router navigate instead of window.location
  };

  const switchRole = (role: UserRole) => {
    // For demo purposes, switch to demo user
    const demoUsers: Record<string, User> = {
      buyer: { id: "1", name: "Jane Cooper", email: "jane@example.com", role: "buyer" },
      seller: { id: "2", name: "Store Owner", email: "seller@example.com", role: "seller" },
      admin: { id: "3", name: "Admin User", email: "admin@example.com", role: "admin" },
    };
    
    if (role) {
      setUser(demoUsers[role]);
      toast.success(`Switched to ${role} view`);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role ?? null, login, logout, switchRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
