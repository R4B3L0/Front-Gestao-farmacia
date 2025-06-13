import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

interface Medicamento {
  id: number;
  nome: string;
}
interface EstoqueItem {
  estoqueId: number;
  medicamentoId: number;
  medicamentoNome: string;
  quantidadeTotal: number;
  quantidadeDisponivel: number;
  quantidadeReservada: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
  localizacao: string;
  ultimaAtualizacao: string;
}
interface MovimentacaoEstoque {
  movimentacaoId: number;
  medicamentoId: number;
  medicamentoNome: string;
  tipoMovimentacao: "entrada" | "saida";
  quantidadeMovimentada: number;
  responsavelId: number;
  responsavelNome: string;
  dataMovimentacao: string;
  observacao: string;
}

const ControleEstoque: React.FC = () => {
  const navigate = useNavigate();
  const { user: usuarioLogado, isAuthenticated } = useAuth();

  const [medicamentoId, setMedicamentoId] = useState<string>("");
  const [quantidadeTotal, setQuantidadeTotal] = useState<string>("");
  const [quantidadeDisponivel, setQuantidadeDisponivel] = useState<string>("");
  const [estoqueMinimo, setEstoqueMinimo] = useState<string>("");
  const [estoqueMaximo, setEstoqueMaximo] = useState<string>("");
  const [localizacao, setLocalizacao] = useState<string>("");

  const [tipoMovimentacao, setTipoMovimentacao] = useState<"entrada" | "saida">(
    "entrada"
  );
  const [quantidadeMovimentada, setQuantidadeMovimentada] =
    useState<string>("");
  const [observacao, setObservacao] = useState<string>("");
  const [medicamentoSelecionadoId, setMedicamentoSelecionadoId] =
    useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"cadastro" | "movimentacao">(
    "cadastro"
  );

  const [medicamentosDisponiveis, setMedicamentosDisponiveis] = useState<
    Medicamento[]
  >([]);
  const [estoque, setEstoque] = useState<EstoqueItem[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([]);

  // Estados de filtro e ordenação
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<string>("medicamentoNome");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [alertaEstoqueBaixo, setAlertaEstoqueBaixo] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        setErrors({ form: "Acesso negado. Por favor, faça o login." });
        return;
      }

      setIsLoading(true);
      try {
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${usuarioLogado?.token}`,
        };

        const [medicamentosRes, estoqueRes, movimentacoesRes] =
          await Promise.all([
            fetch("http://localhost:8080/api/medicamentos/listar", { headers }),
            fetch("http://localhost:8080/api/estoque/listar", { headers }),
            fetch("http://localhost:8080/api/movimentacao/listar", { headers }),
          ]);

        if (!medicamentosRes.ok)
          throw new Error("Erro ao carregar medicamentos.");
        if (!estoqueRes.ok) throw new Error("Erro ao carregar estoque.");
        if (!movimentacoesRes.ok)
          throw new Error("Erro ao carregar movimentações.");

        setMedicamentosDisponiveis(await medicamentosRes.json());
        setEstoque(await estoqueRes.json());
        setMovimentacoes(await movimentacoesRes.json());
        setErrors({});
      } catch (error: any) {
        console.error("Erro ao carregar dados:", error);
        setErrors({
          form:
            error.message || "Não foi possível carregar os dados do servidor.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, usuarioLogado]);

  // --- Validações ---
  const validateCadastroForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!medicamentoId) newErrors.medicamentoId = "Selecione um medicamento.";
    if (!quantidadeTotal.trim() || Number(quantidadeTotal) < 0)
      newErrors.quantidadeTotal = "Quantidade total inválida.";
    if (!quantidadeDisponivel.trim() || Number(quantidadeDisponivel) < 0)
      newErrors.quantidadeDisponivel = "Quantidade disponível inválida.";
    else if (Number(quantidadeDisponivel) > Number(quantidadeTotal))
      newErrors.quantidadeDisponivel =
        "Disponível não pode ser maior que total.";
    if (!estoqueMinimo.trim() || Number(estoqueMinimo) < 0)
      newErrors.estoqueMinimo = "Estoque mínimo inválido.";
    if (!estoqueMaximo.trim() || Number(estoqueMaximo) < Number(estoqueMinimo))
      newErrors.estoqueMaximo = "Máximo deve ser maior ou igual ao mínimo.";
    if (!localizacao.trim())
      newErrors.localizacao = "Localização é obrigatória.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateMovimentacaoForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!medicamentoSelecionadoId)
      newErrors.medicamentoSelecionadoId = "Selecione um medicamento da lista.";
    if (!quantidadeMovimentada.trim() || Number(quantidadeMovimentada) <= 0)
      newErrors.quantidadeMovimentada = "Quantidade deve ser maior que zero.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Submissão dos Formulários ---
  const handleCadastroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCadastroForm()) return;

    setIsLoading(true);
    setErrors({});

    const novoEstoqueData = {
      medicamentoId: Number(medicamentoId),
      quantidadeTotal: Number(quantidadeTotal),
      quantidadeDisponivel: Number(quantidadeDisponivel),
      estoqueMinimo: Number(estoqueMinimo),
      estoqueMaximo: Number(estoqueMaximo),
      localizacao,
    };

    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${usuarioLogado?.token}`,
      };

      const response = await fetch("http://localhost:8080/api/estoque", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(novoEstoqueData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Erro ao cadastrar estoque.");
      }

      const estoqueRes = await fetch(
        "http://localhost:8080/api/estoque/listar",
        { headers }
      );
      const estoqueData = await estoqueRes.json();
      setEstoque(estoqueData);

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);

      setMedicamentoId("");
      setQuantidadeTotal("");
      setQuantidadeDisponivel("");
      setEstoqueMinimo("");
      setEstoqueMaximo("");
      setLocalizacao("");
    } catch (err: any) {
      setErrors({ form: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMovimentacaoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuarioLogado) {
      setErrors({ form: "Sessão expirada. Faça login novamente." });
      return;
    }

    if (!validateMovimentacaoForm()) return;

    setIsLoading(true);
    setErrors({});

    const novaMovimentacaoData = {
      medicamentoId: Number(medicamentoSelecionadoId),
      tipoMovimentacao: tipoMovimentacao,
      quantidadeMovimentada: Number(quantidadeMovimentada),
      responsavelId: usuarioLogado.id,
      observacao,
    };

    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${usuarioLogado.token}`,
      };

      const response = await fetch("http://localhost:8080/api/movimentacao", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(novaMovimentacaoData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Falha ao registrar movimentação.");
      }

      const [estoqueRes, movimentacoesRes] = await Promise.all([
        fetch("http://localhost:8080/api/estoque/listar", { headers }),
        fetch("http://localhost:8080/api/movimentacao/listar", { headers }),
      ]);
      setEstoque(await estoqueRes.json());
      setMovimentacoes(await movimentacoesRes.json());

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);

      setQuantidadeMovimentada("");
      setObservacao("");
      setMedicamentoSelecionadoId("");
      setActiveTab("cadastro");
    } catch (err: any) {
      setErrors({ form: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const sortedAndFilteredEstoque = useMemo(() => {
    let items = [...estoque];
    if (alertaEstoqueBaixo) {
      items = items.filter(
        (item) => item.quantidadeDisponivel <= item.estoqueMinimo
      );
    }
    if (searchTerm) {
      items = items.filter((item) =>
        item.medicamentoNome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    items.sort((a, b) => {
      const fieldA = a[sortField as keyof EstoqueItem];
      const fieldB = b[sortField as keyof EstoqueItem];
      if (fieldA < fieldB) return sortDirection === "asc" ? -1 : 1;
      if (fieldA > fieldB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return items;
  }, [estoque, searchTerm, alertaEstoqueBaixo, sortField, sortDirection]);

  return (
    <div className="form-window card animate-fade-in">
      <div className="card-header">
        <h2 className="card-title">Controle de Estoque e Movimentações</h2>
      </div>

      <div className="card-body">
        {errors.form && (
          <div className="alert alert-danger mb-4">{errors.form}</div>
        )}
        {isSaved && (
          <div className="alert alert-success mb-4">
            Operação realizada com sucesso!
          </div>
        )}

        {}
        <div className="tabs mb-6">
          <div className="tab-list flex border-b border-gray-200">
            <button
              className={`px-4 py-2 font-medium focus:outline-none ${
                activeTab === "cadastro"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("cadastro")}
            >
              Cadastro de Item
            </button>
            <button
              className={`px-4 py-2 font-medium focus:outline-none ${
                activeTab === "movimentacao"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("movimentacao")}
            >
              Movimentação de Estoque
            </button>
          </div>
        </div>

        {activeTab === "cadastro" && (
          <form onSubmit={handleCadastroSubmit}>
            <div className="form-row">
              <div className="form-group-full">
                <label htmlFor="medicamentoId">Medicamento</label>
                <select
                  id="medicamentoId"
                  className={`form-control ${
                    errors.medicamentoId ? "is-invalid" : ""
                  }`}
                  value={medicamentoId}
                  onChange={(e) => setMedicamentoId(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">Selecione um medicamento...</option>
                  {medicamentosDisponiveis.map((med) => (
                    <option key={med.id} value={med.id}>
                      {med.nome}
                    </option>
                  ))}
                </select>
                {errors.medicamentoId && (
                  <div className="invalid-feedback">{errors.medicamentoId}</div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group-inline">
                <label>Qtd. Total</label>
                <input
                  type="number"
                  className={`form-control ${
                    errors.quantidadeTotal ? "is-invalid" : ""
                  }`}
                  value={quantidadeTotal}
                  onChange={(e) => setQuantidadeTotal(e.target.value)}
                  disabled={isLoading}
                />
                {errors.quantidadeTotal && (
                  <div className="invalid-feedback">
                    {errors.quantidadeTotal}
                  </div>
                )}
              </div>
              <div className="form-group-inline">
                <label>Qtd. Disponível</label>
                <input
                  type="number"
                  className={`form-control ${
                    errors.quantidadeDisponivel ? "is-invalid" : ""
                  }`}
                  value={quantidadeDisponivel}
                  onChange={(e) => setQuantidadeDisponivel(e.target.value)}
                  disabled={isLoading}
                />
                {errors.quantidadeDisponivel && (
                  <div className="invalid-feedback">
                    {errors.quantidadeDisponivel}
                  </div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group-inline">
                <label>Estoque Mínimo</label>
                <input
                  type="number"
                  className={`form-control ${
                    errors.estoqueMinimo ? "is-invalid" : ""
                  }`}
                  value={estoqueMinimo}
                  onChange={(e) => setEstoqueMinimo(e.target.value)}
                  disabled={isLoading}
                />
                {errors.estoqueMinimo && (
                  <div className="invalid-feedback">{errors.estoqueMinimo}</div>
                )}
              </div>
              <div className="form-group-inline">
                <label>Estoque Máximo</label>
                <input
                  type="number"
                  className={`form-control ${
                    errors.estoqueMaximo ? "is-invalid" : ""
                  }`}
                  value={estoqueMaximo}
                  onChange={(e) => setEstoqueMaximo(e.target.value)}
                  disabled={isLoading}
                />
                {errors.estoqueMaximo && (
                  <div className="invalid-feedback">{errors.estoqueMaximo}</div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group-full">
                <label>Localização</label>
                <input
                  type="text"
                  className={`form-control ${
                    errors.localizacao ? "is-invalid" : ""
                  }`}
                  value={localizacao}
                  onChange={(e) => setLocalizacao(e.target.value)}
                  disabled={isLoading}
                />
                {errors.localizacao && (
                  <div className="invalid-feedback">{errors.localizacao}</div>
                )}
              </div>
            </div>
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? "Salvando..." : "Salvar Novo Item"}
              </button>
            </div>
          </form>
        )}

        {activeTab === "movimentacao" && (
          <form onSubmit={handleMovimentacaoSubmit}>
            <div className="form-row">
              <div className="form-group-full">
                <label>Medicamento</label>
                <select
                  className={`form-control ${
                    errors.medicamentoSelecionadoId ? "is-invalid" : ""
                  }`}
                  value={medicamentoSelecionadoId}
                  onChange={(e) => setMedicamentoSelecionadoId(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">Selecione um item do estoque...</option>
                  {estoque.map((item) => (
                    <option key={item.estoqueId} value={item.medicamentoId}>
                      {item.medicamentoNome}
                    </option>
                  ))}
                </select>
                {errors.medicamentoSelecionadoId && (
                  <div className="invalid-feedback">
                    {errors.medicamentoSelecionadoId}
                  </div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group-inline">
                <label>Tipo</label>
                <div>
                  <label>
                    <input
                      type="radio"
                      value="entrada"
                      checked={tipoMovimentacao === "entrada"}
                      onChange={() => setTipoMovimentacao("entrada")}
                    />{" "}
                    Entrada
                  </label>
                  <label className="ml-4">
                    <input
                      type="radio"
                      value="saida"
                      checked={tipoMovimentacao === "saida"}
                      onChange={() => setTipoMovimentacao("saida")}
                    />{" "}
                    Saída
                  </label>
                </div>
              </div>
              <div className="form-group-inline">
                <label>Quantidade</label>
                <input
                  type="number"
                  className={`form-control ${
                    errors.quantidadeMovimentada ? "is-invalid" : ""
                  }`}
                  value={quantidadeMovimentada}
                  onChange={(e) => setQuantidadeMovimentada(e.target.value)}
                  disabled={isLoading}
                />
                {errors.quantidadeMovimentada && (
                  <div className="invalid-feedback">
                    {errors.quantidadeMovimentada}
                  </div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group-inline">
                <label>Responsável</label>
                <input
                  type="text"
                  className="form-control"
                  value={
                    usuarioLogado ? usuarioLogado.name : "Nenhum usuário logado"
                  }
                  disabled
                />
              </div>
              <div className="form-group-inline">
                <label>Observação</label>
                <input
                  type="text"
                  className="form-control"
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading || !isAuthenticated}
              >
                {isLoading ? "Registrando..." : "Registrar Movimentação"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 pt-6 border-t">
          <h3 className="text-lg font-semibold mb-4">Visualização de Dados</h3>
          <div className="mb-4 flex flex-wrap gap-4 items-center">
            <div className="flex-grow">
              <input
                type="text"
                placeholder="Pesquisar por nome..."
                className="form-control"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="alertaEstoqueBaixo"
                checked={alertaEstoqueBaixo}
                onChange={(e) => setAlertaEstoqueBaixo(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="alertaEstoqueBaixo" className="text-sm">
                Apenas estoque baixo
              </label>
            </div>
          </div>
          <h4 className="font-semibold mt-6 mb-2">Itens em Estoque</h4>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Medicamento</th>
                  <th>Disponível</th>
                  <th>Total</th>
                  <th>Mínimo</th>
                  <th>Localização</th>
                </tr>
              </thead>
              <tbody>
                {sortedAndFilteredEstoque.map((item) => (
                  <tr
                    key={item.estoqueId}
                    className={
                      item.quantidadeDisponivel <= item.estoqueMinimo
                        ? "bg-red-50"
                        : ""
                    }
                  >
                    <td>{item.medicamentoNome}</td>
                    <td
                      className={
                        item.quantidadeDisponivel <= item.estoqueMinimo
                          ? "font-bold text-red-600"
                          : ""
                      }
                    >
                      {item.quantidadeDisponivel}
                    </td>
                    <td>{item.quantidadeTotal}</td>
                    <td>{item.estoqueMinimo}</td>
                    <td>{item.localizacao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h4 className="font-semibold mt-6 mb-2">
            Histórico de Movimentações
          </h4>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Medicamento</th>
                  <th>Tipo</th>
                  <th>Qtd.</th>
                  <th>Responsável</th>
                  <th>Observação</th>
                </tr>
              </thead>
              <tbody>
                {movimentacoes.map((mov) => (
                  <tr key={mov.movimentacaoId}>
                    <td>
                      {new Date(mov.dataMovimentacao).toLocaleString("pt-BR")}
                    </td>
                    <td>{mov.medicamentoNome}</td>
                    <td>{mov.tipoMovimentacao}</td>
                    <td>{mov.quantidadeMovimentada}</td>
                    <td>
                      {mov.responsavelNome} (ID: {mov.responsavelId})
                    </td>
                    <td>{mov.observacao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControleEstoque;
