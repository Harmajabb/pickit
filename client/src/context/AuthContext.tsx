import { type ReactNode, createContext, useCallback, useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
}

const Base_URL = import.meta.env.VITE_API_URL;

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((user: User) => {
    setUser(user);
  }, []);
  
const logout = useCallback(async () => {
  try {
    await fetch(`${Base_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
  } finally {
    setUser(null);
  }
}, []);

  useEffect(() => {
    async function checkUser() {
      try {
        const response = await fetch(`${Base_URL}/auth/check`, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const res = await response.json();
          login(res.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setUser(null);
      }
    }

    checkUser();
  }, [login]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};