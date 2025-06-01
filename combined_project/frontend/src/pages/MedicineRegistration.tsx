import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

// Interface para representar os dados do formulário
interface MedicineFormData {
  nome: string;
  principioAtivo: string;
  controlado: boolean;
//  descricao: string;
  dosagem: string;
  fabricante: string;
  categoria: string;
  numeroRegistro: string;
}

const MedicineRegistration: React.FC = () => {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [principioAtivo, setPrincipioAtivo] = useState('');
  const [controlado, setControlado] = useState(false);
  //const [descricao, setDescricao] = useState('');
  const [dosagem, setDosagem] = useState('');
  const [fabricante, setFabricante] = useState('');
  const [categoria, setCategoria] = useState('');
  const [numeroRegistro, setNumeroRegistro] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaved, setIsSaved] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!nome.trim()) newErrors.nome = 'Nome do medicamento é obrigatório';
    if (!principioAtivo.trim()) newErrors.principioAtivo = 'Princípio Ativo é obrigatório';
    if (!fabricante.trim()) newErrors.fabricante = 'Fabricante é obrigatório';
    if (!categoria) newErrors.categoria = 'Categoria é obrigatória';
    if (!dosagem.trim()) newErrors.dosagem = 'Dosagem é obrigatória';
    if (!numeroRegistro.trim()) newErrors.numeroRegistro = 'Número de registro é obrigatório';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    const medicineData: MedicineFormData = {
      nome,
      principioAtivo,
      controlado,
      //descricao,
      dosagem,
      fabricante,
      categoria,
      numeroRegistro,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/medicamentos/cadastrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicineData),
      });

      if (!response.ok) {
        const text = await response.text();
        let errorData = { message: 'Erro desconhecido ao cadastrar medicamento' };
        try {
          errorData = text ? JSON.parse(text) : { message: `Erro ${response.status}: ${response.statusText}` };
        } catch {
          errorData = { message: `Erro ${response.status}: ${response.statusText} - ${text}` };
        }
        throw new Error(errorData.message || 'Erro ao cadastrar medicamento');
      }

      setIsSaved(true);

      // Limpar formulário
      setNome('');
      setPrincipioAtivo('');
      setControlado(false);
     // setDescricao('');
      setDosagem('');
      setFabricante('');
      setCategoria('');
      setNumeroRegistro('');

      // Esconder mensagem sucesso após 3 segundos
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      setErrors({ form: err.message || 'Ocorreu um erro ao cadastrar o medicamento. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-window card animate-fade-in">
      <div className="card-header">
        <h2 className="card-title">Cadastro de Medicamento</h2>
        <div className="window-controls">
          <span>_</span>
          <span>□</span>
          <span>×</span>
        </div>
      </div>

      <div className="card-body">
        {errors.form && <div className="alert alert-danger mb-4">{errors.form}</div>}

        {isSaved && <div className="alert alert-success mb-4">Medicamento cadastrado com sucesso!</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group-full">
              <label htmlFor="nome" className="form-label">Nome do Medicamento</label>
              <input
                type="text"
                id="nome"
                className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Digite o nome do medicamento"
                disabled={isLoading}
              />
              {errors.nome && <div className="invalid-feedback">{errors.nome}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group-full">
              <label htmlFor="principioAtivo" className="form-label">Princípio Ativo</label>
              <input
                type="text"
                id="principioAtivo"
                className={`form-control ${errors.principioAtivo ? 'is-invalid' : ''}`}
                value={principioAtivo}
                onChange={e => setPrincipioAtivo(e.target.value)}
                placeholder="Digite o princípio ativo"
                disabled={isLoading}
              />
              {errors.principioAtivo && <div className="invalid-feedback">{errors.principioAtivo}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group-full">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="controlado"
                  className="form-checkbox h-5 w-5 text-blue-600"
                  checked={controlado}
                  onChange={e => setControlado(e.target.checked)}
                  disabled={isLoading}
                />
                <label htmlFor="controlado" className="form-label mb-0">Medicamento Controlado</label>
              </div>
            </div>
          </div>

          {/* <div className="form-row">
            <div className="form-group-full">
              <label htmlFor="descricao" className="form-label">Descrição</label>
              <textarea
                id="descricao"
                className="form-control"
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                placeholder="Informações adicionais sobre o medicamento"
                rows={3}
                disabled={isLoading}
              />
            </div>
          </div> */}

          <div className="form-row">
            <div className="form-group-inline">
              <label htmlFor="dosagem" className="form-label">Dosagem</label>
              <input
                type="text"
                id="dosagem"
                className={`form-control ${errors.dosagem ? 'is-invalid' : ''}`}
                value={dosagem}
                onChange={e => setDosagem(e.target.value)}
                placeholder="Ex: 500mg, 10ml, etc."
                disabled={isLoading}
              />
              {errors.dosagem && <div className="invalid-feedback">{errors.dosagem}</div>}
            </div>

            <div className="form-group-inline">
              <label htmlFor="fabricante" className="form-label">Fabricante</label>
              <input
                type="text"
                id="fabricante"
                className={`form-control ${errors.fabricante ? 'is-invalid' : ''}`}
                value={fabricante}
                onChange={e => setFabricante(e.target.value)}
                placeholder="Nome do fabricante"
                disabled={isLoading}
              />
              {errors.fabricante && <div className="invalid-feedback">{errors.fabricante}</div>}
            </div>

            <div className="form-group-inline">
              <label htmlFor="categoria" className="form-label">Categoria</label>
              <select
                id="categoria"
                className={`form-control ${errors.categoria ? 'is-invalid' : ''}`}
                value={categoria}
                onChange={e => setCategoria(e.target.value)}
                disabled={isLoading}
              >
                <option value="">Selecione uma categoria</option>
                <option value="analgesico">Analgésico</option>
                <option value="antibiotico">Antibiótico</option>
                <option value="anti-inflamatorio">Anti-inflamatório</option>
                <option value="antialergico">Antialérgico</option>
                <option value="outro">Outro</option>
              </select>
              {errors.categoria && <div className="invalid-feedback">{errors.categoria}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group-inline">
              <label htmlFor="numeroRegistro" className="form-label">Número de Registro</label>
              <input
                type="text"
                id="numeroRegistro"
                className={`form-control ${errors.numeroRegistro ? 'is-invalid' : ''}`}
                value={numeroRegistro}
                onChange={e => setNumeroRegistro(e.target.value)}
                placeholder="Número de registro"
                disabled={isLoading}
              />
              {errors.numeroRegistro && <div className="invalid-feedback">{errors.numeroRegistro}</div>}
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

export default MedicineRegistration;
