import React, { createContext, useContext, useState, useCallback } from "react";

export interface AuthUser {
  id: number;
  email: string;
  username?: string;
  avatarUrl?: string;
  role?: string;
}

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
  setToken: (token: string | null) => void;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("llm-token"),
  );
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem("llm-token", data.access_token);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (email: string, username: string, password: string) => {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:3000/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, username, password }),
        });

        if (!response.ok) {
          throw new Error("Registration failed");
        }

        const data = await response.json();
        setToken(data.access_token);
        setUser(data.user);
        localStorage.setItem("llm-token", data.access_token);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("llm-token");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoading,
        login,
        register,
        logout,
        setToken,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
