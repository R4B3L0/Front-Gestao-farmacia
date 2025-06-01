import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const UserRegistration: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [role, setRole] = useState<string>('doctor');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!username.trim()) newErrors.username = 'Nome de usuário é obrigatório';

    if (!email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({}); // Limpar erros anteriores

    const userData = {
      nome: name,
      username: username,
      email: email,
      senha: password,
      funcao: role,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/usuarios/registrar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      alert(responseData.message); // "Usuário registrado com sucesso!"
      navigate('/login');
    } catch (err: any) {
      setErrors({ form: err.message || 'Ocorreu um erro ao cadastrar. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-lg">
        <div className="card animate-slide-up">
          <div className="card-header">
            <h2 className="card-title">Cadastro de Usuário</h2>
          </div>

          {errors.form && (
            <div className="alert alert-danger mb-4" role="alert">
              {errors.form}
            </div>
          )}

          <div className="card-body p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-3">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                    stroke="var(--primary)"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20V21H4V20Z"
                    stroke="var(--primary)"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M12 8V4M10 6H14"
                    stroke="var(--primary)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p className="text-gray-600">Preencha os dados para criar sua conta</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name" className="form-label">Nome Completo</label>
                <input
                  type="text"
                  id="name"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite seu nome completo"
                  disabled={isLoading}
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="username" className="form-label">Nome de Usuário</label>
                <input
                  type="text"
                  id="username"
                  className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite seu nome de usuário"
                  disabled={isLoading}
                />
                {errors.username && <div className="invalid-feedback">{errors.username}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">E-mail</label>
                <input
                  type="email"
                  id="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu e-mail"
                  disabled={isLoading}
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="role" className="form-label">Função</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="form-control"
                  disabled={isLoading}
                >
                  <option value="Doutor">Médico</option>
                  <option value="Enfermeiro">Enfermeiro</option>
                  <option value="Farmacêutico">Farmacêutico</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Senha</label>
                <input
                  type="password"
                  id="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  disabled={isLoading}
                />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirmar Senha</label>
                <input
                  type="password"
                  id="confirmPassword"
                  className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua senha"
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <div className="invalid-feedback">{errors.confirmPassword}</div>
                )}
              </div>

              <div className="form-actions mt-6">
                <button
                  type="button"
                  className="btn btn-outline mr-2"
                  onClick={handleBackToLogin}
                  disabled={isLoading}
                >
                  Voltar
                </button>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="loader loader-sm mr-2"></span>
                      Cadastrando...
                    </>
                  ) : (
                    'Cadastrar'
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="card-footer text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?
              <button
                onClick={handleBackToLogin}
                className="ml-1 text-primary hover:underline"
                disabled={isLoading}
              >
                Faça login
              </button>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">© 2025 MedFLOW. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default UserRegistration;
