import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";
import { format } from "date-fns";

interface BatchItem {
  id: number;
  medicamentoId: number;
  numeroLote: string;
  dataValidade: string;
  quantidadeAtual: number;
  localArmazenado: string;
  nomeMedicamento?: string;
}

interface BatchFormData {
  medicamentoId: string;
  numeroLote: string;
  dataValidade: string;
  quantidadeAtual: string;
  localArmazenado: string;
}

const BatchControl: React.FC = () => {
  const navigate = useNavigate();

  const generateLotNumber = (): string => {
    const randomChars = Math.random()
      .toString(36)
      .substring(2, 5)
      .toUpperCase();
    const randomNumber1 = Math.floor(100 + Math.random() * 900);
    const randomNumber2 = Math.floor(100 + Math.random() * 900);

    const prefix = "A";
    const part1 = Math.random().toString(36).substring(2, 5).toUpperCase();
    const middle = "XYZ"; // Parte fixa
    const part2 = Math.floor(100 + Math.random() * 900).toString();

    return `${prefix}${part1}${middle}${part2}`;
  };

  const [formData, setFormData] = useState<BatchFormData>({
    medicamentoId: "",
    numeroLote: generateLotNumber(),
    dataValidade: "",
    quantidadeAtual: "",
    localArmazenado: "",
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(
    null
  );
  const [sortField, setSortField] = useState<keyof BatchItem | string>(
    "dataValidade"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterExpired, setFilterExpired] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBatches = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/lotes/listar-todos`);
        if (!response.ok) {
          throw new Error(`Erro ao buscar lotes: ${response.statusText}`);
        }
        const data: BatchItem[] = await response.json();
        const formattedData = data.map((batch) => ({
          ...batch,
          dataValidade: batch.dataValidade
            ? format(new Date(batch.dataValidade + "T00:00:00"), "yyyy-MM-dd")
            : "",
        }));
        setBatches(formattedData);
      } catch (error: any) {
        setFetchError(error.message || "Erro ao carregar lotes.");
        setBatches([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatches();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    const { medicamentoId, quantidadeAtual, dataValidade, localArmazenado } =
      formData;

    if (!medicamentoId.trim() || isNaN(Number(medicamentoId)))
      newErrors.medicamentoId =
        "ID do Medicamento é obrigatório e deve ser numérico";

    if (!quantidadeAtual.trim()) {
      newErrors.quantidadeAtual = "Quantidade é obrigatória";
    } else if (isNaN(Number(quantidadeAtual)) || Number(quantidadeAtual) <= 0) {
      newErrors.quantidadeAtual = "Quantidade deve ser um número positivo";
    }

    if (!localArmazenado.trim())
      newErrors.localArmazenado = "Local de armazenamento é obrigatório";
    if (!dataValidade)
      newErrors.dataValidade = "Data de validade é obrigatória";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    const loteData = {
      medicamentoId: parseInt(formData.medicamentoId),
      numeroLote: formData.numeroLote,
      dataValidade: formData.dataValidade,
      quantidadeAtual: parseInt(formData.quantidadeAtual),
      localArmazenado: formData.localArmazenado,
    };

    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/lotes/cadastrar`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(loteData),
      });

      if (!response.ok) {
        const text = await response.text();
        let errorData = { message: "Erro desconhecido ao cadastrar lote" };
        try {
          errorData = text
            ? JSON.parse(text)
            : { message: `Erro ${response.status}: ${response.statusText}` };
        } catch {
          errorData = {
            message: `Erro ${response.status}: ${response.statusText} - ${text}`,
          };
        }
        throw new Error(
          (errorData as { message?: string }).message ||
            "Erro ao cadastrar lote"
        );
      }

      const newBatch: BatchItem = await response.json();
      newBatch.dataValidade = newBatch.dataValidade
        ? format(new Date(newBatch.dataValidade + "T00:00:00"), "yyyy-MM-dd")
        : "";

      setBatches([...batches, newBatch]);
      setIsSaved(true);

      setFormData({
        medicamentoId: "",
        numeroLote: generateLotNumber(),
        dataValidade: "",
        quantidadeAtual: "",
        localArmazenado: "",
      });

      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    } catch (err: any) {
      setErrors({
        form:
          err.message ||
          "Ocorreu um erro ao cadastrar o lote. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(id);

    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/lotes/deletar/${id}`, {
        method: "DELETE",
        headers: headers,
      });

      if (!response.ok) {
        let errorMsg = `Erro ao excluir lote: ${response.statusText}`;
        try {
          const text = await response.text();
          if (text) errorMsg += ` - ${text}`;
        } catch {}
        throw new Error(errorMsg);
      }

      setBatches(batches.filter((batch) => batch.id !== id));
    } catch (err: any) {
      alert(
        err.message || "Ocorreu um erro ao excluir o lote. Tente novamente."
      );
    } finally {
      setIsDeleting(null);
      setShowConfirmDelete(null);
    }
  };

  const handleSort = (field: keyof BatchItem | string) => {
    const key = field as keyof BatchItem;
    if (sortField === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(key);
      setSortDirection("asc");
    }
  };

  const getSortedBatches = () => {
    let filtered = [...batches];

    if (filterExpired) {
      const today = format(new Date(), "yyyy-MM-dd");
      filtered = filtered.filter((batch) => batch.dataValidade < today);
    }

    return filtered.sort((a, b) => {
      const fieldA = a[sortField as keyof BatchItem];
      const fieldB = b[sortField as keyof BatchItem];
      let comparison = 0;

      if (typeof fieldA === "string" && typeof fieldB === "string") {
        if (sortField === "dataValidade") {
          comparison =
            new Date(fieldA + "T00:00:00").getTime() -
            new Date(fieldB + "T00:00:00").getTime();
        } else {
          comparison = fieldA.localeCompare(fieldB);
        }
      } else if (typeof fieldA === "number" && typeof fieldB === "number") {
        comparison = fieldA - fieldB;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  };

  const isExpired = (date: string): boolean => {
    return date < format(new Date(), "yyyy-MM-dd");
  };

  return (
    <div className="form-window card animate-fade-in">
      <div className="card-header">
        <h2 className="card-title">Controle de Lotes</h2>
        <div className="window-controls">
          <span>_</span>
          <span>□</span>
          <span>×</span>
        </div>
      </div>

      <div className="card-body">
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 8H4C2.89543 8 2 8.89543 2 10V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V10C22 8.89543 21.1046 8 20 8Z"
                stroke="var(--primary)"
                strokeWidth="1.5"
              />
              <path
                d="M6 8V6C6 4.89543 6.89543 4 8 4H16C17.1046 4 18 4.89543 18 6V8"
                stroke="var(--primary)"
                strokeWidth="1.5"
              />
              <path
                d="M12 12V16M10 14H14"
                stroke="var(--primary)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {errors.form && (
          <div className="alert alert-danger mb-4" role="alert">
            {errors.form}
          </div>
        )}

        {isSaved && (
          <div className="alert alert-success mb-4" role="alert">
            Lote cadastrado com sucesso!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group-inline">
              <label htmlFor="medicamentoId" className="form-label">
                ID Medicamento
              </label>
              <input
                type="number"
                id="medicamentoId"
                name="medicamentoId"
                className={`form-control ${
                  errors.medicamentoId ? "is-invalid" : ""
                }`}
                value={formData.medicamentoId}
                onChange={handleInputChange}
                placeholder="ID do medicamento"
                disabled={isLoading}
              />
              {errors.medicamentoId && (
                <div className="invalid-feedback">{errors.medicamentoId}</div>
              )}
            </div>

            <div className="form-group-inline">
              <label htmlFor="numeroLote" className="form-label">
                Número do Lote
              </label>
              <input
                type="text"
                id="numeroLote"
                name="numeroLote"
                className={`form-control ${
                  errors.numeroLote ? "is-invalid" : ""
                }`}
                value={formData.numeroLote}
                placeholder="Gerado automaticamente"
                disabled={true}
              />
              {errors.numeroLote && (
                <div className="invalid-feedback">{errors.numeroLote}</div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group-inline">
              <label htmlFor="quantidadeAtual" className="form-label">
                Quantidade Atual
              </label>
              <input
                type="number"
                id="quantidadeAtual"
                name="quantidadeAtual"
                className={`form-control ${
                  errors.quantidadeAtual ? "is-invalid" : ""
                }`}
                value={formData.quantidadeAtual}
                onChange={handleInputChange}
                min="1"
                placeholder="Quantidade de unidades"
                disabled={isLoading}
              />
              {errors.quantidadeAtual && (
                <div className="invalid-feedback">{errors.quantidadeAtual}</div>
              )}
            </div>

            <div className="form-group-inline">
              <label htmlFor="localArmazenado" className="form-label">
                Local Armazenado
              </label>
              <input
                type="text"
                id="localArmazenado"
                name="localArmazenado"
                className={`form-control ${
                  errors.localArmazenado ? "is-invalid" : ""
                }`}
                value={formData.localArmazenado}
                onChange={handleInputChange}
                placeholder="Local de armazenamento"
                disabled={isLoading}
              />
              {errors.localArmazenado && (
                <div className="invalid-feedback">{errors.localArmazenado}</div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group-full">
              <label htmlFor="dataValidade" className="form-label">
                Data de Validade
              </label>
              <input
                type="date"
                id="dataValidade"
                name="dataValidade"
                className={`form-control ${
                  errors.dataValidade ? "is-invalid" : ""
                }`}
                value={formData.dataValidade}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              {errors.dataValidade && (
                <div className="invalid-feedback">{errors.dataValidade}</div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate("/dashboard")}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loader loader-sm mr-2"></span>
                  Salvando...
                </>
              ) : (
                "Salvar Lote"
              )}
            </button>
          </div>
        </form>

        <div className="batch-list mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Lotes Cadastrados</h3>
            <div className="flex items-center">
              <div className="form-check mr-4">
                <input
                  type="checkbox"
                  id="filterExpired"
                  className="mr-2"
                  checked={filterExpired}
                  onChange={(e) => setFilterExpired(e.target.checked)}
                />
                <label htmlFor="filterExpired" className="text-sm">
                  Mostrar apenas expirados
                </label>
              </div>
              <span className="badge badge-primary">
                {getSortedBatches().length} lote(s)
              </span>
            </div>
          </div>

          {fetchError && (
            <div className="alert alert-danger mb-4" role="alert">
              {fetchError}
            </div>
          )}

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("id")}
                  >
                    ID
                  </th>
                  <th
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("medicamentoId")}
                  >
                    ID Med.
                  </th>
                  <th
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("numeroLote")}
                  >
                    Lote
                  </th>
                  <th
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("quantidadeAtual")}
                  >
                    Qtd.
                  </th>
                  <th
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("dataValidade")}
                  >
                    Validade
                  </th>
                  <th
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("localArmazenado")}
                  >
                    Local
                  </th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && !fetchError && (
                  <tr>
                    <td colSpan={7} className="text-center p-4">
                      Carregando lotes...
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  getSortedBatches().length === 0 &&
                  !fetchError && (
                    <tr>
                      <td colSpan={7} className="text-center p-4">
                        Nenhum lote encontrado.
                      </td>
                    </tr>
                  )}
                {!isLoading &&
                  getSortedBatches().map((batch) => (
                    <tr
                      key={batch.id}
                      className={
                        isExpired(batch.dataValidade) ? "bg-red-100" : ""
                      }
                    >
                      <td>{batch.id}</td>
                      <td>{batch.medicamentoId}</td>
                      <td>{batch.numeroLote}</td>
                      <td>{batch.quantidadeAtual}</td>
                      <td>
                        {format(
                          new Date(batch.dataValidade + "T00:00:00"),
                          "dd/MM/yyyy"
                        )}
                      </td>
                      <td>{batch.localArmazenado}</td>
                      <td>
                        {showConfirmDelete === batch.id ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-red-700">
                              Confirmar?
                            </span>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(batch.id)}
                              disabled={isDeleting === batch.id}
                            >
                              {isDeleting === batch.id ? "..." : "Sim"}
                            </button>
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => setShowConfirmDelete(null)}
                              disabled={isDeleting === batch.id}
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setShowConfirmDelete(batch.id)}
                            disabled={isDeleting !== null}
                          >
                            {isDeleting === batch.id ? (
                              <span className="loader loader-xs"></span>
                            ) : (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M21 7H3"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </button>
                        )}
                      </td>
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

export default BatchControl;
