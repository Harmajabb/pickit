import {
  type ReactNode,
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

interface User {
  id: number;
  email: string;
  name: string;
  role: number;
}

const Base_URL = import.meta.env.VITE_API_URL;

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  initResetPassword(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
      user: null,
  login: () => {},
  logout: () => {},
  initResetPassword: async () => {},
  resetPassword: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((user: User) => {
    setUser(user);
  }, []);
  const initResetPassword = useCallback(async (email: string) => {
    try {
      await fetch(`${Base_URL}/auth/init-reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
    } catch (error) {
      console.error("Error initiating password reset:", error);
    }
  }, []);
  const resetPassword = useCallback(
    async (token: string, newPassword: string) => {
      try {
        await fetch(`${Base_URL}/auth/reset-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, newPassword }),
        });
      } catch (error) {
        console.error("Error resetting password:", error);
      }
    },
    [],
  );
  const logout = useCallback(async () => {
    try {
      await fetch(`${Base_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error while log out:", error);
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
    <AuthContext.Provider value={{ user, login, logout, initResetPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};
