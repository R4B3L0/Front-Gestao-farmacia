import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import API_BASE_URL from "../config"; // Importar a URL base da API

interface User {
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
        body: JSON.stringify({ username, senha: password }), // seu backend espera `senha`, não `password`
      });

      if (!response.ok) {
        throw new Error("Usuário ou senha inválidos");
      }

      const data = await response.json();

      if (data.token) {
        localStorage.setItem("token", data.token);

        // Você pode decodificar o token para obter informações do usuário (como username e role)
        const decoded = parseJwt(data.token);

        const loggedUser: User = {
          name: decoded.sub || "", // ou algum outro campo no payload do token
          username: decoded.sub || "",
          email: "", // se não estiver no token, pode deixar vazio
          role: decoded.role || "user", // se estiver no token
          token: data.token,
        };

        setUser(loggedUser);
      } else {
        throw new Error("Token não retornado pelo servidor");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  };

  // Função auxiliar para decodificar o token JWT (base64)
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
    role: string // O backend Java espera um objeto UsuarioDTO sem role explícito na DTO
  ) => {
    try {
      // Mapeando para o endpoint POST /usuarios do backend Java
      const response = await fetch(`${API_BASE_URL}/usuarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Ajustando o corpo para corresponder ao UsuarioDTO do backend
        // Removendo 'role' e ajustando nomes de campos se necessário
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
      // Assumindo que a resposta do backend contém os dados do usuário criado
      // Pode ser necessário adaptar a estrutura do 'User' ou a resposta do backend
      const newUser: User = {
        name: data.nome,
        username: data.login,
        email: data.email,
        role: "user", // Definindo um role padrão, já que não vem da API
        token: "fake-jwt-token", // Gerar ou obter token real se a API retornar
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
