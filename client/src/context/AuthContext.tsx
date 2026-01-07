import { createContext, useState } from "react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface AuthContextType {
  token: string | null;
  userId: string | null;
  login: (token: string, id: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  userId: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: Props) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const login = (token: string, id: string) => {
    setToken(token);
    setUserId(id);
  };
  const logout = () => {
    setToken(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ token, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextType;
