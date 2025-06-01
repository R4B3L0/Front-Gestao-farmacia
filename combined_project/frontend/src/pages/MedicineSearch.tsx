import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface MedicineResult {
  id: number;
  nome: string;
  principioAtivo: string | null;
  controlado: boolean;
  fabricante?: string | null;
  dataCadastro?: string | null;
}

const MedicineSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<MedicineResult[]>([]);
  const [allMedicines, setAllMedicines] = useState<MedicineResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedControlado, setSelectedControlado] = useState<string>("");

  // Estado para modal
  const [selectedMedicine, setSelectedMedicine] =
    useState<MedicineResult | null>(null);

  // Busca os medicamentos do backend
  const fetchMedicines = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(
        "http://localhost:8080/api/medicamentos/listar",
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.statusText}`);
      }
      const data: MedicineResult[] = await response.json();
      setAllMedicines(data);
      setSearchResults(data);
    } catch (err) {
      setError("Erro ao carregar medicamentos. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError("");

    setTimeout(() => {
      try {
        let filteredResults = allMedicines;

        if (searchTerm.trim() !== "") {
          filteredResults = filteredResults.filter(
            (medicine) =>
              medicine.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (medicine.principioAtivo ?? "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
          );
        }

        if (selectedControlado) {
          const isControlado = selectedControlado === "sim";
          filteredResults = filteredResults.filter(
            (medicine) => medicine.controlado === isControlado
          );
        }

        setSearchResults(filteredResults);

        if (filteredResults.length === 0) {
          setError(
            "Nenhum medicamento encontrado com os critérios informados."
          );
        }
      } catch {
        setError("Ocorreu um erro ao realizar a busca. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    }, 200);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedControlado("");
    setSearchResults(allMedicines);
    setError("");
  };

  const handleEdit = (id: number) => {
    alert(`Editar medicamento ID: ${id}`);
  };

  // Ao clicar em detalhes, abre a modal com o medicamento selecionado
  const handleDetails = (id: number) => {
    const med = allMedicines.find((m) => m.id === id) || null;
    setSelectedMedicine(med);
  };

  // Fecha a modal
  const closeModal = () => setSelectedMedicine(null);

  return (
    <div className="form-window card animate-fade-in">
      <div className="card-header">
        <h2 className="card-title">Pesquisa de Medicamento</h2>
        <div className="window-controls">
          <span>_</span>
          <span>□</span>
          <span>×</span>
        </div>
      </div>

      <div className="card-body">
        <form onSubmit={handleSearch} className="mb-6">
          {/* --- FORM de busca e filtros --- */}
          <div className="form-row">
            <div className="form-group-full">
              <label htmlFor="searchTerm" className="form-label">
                Buscar por Nome ou Princípio Ativo
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="searchTerm"
                  className="form-control"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Digite para pesquisar..."
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="loader loader-sm"></span>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 4.5H21M3 12H21M3 19.5H21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Filtros
                </button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="form-row mt-4 p-4 bg-gray-50 rounded-md border border-gray-200 animate-slide-up">
              <div className="form-group-inline">
                <label htmlFor="controlado" className="form-label">
                  Controlado
                </label>
                <select
                  id="controlado"
                  className="form-control"
                  value={selectedControlado}
                  onChange={(e) => setSelectedControlado(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">Todos</option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>

              <div className="form-group-inline flex items-end">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleClearFilters}
                  disabled={isLoading}
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="search-results">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Resultados da Pesquisa</h3>
            <span className="badge badge-primary">
              {searchResults.length} encontrado(s)
            </span>
          </div>

          {error && (
            <div className="alert alert-info" role="alert">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="loader loader-lg"></div>
              <span className="ml-3 text-gray-600">
                Buscando medicamentos...
              </span>
            </div>
          ) : (
            <div className="table-container">
              {searchResults.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Princípio Ativo</th>
                      <th>Controlado</th>
                      <th className="text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((medicine) => (
                      <tr key={medicine.id}>
                        <td>{medicine.nome}</td>
                        <td>{medicine.principioAtivo ?? "-"}</td>
                        <td>{medicine.controlado ? "Sim" : "Não"}</td>
                        <td className="text-right">
                          <button
                            className="btn btn-outline btn-sm mr-2"
                            onClick={() => handleEdit(medicine.id)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleDetails(medicine.id)}
                          >
                            Detalhes
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Nenhum medicamento encontrado. Tente outros termos de busca.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalhes */}
      {selectedMedicine && (
        <div
          className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={closeModal}
          style={{ cursor: "pointer" }}
        >
          <div
            className="modal-content bg-white rounded-lg p-6 max-w-lg w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">
              Detalhes do Medicamento
            </h3>

            <table className="table mb-6">
              <tbody>
                <tr>
                  <th className="text-left">ID</th>
                  <td>{selectedMedicine.id}</td>
                </tr>
                <tr>
                  <th className="text-left">Nome</th>
                  <td>{selectedMedicine.nome}</td>
                </tr>
                <tr>
                  <th className="text-left">Princípio Ativo</th>
                  <td>{selectedMedicine.principioAtivo ?? "-"}</td>
                </tr>
                <tr>
                  <th className="text-left">Controlado</th>
                  <td>{selectedMedicine.controlado ? "Sim" : "Não"}</td>
                </tr>
                <tr>
                  <th className="text-left">Fabricante</th>
                  <td>{selectedMedicine.fabricante ?? "-"}</td>
                </tr>
                <tr>
                  <th className="text-left">Data de Cadastro</th>
                  <td>
                    {selectedMedicine.dataCadastro
                      ? new Date(
                          selectedMedicine.dataCadastro
                        ).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-center">
              <button
                className="btn btn-primary btn-sm"
                onClick={closeModal}
                style={{ minWidth: "100px" }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineSearch;
