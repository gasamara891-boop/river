import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type User = {
  id: string;
  name: string;
  email?: string;
  roles?: string[];
};

type UserContextValue = {
  user: User | null;
  loading: boolean;
  error: Error | null;
  setUser: (u: User | null) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

type Props = {
  children: ReactNode;
  initialUser?: User | null;
};

export const UserProvider = ({ children, initialUser = null }: Props) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState<boolean>(!initialUser);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Only run in browser
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (raw) setUser(JSON.parse(raw));
    } catch (err: any) {
      setError(err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    // add sign-out API call / redirect if needed
  };

  return (
    <UserContext.Provider value={{ user, loading, error, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextValue => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
};