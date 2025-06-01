import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API_BASE_URL from '../config'; // Importar a URL base da API

// Interface ajustada para refletir ClienteDTO (aproximado)
interface PatientData {
  id?: number; // Adicionado ID, comum em DTOs
  nome?: string;
  cpf?: string;
  rg?: string; // RG não existe no ClienteDTO original, manter ou remover?
  dataNascimento?: string; // Ajustar nome do campo
  dataCadastro?: string; // Ajustar nome do campo
  endereco?: string;
  cep?: string;
  // fileNumber e description não existem no ClienteDTO original
  // Mantendo para consistência do formulário, mas não serão enviados/recebidos diretamente
  fileNumber?: string;
  description?: string;
}

const PatientFile: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>(); // ID será numérico vindo da API
  const [fileNumber, setFileNumber] = useState<string>(''); // Campo local, não do DTO
  const [name, setName] = useState<string>('');
  const [cpf, setCpf] = useState<string>('');
  const [rg, setRg] = useState<string>(''); // Campo local, não do DTO?
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [registrationDate, setRegistrationDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [address, setAddress] = useState<string>('');
  const [cep, setCep] = useState<string>('');
  const [description, setDescription] = useState<string>(''); // Campo local, não do DTO
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      // Ajustar endpoint para /clientes/{id}
      fetch(`${API_BASE_URL}/clientes/${id}`)
        .then(async (res) => {
          if (!res.ok) {
            throw new Error('Erro ao carregar dados do cliente');
          }
          const text = await res.text();
          let data: PatientData = {};
          try {
            if (text) {
              data = JSON.parse(text);
            } else {
              data = {};
            }
          } catch (error) {
            console.error('Failed to parse patient data JSON:', text);
            setErrors({ form: 'Erro ao interpretar os dados do cliente' });
            setIsLoading(false);
            return;
          }
          // Mapear campos do ClienteDTO para o estado do formulário
          // fileNumber e description não vêm da API
          setName(data.nome || '');
          setCpf(data.cpf || '');
          setRg(data.rg || ''); // RG não existe no DTO, de onde viria?
          setDateOfBirth(data.dataNascimento || '');
          setRegistrationDate(data.dataCadastro || new Date().toISOString().split('T')[0]);
          setAddress(data.endereco || '');
          setCep(data.cep || '');
          // Manter fileNumber e description locais ou buscar de outra fonte?
          // setFileNumber(data.fileNumber || '');
          // setDescription(data.description || '');
        })
        .catch((error) => {
          setErrors({ form: error.message });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id]);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    // Validar campos conforme necessário, ajustando para campos do DTO
    // if (!fileNumber.trim()) newErrors.fileNumber = 'Número da ficha é obrigatório'; // Campo local
    if (!name.trim()) newErrors.name = 'Nome do paciente é obrigatório';

    if (!cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/.test(cpf.replace(/\D/g, ''))) {
      newErrors.cpf = 'CPF inválido';
    }

    // if (!rg.trim()) newErrors.rg = 'RG é obrigatório'; // Campo não presente no DTO
    if (!dateOfBirth) newErrors.dateOfBirth = 'Data de nascimento é obrigatória';
    if (!registrationDate) newErrors.registrationDate = 'Data de cadastro é obrigatória';
    if (!address.trim()) newErrors.address = 'Endereço é obrigatório';

    if (!cep.trim()) {
      newErrors.cep = 'CEP é obrigatório';
    } else if (!/^\d{5}-?\d{3}$/.test(cep.replace(/\D/g, ''))) {
      newErrors.cep = 'CEP inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCPF = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  };

  const formatCEP = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    // Mapear estado do formulário para ClienteDTO
    const patientData = {
      nome: name,
      cpf: cpf.replace(/\D/g, ''), // Enviar apenas dígitos
      // rg: rg, // RG não está no DTO
      dataNascimento: dateOfBirth,
      dataCadastro: registrationDate,
      endereco: address,
      cep: cep.replace(/\D/g, ''), // Enviar apenas dígitos
      // fileNumber e description não estão no DTO
    };

    try {
      // Ajustar endpoint para /clientes ou /clientes/{id}
      const url = id ? `${API_BASE_URL}/clientes/${id}` : `${API_BASE_URL}/clientes`;
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      if (!response.ok) {
        const text = await response.text();
        let errorData = { message: 'Erro desconhecido ao salvar o cliente' };
        try {
          errorData = text ? JSON.parse(text) : { message: `Erro ${response.status}: ${response.statusText}` };
        } catch {
           errorData = { message: `Erro ${response.status}: ${response.statusText} - ${text}` };
        }
        throw new Error((errorData as { message?: string }).message || 'Erro ao salvar o cliente');
      }

      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        navigate('/dashboard'); // Redirecionar para dashboard ou lista de clientes?
      }, 2000);
    } catch (err: any) {
      setErrors({ form: err.message || 'Erro desconhecido ao salvar o cliente' });
    } finally {
      setIsLoading(false);
    }
  };

  // O restante do JSX permanece o mesmo, mas os campos RG, Nº Ficha e Descrição
  // podem precisar ser removidos ou adaptados se não forem usados com o backend Java.

  return (
    <div className="form-window card animate-fade-in">
      <div className="card-header">
        {/* Ajustar título se necessário */}
        <h2 className="card-title">Cadastro/Edição de Cliente</h2>
        <div className="window-controls">
          <span>_</span>
          <span>□</span>
          <span>×</span>
        </div>
      </div>

      <div className="card-body">
        {/* Ícone pode ser mantido ou alterado */}
        <div className="user-icon mb-6 flex justify-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="var(--primary)" strokeWidth="1.5" />
              <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20V21H4V20Z" stroke="var(--primary)" strokeWidth="1.5" />
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
            Cliente salvo com sucesso!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Campo Nº Ficha - Remover ou adaptar, pois não existe no DTO */}
          {/*
          <div className="form-row">
            <div className="form-group-inline">
              <label htmlFor="fileNumber" className="form-label">Nº Ficha</label>
              <input
                type="text"
                id="fileNumber"
                className={`form-control ${errors.fileNumber ? 'is-invalid' : ''}`}
                value={fileNumber}
                onChange={(e) => setFileNumber(e.target.value)}
                placeholder="Número da ficha"
                disabled={isLoading}
              />
              {errors.fileNumber && <div className="invalid-feedback">{errors.fileNumber}</div>}
            </div>
            <div className="form-group-inline">
              <label htmlFor="registrationDate" className="form-label">Data Cad.</label>
              <input
                type="date"
                id="registrationDate"
                className={`form-control ${errors.registrationDate ? 'is-invalid' : ''}`}
                value={registrationDate}
                onChange={(e) => setRegistrationDate(e.target.value)}
                disabled={isLoading}
              />
              {errors.registrationDate && <div className="invalid-feedback">{errors.registrationDate}</div>}
            </div>
          </div>
          */}

          <div className="form-row">
            <div className="form-group-full">
              <label htmlFor="name" className="form-label">Cliente</label> {/* Label ajustado */}
              <input
                type="text"
                id="name"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome completo do cliente"
                disabled={isLoading}
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group-inline">
              <label htmlFor="cpf" className="form-label">CPF</label>
              <input
                type="text"
                id="cpf"
                className={`form-control ${errors.cpf ? 'is-invalid' : ''}`}
                value={cpf}
                onChange={handleCPFChange}
                placeholder="000.000.000-00"
                maxLength={14}
                disabled={isLoading}
              />
              {errors.cpf && <div className="invalid-feedback">{errors.cpf}</div>}
            </div>

            {/* Campo RG - Remover ou adaptar */}
            {/*
            <div className="form-group-inline">
              <label htmlFor="rg" className="form-label">RG</label>
              <input
                type="text"
                id="rg"
                className={`form-control ${errors.rg ? 'is-invalid' : ''}`}
                value={rg}
                onChange={(e) => setRg(e.target.value)}
                placeholder="Digite o RG"
                disabled={isLoading}
              />
              {errors.rg && <div className="invalid-feedback">{errors.rg}</div>}
            </div>
            */}

            <div className="form-group-inline">
              <label htmlFor="dateOfBirth" className="form-label">Data Nasc.</label>
              <input
                type="date"
                id="dateOfBirth"
                className={`form-control ${errors.dateOfBirth ? 'is-invalid' : ''}`}
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                disabled={isLoading}
              />
              {errors.dateOfBirth && <div className="invalid-feedback">{errors.dateOfBirth}</div>}
            </div>
             <div className="form-group-inline">
              <label htmlFor="registrationDate" className="form-label">Data Cad.</label>
              <input
                type="date"
                id="registrationDate"
                className={`form-control ${errors.registrationDate ? 'is-invalid' : ''}`}
                value={registrationDate}
                onChange={(e) => setRegistrationDate(e.target.value)}
                disabled={isLoading}
              />
              {errors.registrationDate && <div className="invalid-feedback">{errors.registrationDate}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group-inline">
              <label htmlFor="address" className="form-label">Endereço</label>
              <input
                type="text"
                id="address"
                className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Endereço completo"
                disabled={isLoading}
              />
              {errors.address && <div className="invalid-feedback">{errors.address}</div>}
            </div>

            <div className="form-group-inline">
              <label htmlFor="cep" className="form-label">CEP</label>
              <input
                type="text"
                id="cep"
                className={`form-control ${errors.cep ? 'is-invalid' : ''}`}
                value={cep}
                onChange={handleCEPChange}
                placeholder="00000-000"
                maxLength={9}
                disabled={isLoading}
              />
              {errors.cep && <div className="invalid-feedback">{errors.cep}</div>}
            </div>
          </div>

          {/* Campo Descrição - Remover ou adaptar */}
          {/*
          <div className="form-row">
            <div className="form-group-full">
              <label htmlFor="description" className="form-label">Descrição</label>
              <textarea
                id="description"
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Informações adicionais sobre o paciente"
                rows={4}
                disabled={isLoading}
              />
            </div>
          </div>
          */}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/dashboard')} // Ajustar rota se necessário
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
              ) : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientFile;
