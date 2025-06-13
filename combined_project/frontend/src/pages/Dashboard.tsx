import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Dashboard.css";

interface MovimentacaoRecente {
  movimentacaoId: number;
  medicamentoNome: string;
  tipoMovimentacao: "entrada" | "saida";
  quantidadeMovimentada: number;
  dataMovimentacao: string;
}

const Dashboard: React.FC = () => {
  const { user: usuarioLogado } = useAuth();
  const userName = usuarioLogado ? usuarioLogado.name : "Usuário";

  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoRecente[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentMovements = async () => {
      if (!usuarioLogado?.token) {
        setIsLoading(false);
        setError("Autenticação necessária para ver as atividades.");
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${usuarioLogado.token}`,
        };

        const movsRes = await fetch(
          "http://localhost:8080/api/movimentacao/listar?sort=dataMovimentacao,desc&limit=5",
          { headers }
        );

        if (!movsRes.ok) {
          throw new Error("Falha ao buscar as atividades recentes.");
        }

        setMovimentacoes(await movsRes.json());
      } catch (err: any) {
        setError(err.message);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentMovements();
  }, [usuarioLogado]);

  return (
    <div className="dashboard-welcome animate-fade-in">
      <div className="welcome-card">
        <h1 className="text-2xl font-bold mb-4">
          Bem-vindo ao MedFLOW, {userName}!
        </h1>
        <p className="text-gray-600 mb-6">
          Sistema de gestão médica e farmacêutica. Acesse as principais
          funcionalidades abaixo ou utilize o menu lateral.
        </p>

        {}
        <div className="dashboard-shortcuts">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/cadastro-medicamento"
              className="shortcut-card animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 8V16M8 12H16"
                      stroke="#2563EB"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                      stroke="#2563EB"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <h3 className="font-medium mb-1">Cadastro de Medicamento</h3>
                <p className="text-sm text-gray-500">
                  Registre novos medicamentos no sistema
                </p>
              </div>
            </Link>

            <Link
              to="/cadastro-paciente"
              className="shortcut-card animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                      stroke="#2563EB"
                      strokeWidth="2"
                    />
                    <path
                      d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z"
                      stroke="#2563EB"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <h3 className="font-medium mb-1">Cadastro de Paciente</h3>
                <p className="text-sm text-gray-500">
                  Registre informações de pacientes
                </p>
              </div>
            </Link>

            <Link
              to="/pesquisa-medicamento"
              className="shortcut-card animate-slide-up"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                      stroke="#2563EB"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="font-medium mb-1">Pesquisa de Medicamento</h3>
                <p className="text-sm text-gray-500">
                  Busque medicamentos cadastrados
                </p>
              </div>
            </Link>

            <Link
              to="/controle-estoque"
              className="shortcut-card animate-slide-up"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 3H4C2.89543 3 2 3.89543 2 5V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V5C22 3.89543 21.1046 3 20 3Z"
                      stroke="#2563EB"
                      strokeWidth="2"
                    />
                    <path
                      d="M16 8V16M12 11V16M8 14V16"
                      stroke="#2563EB"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <h3 className="font-medium mb-1">Controle de Estoque</h3>
                <p className="text-sm text-gray-500">
                  Gerencie o estoque de medicamentos
                </p>
              </div>
            </Link>
          </div>
        </div>

        {}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-medium mb-4">Atividades Recentes</h2>

          {isLoading && (
            <p className="text-sm text-gray-500">Carregando atividades...</p>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {!isLoading &&
            !error &&
            (movimentacoes.length > 0 ? (
              <div className="space-y-4">
                {movimentacoes.map((mov) => (
                  <div
                    key={mov.movimentacaoId}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex items-center">
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                          mov.tipoMovimentacao === "entrada"
                            ? "bg-green-100"
                            : "bg-red-100"
                        }`}
                      >
                        <span className="text-xl">
                          {mov.tipoMovimentacao === "entrada" ? "➕" : "➖"}
                        </span>
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium text-gray-800">
                          <span
                            className={`font-bold ${
                              mov.tipoMovimentacao === "entrada"
                                ? "text-green-700"
                                : "text-red-700"
                            }`}
                          >
                            {mov.tipoMovimentacao.charAt(0).toUpperCase() +
                              mov.tipoMovimentacao.slice(1)}
                          </span>{" "}
                          de {mov.quantidadeMovimentada} unidades
                        </p>
                        <p className="text-sm text-gray-600">
                          {mov.medicamentoNome}
                        </p>
                      </div>
                      <div className="text-right text-xs">
                        <p className="text-gray-500">
                          {new Date(mov.dataMovimentacao).toLocaleDateString(
                            "pt-BR",
                            { day: "2-digit", month: "short" }
                          )}
                        </p>
                        <p className="text-gray-400">
                          {new Date(mov.dataMovimentacao).toLocaleTimeString(
                            "pt-BR",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Nenhuma movimentação recente encontrada.
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
