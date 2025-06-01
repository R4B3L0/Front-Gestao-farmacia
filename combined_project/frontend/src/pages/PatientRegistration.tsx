import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PatientRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState<string>('');
  const [cpf, setCpf] = useState<string>('');
  const [rg, setRg] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [cep, setCep] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!name.trim()) newErrors.name = 'Nome do paciente é obrigatório';
    
    if (!cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/.test(cpf)) {
      newErrors.cpf = 'CPF inválido';
    }
    
    if (!rg.trim()) newErrors.rg = 'RG é obrigatório';
    if (!dateOfBirth) newErrors.dateOfBirth = 'Data de nascimento é obrigatória';
    if (!address.trim()) newErrors.address = 'Endereço é obrigatório';
    
    if (!cep.trim()) {
      newErrors.cep = 'CEP é obrigatório';
    } else if (!/^\d{5}-\d{3}$|^\d{8}$/.test(cep)) {
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
    
    // Simulando uma chamada de API com delay
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Em um cenário real, aqui seria feito o cadastro com o backend
      // Por enquanto, apenas simulamos o cadastro e redirecionamos para a ficha do paciente
      navigate('/dashboard/patient/file');
    } catch (err) {
      setErrors({ form: 'Ocorreu um erro ao cadastrar o paciente. Tente novamente.' });
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
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group-full">
              <label htmlFor="name" className="form-label">Nome do Paciente</label>
              <input 
                type="text" 
                id="name" 
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite o nome completo do paciente"
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
            
            <div className="form-group-inline">
              <label htmlFor="dateOfBirth" className="form-label">Data de Nascimento</label>
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
                placeholder="Digite o endereço completo"
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
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={() => navigate('/dashboard')}
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

export default PatientRegistration;
