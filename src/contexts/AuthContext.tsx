import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Define custom types matching our API
export interface User {
  id: string;
  email: string;
  role: string;
  user_metadata: {
    ad: string;
    soyad: string;
    telefon?: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, metadata: { ad: string; soyad: string; telefon: string }) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check for token on load
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAdmin(parsedUser.role === 'admin');
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const signUp = async (
    email: string,
    password: string,
    metadata: { ad: string; soyad: string; telefon: string }
  ) => {
    try {
      console.log('=== SIGNUP CALLED ===');
      console.log('Email:', email);
      console.log('Metadata:', metadata);
      
      const requestBody = { email, password, ...metadata };
      console.log('Request body:', { ...requestBody, password: '***' });
      
      console.log('Sending request to /api/auth/register...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('Response received!');
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      // Check if response has content before parsing JSON
      const text = await response.text();
      let data;
      
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('Failed to parse response:', text);
          return { error: new Error(`Server error: ${text || 'Empty response'}`) };
        }
      } else {
        console.error('Empty response from server');
        return { error: new Error('Server returned empty response') };
      }

      if (!response.ok) {
        return { error: new Error(data?.error || 'Registration failed') };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Registration fetch error:', error);
      if (error.name === 'AbortError') {
        console.error('Request timeout - server did not respond');
        return { error: new Error('Request timeout - server did not respond. Check if backend is running on port 3000.') };
      }
      return { error: error instanceof Error ? error : new Error(error?.message || 'Network error') };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      // Check if response has content before parsing JSON
      const text = await response.text();
      let data;
      
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('Failed to parse response:', text);
          return { error: new Error(`Server error: ${text || 'Empty response'}`) };
        }
      } else {
        console.error('Empty response from server');
        return { error: new Error('Server returned empty response') };
      }

      if (!response.ok) {
        return { error: new Error(data?.error || 'Login failed') };
      }

      // Store in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);
      setIsAdmin(data.user.role === 'admin');

      return { error: null };
    } catch (error: any) {
      console.error('Login fetch error:', error);
      return { error: error instanceof Error ? error : new Error(error?.message || 'Network error') };
    }
  };

  const signOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
