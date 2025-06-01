import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PatientRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState<string>("");
  const [cpf, setCpf] = useState<string>("");
  const [rg, setRg] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [cep, setCep] = useState<string>("");
  const [telefone, setTelefone] = useState<string>(""); // telefone
  const [description, setDescription] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState<string>("");

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) newErrors.name = "Nome do paciente é obrigatório";

    if (!cpf.trim()) {
      newErrors.cpf = "CPF é obrigatório";
    } else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/.test(cpf)) {
      newErrors.cpf = "CPF inválido";
    }

    if (!rg.trim()) newErrors.rg = "RG é obrigatório";
    if (!dateOfBirth)
      newErrors.dateOfBirth = "Data de nascimento é obrigatória";
    if (!address.trim()) newErrors.address = "Endereço é obrigatório";

    if (!cep.trim()) {
      newErrors.cep = "CEP é obrigatório";
    } else if (!/^\d{5}-\d{3}$|^\d{8}$/.test(cep)) {
      newErrors.cep = "CEP inválido";
    }

    // validação simples de telefone: aceitar números com 10 ou 11 dígitos (com DDD)
    if (telefone.trim()) {
      const phoneDigits = telefone.replace(/\D/g, "");
      if (phoneDigits.length < 10 || phoneDigits.length > 11) {
        newErrors.telefone = "Telefone inválido";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCPF = (value: string): string => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9)
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(
      6,
      9
    )}-${digits.slice(9, 11)}`;
  };

  const formatCEP = (value: string): string => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
  };

  const formatTelefone = (value: string): string => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10)
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(
      7,
      11
    )}`;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedValue = formatCPF(value);
    setCpf(formattedValue);
  };

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedValue = formatCEP(value);
    setCep(formattedValue);
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedValue = formatTelefone(value);
    setTelefone(formattedValue);
  };

  const handleRGChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyDigits = e.target.value.replace(/\D/g, "");
    setRg(onlyDigits.slice(0, 8));
  };

  const submitPatient = async () => {
    const payload = {
      nome: name,
      cpf: cpf.replace(/\D/g, ""),
      rg: rg,
      dataNascimento: dateOfBirth,
      endereco: address,
      cep: cep.replace(/\D/g, ""),
      telefone: telefone.replace(/\D/g, ""), // envia só números
      descricao: description,
    };

    try {
      const response = await axios.post(
        "http://localhost:8080/api/pacientes",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Erro ao cadastrar paciente"
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSuccessMessage("");
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await submitPatient();
      setSuccessMessage("Paciente cadastrado com sucesso!");
      setTimeout(() => {
        navigate("/dashboard/patient/file");
      }, 2000);
    } catch (err: any) {
      setErrors({
        form:
          err.message ||
          "Ocorreu um erro ao cadastrar o paciente. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-window card animate-fade-in">
      <div className="card-header">
        <h2 className="card-title">Cadastro de Paciente</h2>
        <div className="window-controls">
          <span>_</span>
          <span>□</span>
          <span>×</span>
        </div>
      </div>

      <div className="card-body">
        <div className="user-icon mb-6 flex justify-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
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
            </svg>
          </div>
        </div>

        {errors.form && (
          <div className="alert alert-danger mb-4" role="alert">
            {errors.form}
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success mb-4" role="alert">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Nome */}
          <div className="form-row">
            <div className="form-group-full">
              <label htmlFor="name" className="form-label">
                Nome do Paciente
              </label>
              <input
                type="text"
                id="name"
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite o nome completo do paciente"
                disabled={isLoading}
              />
              {errors.name && (
                <div className="invalid-feedback">{errors.name}</div>
              )}
            </div>
          </div>

          {/* CPF, RG, Data Nasc */}
          <div className="form-row">
            <div className="form-group-inline">
              <label htmlFor="cpf" className="form-label">
                CPF
              </label>
              <input
                type="text"
                id="cpf"
                className={`form-control ${errors.cpf ? "is-invalid" : ""}`}
                value={cpf}
                onChange={handleCPFChange}
                placeholder="000.000.000-00"
                maxLength={14}
                disabled={isLoading}
              />
              {errors.cpf && (
                <div className="invalid-feedback">{errors.cpf}</div>
              )}
            </div>

            <div className="form-group-inline">
              <label htmlFor="rg" className="form-label">
                RG
              </label>
              <input
                type="text"
                id="rg"
                className={`form-control ${errors.rg ? "is-invalid" : ""}`}
                value={rg}
                onChange={handleRGChange}
                placeholder="Digite o RG"
                maxLength={8}
                disabled={isLoading}
              />
              {errors.rg && <div className="invalid-feedback">{errors.rg}</div>}
            </div>

            <div className="form-group-inline">
              <label htmlFor="dateOfBirth" className="form-label">
                Data de Nascimento
              </label>
              <input
                type="date"
                id="dateOfBirth"
                className={`form-control ${
                  errors.dateOfBirth ? "is-invalid" : ""
                }`}
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                disabled={isLoading}
              />
              {errors.dateOfBirth && (
                <div className="invalid-feedback">{errors.dateOfBirth}</div>
              )}
            </div>
          </div>

          {/* Endereço e CEP */}
          <div className="form-row">
            <div className="form-group-full">
              <label htmlFor="address" className="form-label">
                Endereço
              </label>
              <input
                type="text"
                id="address"
                className={`form-control ${errors.address ? "is-invalid" : ""}`}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Digite o endereço completo"
                disabled={isLoading}
              />
              {errors.address && (
                <div className="invalid-feedback">{errors.address}</div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group-inline">
              <label htmlFor="cep" className="form-label">
                CEP
              </label>
              <input
                type="text"
                id="cep"
                className={`form-control ${errors.cep ? "is-invalid" : ""}`}
                value={cep}
                onChange={handleCEPChange}
                placeholder="00000-000"
                maxLength={9}
                disabled={isLoading}
              />
              {errors.cep && (
                <div className="invalid-feedback">{errors.cep}</div>
              )}
            </div>

            <div className="form-group-inline">
              <label htmlFor="telefone" className="form-label">
                Telefone
              </label>
              <input
                type="text"
                id="telefone"
                className={`form-control ${
                  errors.telefone ? "is-invalid" : ""
                }`}
                value={telefone}
                onChange={handleTelefoneChange}
                placeholder="(00) 00000-0000"
                maxLength={15}
                disabled={isLoading}
              />
              {errors.telefone && (
                <div className="invalid-feedback">{errors.telefone}</div>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div className="form-row">
            <div className="form-group-inline">
              <label htmlFor="description" className="form-label">
                Descrição
              </label>
              <textarea
                id="description"
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Descrição ou observações"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-footer">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Cadastrando..." : "Cadastrar Paciente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientRegistration;
