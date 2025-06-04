import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config";

interface PatientData {
  id: number;
  nome: string;
  cpf: string;
  dataNascimento: string;
  dataCadastro: string;
  endereco: string;
  cep: string;
}

const PatientHistoryList: React.FC = () => {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    console.log("Iniciando fetchPatients...");
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/pacientes/listar`);
      console.log("Resposta da API recebida, status:", response.status);
      if (!response.ok) {
        throw new Error(`Erro ao buscar pacientes: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Dados recebidos da API:", data);

      if (!Array.isArray(data)) {
        console.error("Erro: Dados recebidos não são um array!", data);
        throw new Error("Formato de dados inesperado recebido do servidor.");
      }

      const sortedData = [...data].sort((a: PatientData, b: PatientData) => {
        const dateA = new Date(a.dataCadastro);
        const dateB = new Date(b.dataCadastro);
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          console.warn("Data de cadastro inválida encontrada:", a, b);
          return 0;
        }
        return dateB.getTime() - dateA.getTime();
      });
      console.log("Dados ordenados:", sortedData);
      setPatients(sortedData);
    } catch (err: any) {
      console.error("Erro no fetch ou processamento:", err);
      setError(err.message || "Erro ao carregar dados");
    } finally {
      setIsLoading(false);
      console.log("fetchPatients finalizado.");
    }
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.nome &&
      patient.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log("Renderizando componente. Estado atual:", {
    isLoading,
    error,
    patients,
    filteredPatients,
  });

  if (
    !isLoading &&
    !error &&
    patients.length > 0 &&
    filteredPatients.length === 0 &&
    searchTerm !== ""
  ) {
    console.log("Nenhum paciente encontrado para o termo de busca.");
  }
  if (!isLoading && !error && patients.length === 0) {
    console.log("Nenhum paciente cadastrado ou retornado pela API.");
  }

  return (
    <div className="card animate-fade-in">
      {/* ... (resto do card-header e input) ... */}
      <div className="card-header">
        <h2 className="card-title">Histórico de Pacientes</h2>
      </div>

      <div className="card-body">
        <input
          type="text"
          placeholder="Pesquisar por nome"
          className="form-control mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {isLoading ? (
          <p>Carregando...</p>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Data Nasc.</th>
                <th>Data Cadastro</th>
                <th>Endereço</th>
                <th>CEP</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient, index) => {
                console.log(`Renderizando paciente ${index}:`, patient);
                try {
                  const formattedCPF = patient.cpf
                    ? patient.cpf.replace(
                        /(\d{3})(\d{3})(\d{3})(\d{2})/,
                        "$1.$2.$3-$4"
                      )
                    : "CPF Inválido";
                  const formattedNascimento =
                    patient.dataNascimento &&
                    !isNaN(new Date(patient.dataNascimento).getTime())
                      ? new Date(patient.dataNascimento).toLocaleDateString()
                      : "Data Inválida";
                  const formattedCadastro =
                    patient.dataCadastro &&
                    !isNaN(new Date(patient.dataCadastro).getTime())
                      ? new Date(patient.dataCadastro).toLocaleDateString()
                      : "Data Inválida";
                  const formattedCEP =
                    typeof patient.cep === "string" && patient.cep
                      ? patient.cep.replace(/(\d{5})(\d{3})/, "$1-$2")
                      : patient.cep !== null && patient.cep !== undefined
                      ? String(patient.cep)
                      : "CEP Inválido";
                  return (
                    <tr key={patient.id}>
                      <td>{patient.nome || "Nome Inválido"}</td>
                      <td>{formattedCPF}</td>
                      <td>{formattedNascimento}</td>
                      <td>{formattedCadastro}</td>
                      <td>{patient.endereco || "Endereço Inválido"}</td>
                      <td>{formattedCEP}</td>
                    </tr>
                  );
                } catch (renderError: any) {
                  console.error(
                    `Erro ao renderizar paciente ${patient.id}:`,
                    renderError,
                    patient
                  ); // Log 12
                  return (
                    <tr key={`error-${patient.id}`}>
                      <td colSpan={6} style={{ color: "red" }}>
                        Erro ao renderizar dados deste paciente (ID:{" "}
                        {patient.id})
                      </td>
                    </tr>
                  );
                }
              })}
              {!isLoading && !error && filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center">
                    Nenhum paciente encontrado{" "}
                    {searchTerm ? `para "${searchTerm}"` : "(lista vazia)"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PatientHistoryList;
