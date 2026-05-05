import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  setBaseUrl,
  setAuthTokenGetter,
  getCurrentAuthUser,
} from "@workspace/api-client-react";

const DOMAIN = process.env.EXPO_PUBLIC_DOMAIN ?? "";
if (DOMAIN) {
  setBaseUrl(`https://${DOMAIN}`);
}

interface AuthUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  setToken: (token: string | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  setToken: () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("sever_token").then((stored) => {
      if (stored) {
        setTokenState(stored);
        setAuthTokenGetter(() => stored);
      }
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    setAuthTokenGetter(() => token);
    getCurrentAuthUser()
      .then((envelope) => setUser(envelope.user as AuthUser | null))
      .catch(() => setUser(null));
  }, [token]);

  const setToken = (t: string | null) => {
    setTokenState(t);
    if (t) {
      AsyncStorage.setItem("sever_token", t);
      setAuthTokenGetter(() => t);
    } else {
      AsyncStorage.removeItem("sever_token");
      setAuthTokenGetter(() => null);
    }
  };

  const logout = async () => {
    const stored = await AsyncStorage.getItem("sever_token");
    if (stored) {
      try {
        const domain = process.env.EXPO_PUBLIC_DOMAIN ?? "";
        await fetch(`https://${domain}/api/mobile-auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${stored}` },
        });
      } catch {
      }
    }
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
