import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface EstoqueItem {
  id: string;
  medicamentoId: string;
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
  id: string;
  medicamentoId: string;
  medicamentoNome: string;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  responsavel: string;
  data: string;
  observacao: string;
}

const ControleEstoque: React.FC = () => {
  const navigate = useNavigate();
  const [medicamentoNome, setMedicamentoNome] = useState<string>('');
  const [quantidadeTotal, setQuantidadeTotal] = useState<string>('');
  const [quantidadeDisponivel, setQuantidadeDisponivel] = useState<string>('');
  const [estoqueMinimo, setEstoqueMinimo] = useState<string>('');
  const [estoqueMaximo, setEstoqueMaximo] = useState<string>('');
  const [localizacao, setLocalizacao] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [estoque, setEstoque] = useState<EstoqueItem[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [showMovimentacaoForm, setShowMovimentacaoForm] = useState<boolean>(false);
  const [tipoMovimentacao, setTipoMovimentacao] = useState<'entrada' | 'saida'>('entrada');
  const [quantidadeMovimentacao, setQuantidadeMovimentacao] = useState<string>('');
  const [responsavel, setResponsavel] = useState<string>('');
  const [observacao, setObservacao] = useState<string>('');
  const [medicamentoSelecionadoId, setMedicamentoSelecionadoId] = useState<string>('');
  const [medicamentoSelecionadoNome, setMedicamentoSelecionadoNome] = useState<string>('');
  const [sortField, setSortField] = useState<string>('medicamentoNome');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [alertaEstoqueBaixo, setAlertaEstoqueBaixo] = useState<boolean>(false);

  // Dados de exemplo para simulação
  useEffect(() => {
    setEstoque([
      {
        id: '1',
        medicamentoId: '1',
        medicamentoNome: 'Dipirona 500mg',
        quantidadeTotal: 1000,
        quantidadeDisponivel: 850,
        quantidadeReservada: 150,
        estoqueMinimo: 200,
        estoqueMaximo: 1500,
        localizacao: 'Prateleira A1',
        ultimaAtualizacao: '2025-05-15'
      },
      {
        id: '2',
        medicamentoId: '2',
        medicamentoNome: 'Amoxicilina 250mg',
        quantidadeTotal: 500,
        quantidadeDisponivel: 120,
        quantidadeReservada: 80,
        estoqueMinimo: 150,
        estoqueMaximo: 800,
        localizacao: 'Prateleira B3',
        ultimaAtualizacao: '2025-05-10'
      },
      {
        id: '3',
        medicamentoId: '3',
        medicamentoNome: 'Paracetamol 750mg',
        quantidadeTotal: 1200,
        quantidadeDisponivel: 1000,
        quantidadeReservada: 200,
        estoqueMinimo: 300,
        estoqueMaximo: 1500,
        localizacao: 'Prateleira A2',
        ultimaAtualizacao: '2025-05-18'
      },
      {
        id: '4',
        medicamentoId: '4',
        medicamentoNome: 'Ibuprofeno 600mg',
        quantidadeTotal: 300,
        quantidadeDisponivel: 50,
        quantidadeReservada: 50,
        estoqueMinimo: 100,
        estoqueMaximo: 600,
        localizacao: 'Prateleira C1',
        ultimaAtualizacao: '2025-05-05'
      },
      {
        id: '5',
        medicamentoId: '5',
        medicamentoNome: 'Loratadina 10mg',
        quantidadeTotal: 800,
        quantidadeDisponivel: 700,
        quantidadeReservada: 100,
        estoqueMinimo: 200,
        estoqueMaximo: 1000,
        localizacao: 'Prateleira D2',
        ultimaAtualizacao: '2025-05-12'
      }
    ]);

    setMovimentacoes([
      {
        id: '1',
        medicamentoId: '1',
        medicamentoNome: 'Dipirona 500mg',
        tipo: 'entrada',
        quantidade: 500,
        responsavel: 'João Silva',
        data: '2025-05-15',
        observacao: 'Recebimento de fornecedor'
      },
      {
        id: '2',
        medicamentoId: '1',
        medicamentoNome: 'Dipirona 500mg',
        tipo: 'saida',
        quantidade: 150,
        responsavel: 'Maria Oliveira',
        data: '2025-05-16',
        observacao: 'Dispensação para paciente'
      },
      {
        id: '3',
        medicamentoId: '2',
        medicamentoNome: 'Amoxicilina 250mg',
        tipo: 'entrada',
        quantidade: 300,
        responsavel: 'João Silva',
        data: '2025-05-10',
        observacao: 'Recebimento de fornecedor'
      },
      {
        id: '4',
        medicamentoId: '2',
        medicamentoNome: 'Amoxicilina 250mg',
        tipo: 'saida',
        quantidade: 80,
        responsavel: 'Carlos Santos',
        data: '2025-05-12',
        observacao: 'Dispensação para paciente'
      }
    ]);
  }, []);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!medicamentoNome.trim()) newErrors.medicamentoNome = 'Nome do medicamento é obrigatório';
    
    if (!quantidadeTotal.trim()) {
      newErrors.quantidadeTotal = 'Quantidade total é obrigatória';
    } else if (isNaN(Number(quantidadeTotal)) || Number(quantidadeTotal) < 0) {
      newErrors.quantidadeTotal = 'Quantidade total deve ser um número positivo';
    }
    
    if (!quantidadeDisponivel.trim()) {
      newErrors.quantidadeDisponivel = 'Quantidade disponível é obrigatória';
    } else if (isNaN(Number(quantidadeDisponivel)) || Number(quantidadeDisponivel) < 0) {
      newErrors.quantidadeDisponivel = 'Quantidade disponível deve ser um número positivo';
    } else if (Number(quantidadeDisponivel) > Number(quantidadeTotal)) {
      newErrors.quantidadeDisponivel = 'Quantidade disponível não pode ser maior que a quantidade total';
    }
    
    if (!estoqueMinimo.trim()) {
      newErrors.estoqueMinimo = 'Estoque mínimo é obrigatório';
    } else if (isNaN(Number(estoqueMinimo)) || Number(estoqueMinimo) < 0) {
      newErrors.estoqueMinimo = 'Estoque mínimo deve ser um número positivo';
    }
    
    if (!estoqueMaximo.trim()) {
      newErrors.estoqueMaximo = 'Estoque máximo é obrigatório';
    } else if (isNaN(Number(estoqueMaximo)) || Number(estoqueMaximo) < 0) {
      newErrors.estoqueMaximo = 'Estoque máximo deve ser um número positivo';
    } else if (Number(estoqueMaximo) < Number(estoqueMinimo)) {
      newErrors.estoqueMaximo = 'Estoque máximo deve ser maior que o estoque mínimo';
    }
    
    if (!localizacao.trim()) newErrors.localizacao = 'Localização é obrigatória';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateMovimentacaoForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!medicamentoSelecionadoId) newErrors.medicamentoSelecionadoId = 'Selecione um medicamento';
    
    if (!quantidadeMovimentacao.trim()) {
      newErrors.quantidadeMovimentacao = 'Quantidade é obrigatória';
    } else if (isNaN(Number(quantidadeMovimentacao)) || Number(quantidadeMovimentacao) <= 0) {
      newErrors.quantidadeMovimentacao = 'Quantidade deve ser um número positivo';
    }
    
    if (!responsavel.trim()) newErrors.responsavel = 'Responsável é obrigatório';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulando uma chamada de API com delay
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Em um cenário real, aqui seria feito o cadastro com o backend
      const novoItem: EstoqueItem = {
        id: Date.now().toString(),
        medicamentoId: Date.now().toString(),
        medicamentoNome,
        quantidadeTotal: Number(quantidadeTotal),
        quantidadeDisponivel: Number(quantidadeDisponivel),
        quantidadeReservada: Number(quantidadeTotal) - Number(quantidadeDisponivel),
        estoqueMinimo: Number(estoqueMinimo),
        estoqueMaximo: Number(estoqueMaximo),
        localizacao,
        ultimaAtualizacao: new Date().toISOString().split('T')[0]
      };
      
      setEstoque([...estoque, novoItem]);
      setIsSaved(true);
      
      // Limpar formulário
      setMedicamentoNome('');
      setQuantidadeTotal('');
      setQuantidadeDisponivel('');
      setEstoqueMinimo('');
      setEstoqueMaximo('');
      setLocalizacao('');
      
      // Mostrar mensagem de sucesso por 3 segundos
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    } catch (err) {
      setErrors({ form: 'Ocorreu um erro ao cadastrar o item no estoque. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMovimentacaoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateMovimentacaoForm()) return;
    
    setIsLoading(true);
    
    // Simulando uma chamada de API com delay
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Em um cenário real, aqui seria feito o registro com o backend
      const novaMovimentacao: MovimentacaoEstoque = {
        id: Date.now().toString(),
        medicamentoId: medicamentoSelecionadoId,
        medicamentoNome: medicamentoSelecionadoNome,
        tipo: tipoMovimentacao,
        quantidade: Number(quantidadeMovimentacao),
        responsavel,
        data: new Date().toISOString().split('T')[0],
        observacao
      };
      
      setMovimentacoes([novaMovimentacao, ...movimentacoes]);
      
      // Atualizar estoque
      const estoqueAtualizado = estoque.map(item => {
        if (item.id === medicamentoSelecionadoId) {
          const novaQuantidadeDisponivel = tipoMovimentacao === 'entrada' 
            ? item.quantidadeDisponivel + Number(quantidadeMovimentacao)
            : item.quantidadeDisponivel - Number(quantidadeMovimentacao);
          
          const novaQuantidadeTotal = tipoMovimentacao === 'entrada'
            ? item.quantidadeTotal + Number(quantidadeMovimentacao)
            : item.quantidadeTotal - Number(quantidadeMovimentacao);
          
          return {
            ...item,
            quantidadeDisponivel: novaQuantidadeDisponivel,
            quantidadeTotal: novaQuantidadeTotal,
            ultimaAtualizacao: new Date().toISOString().split('T')[0]
          };
        }
        return item;
      });
      
      setEstoque(estoqueAtualizado);
      
      // Limpar formulário e fechar
      setQuantidadeMovimentacao('');
      setResponsavel('');
      setObservacao('');
      setShowMovimentacaoForm(false);
      
      setIsSaved(true);
      
      // Mostrar mensagem de sucesso por 3 segundos
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    } catch (err) {
      setErrors({ form: 'Ocorreu um erro ao registrar a movimentação. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenMovimentacao = (id: string, nome: string, tipo: 'entrada' | 'saida') => {
    setMedicamentoSelecionadoId(id);
    setMedicamentoSelecionadoNome(nome);
    setTipoMovimentacao(tipo);
    setShowMovimentacaoForm(true);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedEstoque = () => {
    let filtered = [...estoque];
    
    // Filtrar por termo de busca
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(item => 
        item.medicamentoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.localizacao.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por alerta de estoque baixo
    if (alertaEstoqueBaixo) {
      filtered = filtered.filter(item => item.quantidadeDisponivel <= item.estoqueMinimo);
    }
    
    // Ordenar estoque
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'medicamentoNome':
          comparison = a.medicamentoNome.localeCompare(b.medicamentoNome);
          break;
        case 'quantidadeTotal':
          comparison = a.quantidadeTotal - b.quantidadeTotal;
          break;
        case 'quantidadeDisponivel':
          comparison = a.quantidadeDisponivel - b.quantidadeDisponivel;
          break;
        case 'estoqueMinimo':
          comparison = a.estoqueMinimo - b.estoqueMinimo;
          break;
        case 'localizacao':
          comparison = a.localizacao.localeCompare(b.localizacao);
          break;
        case 'ultimaAtualizacao':
          comparison = new Date(a.ultimaAtualizacao).getTime() - new Date(b.ultimaAtualizacao).getTime();
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const getFilteredMovimentacoes = () => {
    let filtered = [...movimentacoes];
    
    // Filtrar por tipo
    if (filtroTipo !== 'todos') {
      filtered = filtered.filter(mov => mov.tipo === filtroTipo);
    }
    
    // Filtrar por termo de busca
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(mov => 
        mov.medicamentoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mov.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mov.observacao.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const isEstoqueBaixo = (item: EstoqueItem): boolean => {
    return item.quantidadeDisponivel <= item.estoqueMinimo;
  };

  return (
    <div className="form-window card animate-fade-in">
      <div className="card-header">
        <h2 className="card-title">Controle de Estoque</h2>
        <div className="window-controls">
          <span>_</span>
          <span>□</span>
          <span>×</span>
        </div>
      </div>
      
      <div className="card-body">
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 3H4C2.89543 3 2 3.89543 2 5V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V5C22 3.89543 21.1046 3 20 3Z" stroke="var(--primary)" strokeWidth="1.5" />
              <path d="M16 8V16M12 11V16M8 14V16" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
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
            Operação realizada com sucesso!
          </div>
        )}
        
        <div className="tabs mb-6">
          <div className="tab-list flex border-b border-gray-200">
            <button 
              className={`tab-item px-4 py-2 font-medium ${!showMovimentacaoForm ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
              onClick={() => setShowMovimentacaoForm(false)}
            >
              Cadastro de Item
            </button>
            <button 
              className={`tab-item px-4 py-2 font-medium ${showMovimentacaoForm ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
              onClick={() => setShowMovimentacaoForm(true)}
            >
              Movimentação de Estoque
            </button>
          </div>
        </div>
        
        {!showMovimentacaoForm ? (
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group-full">
                <label htmlFor="medicamentoNome" className="form-label">Nome do Medicamento</label>
                <input 
                  type="text" 
                  id="medicamentoNome" 
                  className={`form-control ${errors.medicamentoNome ? 'is-invalid' : ''}`}
                  value={medicamentoNome}
                  onChange={(e) => setMedicamentoNome(e.target.value)}
                  placeholder="Digite o nome do medicamento"
                  disabled={isLoading}
                />
                {errors.medicamentoNome && <div className="invalid-feedback">{errors.medicamentoNome}</div>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group-inline">
                <label htmlFor="quantidadeTotal" className="form-label">Quantidade Total</label>
                <input 
                  type="number" 
                  id="quantidadeTotal" 
                  className={`form-control ${errors.quantidadeTotal ? 'is-invalid' : ''}`}
                  value={quantidadeTotal}
                  onChange={(e) => setQuantidadeTotal(e.target.value)}
                  placeholder="Quantidade total"
                  min="0"
                  disabled={isLoading}
                />
                {errors.quantidadeTotal && <div className="invalid-feedback">{errors.quantidadeTotal}</div>}
              </div>
              
              <div className="form-group-inline">
                <label htmlFor="quantidadeDisponivel" className="form-label">Quantidade Disponível</label>
                <input 
                  type="number" 
                  id="quantidadeDisponivel" 
                  className={`form-control ${errors.quantidadeDisponivel ? 'is-invalid' : ''}`}
                  value={quantidadeDisponivel}
                  onChange={(e) => setQuantidadeDisponivel(e.target.value)}
                  placeholder="Quantidade disponível"
                  min="0"
                  disabled={isLoading}
                />
                {errors.quantidadeDisponivel && <div className="invalid-feedback">{errors.quantidadeDisponivel}</div>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group-inline">
                <label htmlFor="estoqueMinimo" className="form-label">Estoque Mínimo</label>
                <input 
                  type="number" 
                  id="estoqueMinimo" 
                  className={`form-control ${errors.estoqueMinimo ? 'is-invalid' : ''}`}
                  value={estoqueMinimo}
                  onChange={(e) => setEstoqueMinimo(e.target.value)}
                  placeholder="Estoque mínimo"
                  min="0"
                  disabled={isLoading}
                />
                {errors.estoqueMinimo && <div className="invalid-feedback">{errors.estoqueMinimo}</div>}
              </div>
              
              <div className="form-group-inline">
                <label htmlFor="estoqueMaximo" className="form-label">Estoque Máximo</label>
                <input 
                  type="number" 
                  id="estoqueMaximo" 
                  className={`form-control ${errors.estoqueMaximo ? 'is-invalid' : ''}`}
                  value={estoqueMaximo}
                  onChange={(e) => setEstoqueMaximo(e.target.value)}
                  placeholder="Estoque máximo"
                  min="0"
                  disabled={isLoading}
                />
                {errors.estoqueMaximo && <div className="invalid-feedback">{errors.estoqueMaximo}</div>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group-full">
                <label htmlFor="localizacao" className="form-label">Localização</label>
                <input 
                  type="text" 
                  id="localizacao" 
                  className={`form-control ${errors.localizacao ? 'is-invalid' : ''}`}
                  value={localizacao}
                  onChange={(e) => setLocalizacao(e.target.value)}
                  placeholder="Ex: Prateleira A1, Gaveta B2, etc."
                  disabled={isLoading}
                />
                {errors.localizacao && <div className="invalid-feedback">{errors.localizacao}</div>}
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
        ) : (
          <form onSubmit={handleMovimentacaoSubmit}>
            <div className="form-row">
              <div className="form-group-full">
                <label htmlFor="medicamentoSelecionado" className="form-label">Medicamento</label>
                {medicamentoSelecionadoId ? (
                  <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{medicamentoSelecionadoNome}</span>
                      <button 
                        type="button" 
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => {
                          setMedicamentoSelecionadoId('');
                          setMedicamentoSelecionadoNome('');
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <select 
                    id="medicamentoSelecionado" 
                    className={`form-control ${errors.medicamentoSelecionadoId ? 'is-invalid' : ''}`}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const selectedItem = estoque.find(item => item.id === selectedId);
                      if (selectedItem) {
                        setMedicamentoSelecionadoId(selectedId);
                        setMedicamentoSelecionadoNome(selectedItem.medicamentoNome);
                      }
                    }}
                    value={medicamentoSelecionadoId}
                    disabled={isLoading}
                  >
                    <option value="">Selecione um medicamento</option>
                    {estoque.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.medicamentoNome} - Disponível: {item.quantidadeDisponivel}
                      </option>
                    ))}
                  </select>
                )}
                {errors.medicamentoSelecionadoId && <div className="invalid-feedback">{errors.medicamentoSelecionadoId}</div>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group-inline">
                <label htmlFor="tipoMovimentacao" className="form-label">Tipo de Movimentação</label>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="tipoEntrada" 
                      name="tipoMovimentacao"
                      checked={tipoMovimentacao === 'entrada'}
                      onChange={() => setTipoMovimentacao('entrada')}
                      className="mr-2"
                      disabled={isLoading}
                    />
                    <label htmlFor="tipoEntrada">Entrada</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="tipoSaida" 
                      name="tipoMovimentacao"
                      checked={tipoMovimentacao === 'saida'}
                      onChange={() => setTipoMovimentacao('saida')}
                      className="mr-2"
                      disabled={isLoading}
                    />
                    <label htmlFor="tipoSaida">Saída</label>
                  </div>
                </div>
              </div>
              
              <div className="form-group-inline">
                <label htmlFor="quantidadeMovimentacao" className="form-label">Quantidade</label>
                <input 
                  type="number" 
                  id="quantidadeMovimentacao" 
                  className={`form-control ${errors.quantidadeMovimentacao ? 'is-invalid' : ''}`}
                  value={quantidadeMovimentacao}
                  onChange={(e) => setQuantidadeMovimentacao(e.target.value)}
                  placeholder="Quantidade"
                  min="1"
                  disabled={isLoading}
                />
                {errors.quantidadeMovimentacao && <div className="invalid-feedback">{errors.quantidadeMovimentacao}</div>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group-full">
                <label htmlFor="responsavel" className="form-label">Responsável</label>
                <input 
                  type="text" 
                  id="responsavel" 
                  className={`form-control ${errors.responsavel ? 'is-invalid' : ''}`}
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  placeholder="Nome do responsável"
                  disabled={isLoading}
                />
                {errors.responsavel && <div className="invalid-feedback">{errors.responsavel}</div>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group-full">
                <label htmlFor="observacao" className="form-label">Observação</label>
                <textarea 
                  id="observacao" 
                  className="form-control"
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Observações sobre a movimentação"
                  rows={3}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={() => setShowMovimentacaoForm(false)}
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading || !medicamentoSelecionadoId}
              >
                {isLoading ? (
                  <>
                    <span className="loader loader-sm mr-2"></span>
                    Registrando...
                  </>
                ) : 'Registrar Movimentação'}
              </button>
            </div>
          </form>
        )}
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="tabs mb-4">
            <div className="tab-list flex border-b border-gray-200">
              <button 
                className={`tab-item px-4 py-2 font-medium ${!showMovimentacaoForm ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
                onClick={() => setShowMovimentacaoForm(false)}
              >
                Itens em Estoque
              </button>
              <button 
                className={`tab-item px-4 py-2 font-medium ${showMovimentacaoForm ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
                onClick={() => setShowMovimentacaoForm(true)}
              >
                Histórico de Movimentações
              </button>
            </div>
          </div>
          
          <div className="mb-4 flex flex-wrap gap-4 items-center">
            <div className="flex-grow">
              <input 
                type="text" 
                placeholder="Pesquisar..."
                className="form-control"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {!showMovimentacaoForm && (
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="alertaEstoqueBaixo" 
                  checked={alertaEstoqueBaixo}
                  onChange={(e) => setAlertaEstoqueBaixo(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="alertaEstoqueBaixo" className="text-sm">Mostrar apenas estoque baixo</label>
              </div>
            )}
            
            {showMovimentacaoForm && (
              <div>
                <select 
                  className="form-control"
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <option value="todos">Todos os tipos</option>
                  <option value="entrada">Apenas entradas</option>
                  <option value="saida">Apenas saídas</option>
                </select>
              </div>
            )}
          </div>
          
          {!showMovimentacaoForm ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th 
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('medicamentoNome')}
                    >
                      <div className="flex items-center">
                        Medicamento
                        {sortField === 'medicamentoNome' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('quantidadeTotal')}
                    >
                      <div className="flex items-center">
                        Total
                        {sortField === 'quantidadeTotal' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('quantidadeDisponivel')}
                    >
                      <div className="flex items-center">
                        Disponível
                        {sortField === 'quantidadeDisponivel' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th>Reservado</th>
                    <th 
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('estoqueMinimo')}
                    >
                      <div className="flex items-center">
                        Mínimo
                        {sortField === 'estoqueMinimo' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('localizacao')}
                    >
                      <div className="flex items-center">
                        Localização
                        {sortField === 'localizacao' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {getSortedEstoque().map(item => (
                    <tr key={item.id} className={isEstoqueBaixo(item) ? 'bg-red-50' : ''}>
                      <td>{item.medicamentoNome}</td>
                      <td>{item.quantidadeTotal}</td>
                      <td>
                        <div className="flex items-center">
                          {item.quantidadeDisponivel}
                          {isEstoqueBaixo(item) && (
                            <span className="ml-2 badge badge-danger">Baixo</span>
                          )}
                        </div>
                      </td>
                      <td>{item.quantidadeReservada}</td>
                      <td>{item.estoqueMinimo}</td>
                      <td>{item.localizacao}</td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            className="btn btn-outline btn-sm"
                            onClick={() => handleOpenMovimentacao(item.id, item.medicamentoNome, 'entrada')}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Entrada
                          </button>
                          <button 
                            className="btn btn-outline btn-sm"
                            onClick={() => handleOpenMovimentacao(item.id, item.medicamentoNome, 'saida')}
                            disabled={item.quantidadeDisponivel <= 0}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Saída
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Medicamento</th>
                    <th>Tipo</th>
                    <th>Quantidade</th>
                    <th>Responsável</th>
                    <th>Observação</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredMovimentacoes().map(mov => (
                    <tr key={mov.id}>
                      <td>{new Date(mov.data).toLocaleDateString('pt-BR')}</td>
                      <td>{mov.medicamentoNome}</td>
                      <td>
                        <span className={`badge ${mov.tipo === 'entrada' ? 'badge-success' : 'badge-danger'}`}>
                          {mov.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td>{mov.quantidade}</td>
                      <td>{mov.responsavel}</td>
                      <td>{mov.observacao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ControleEstoque;
