import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!username.trim()) {
      setError('Por favor, informe seu nome de usuário');
      return;
    }

    if (!password) {
      setError('Por favor, informe sua senha');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    navigate('/cadastro');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="card animate-slide-up">
          <div className="card-body p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="var(--primary)" strokeWidth="1.5" />
                  <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20V21H4V20Z" stroke="var(--primary)" strokeWidth="1.5" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Bem-vindo ao MedFLOW</h1>
              <p className="text-gray-600 mt-1">Faça login para acessar o sistema</p>
            </div>

            {error && (
              <div className="alert alert-danger mb-4" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username" className="form-label">Usuário</label>
                <input
                  type="text"
                  id="username"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite seu nome de usuário"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Senha</label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  disabled={isLoading}
                />
              </div>

              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="mr-2"
                  />
                  <label htmlFor="remember" className="text-sm text-gray-600">Lembrar-me</label>
                </div>
                <a href="#" className="text-sm text-primary hover:underline">Esqueceu a senha?</a>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loader loader-sm mr-2"></span>
                    Entrando...
                  </>
                ) : 'Entrar'}
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Não tem uma conta?
                <button
                  onClick={handleRegister}
                  className="ml-1 text-primary hover:underline"
                  disabled={isLoading}
                >
                  Cadastre-se
                </button>
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <div className="flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">MedFLOW</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">© 2025 MedFLOW. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
