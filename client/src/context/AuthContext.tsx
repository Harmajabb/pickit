import { createContext, useState } from "react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface AuthContextType {
  token: string | null;
  userid: string | null;
  login: (tokenid: string, id: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  userid: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: Props) => {
  const [token, setToken] = useState<string | null>(null);
  const [userid, setUserid] = useState<string | null>(null);

  const login = (tokenid: string, id: string) => {
    setToken(tokenid);
    setUserid(id);
  };
  const logout = () => {
    setToken(null);
    setUserid(null);
  };

  return (
    <AuthContext.Provider value={{ token, userid, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextType;
