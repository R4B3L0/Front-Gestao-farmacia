import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import API_BASE_URL from "../config";

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (
    name: string,
    username: string,
    email: string,
    password: string,
    role: string
  ) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const isAuthenticated = !!user;

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch("http://localhost:8080/api/usuarios/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, senha: password }),
      });

      if (!response.ok) {
        throw new Error("Usuário ou senha inválidos");
      }

      const data = await response.json();

      if (data.token) {
        localStorage.setItem("token", data.token);

        const decoded = parseJwt(data.token);

        const loggedUser: User = {
          id: decoded.userId,
          name: decoded.sub || "",
          username: decoded.sub || "",
          email: "",
          role: decoded.role || "user",
          token: data.token,
        };
        if (!loggedUser.id) {
          throw new Error("ID do usuário não encontrado no token JWT.");
        }

        setUser(loggedUser);
      } else {
        throw new Error("Token não retornado pelo servidor");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  };

  function parseJwt(token: string): any {
    try {
      const base64Payload = token.split(".")[1];
      const payload = atob(base64Payload);
      return JSON.parse(payload);
    } catch (e) {
      return {};
    }
  }

  const register = async (
    name: string,
    username: string,
    email: string,
    password: string,
    role: string
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: name,
          login: username,
          email,
          senha: password,
        }),
      });

      if (!response.ok) {
        let errorData = { message: "Erro desconhecido ao registrar usuário" };
        try {
          const text = await response.text();
          if (text) {
            errorData = JSON.parse(text);
          }
        } catch (e) {
          console.error("Failed to parse error response", e);
        }
        throw new Error(errorData.message || "Erro ao registrar usuário");
      }

      const data = await response.json();
      const newUser: User = {
        name: data.nome,
        username: data.login,
        email: data.email,
        role: "user",
        token: "fake-jwt-token",
      };
      setUser(newUser);
    } catch (error: any) {
      console.error("Register error:", error);
      throw new Error(error.message || "Erro ao registrar usuário");
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
