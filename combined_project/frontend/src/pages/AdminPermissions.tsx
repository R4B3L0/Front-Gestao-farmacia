import React, { useState, useEffect } from 'react';
import { permissionApi, userApi, userPermissionApi } from '../services/api';
import { Permission, User, UserPermission } from '../types/auth';
import { useAuth } from '../context/AuthContext';

const AdminPermissions: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newPermission, setNewPermission] = useState<Partial<Permission>>({
    nome: '',
    descricao: ''
  });
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  
  const { isAdmin } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [permissionsData, usersData] = await Promise.all([
        permissionApi.getAll(),
        userApi.getAll()
      ]);
      setPermissions(permissionsData);
      setUsers(usersData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadUserPermissions = async (userId: number) => {
    try {
      setLoading(true);
      const data = await userPermissionApi.getUserPermissions(userId);
      setUserPermissions(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar permissões do usuário');
      setUserPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = parseInt(e.target.value);
    if (userId) {
      const user = users.find(u => u.id === userId) || null;
      setSelectedUser(user);
      if (user?.id) {
        await loadUserPermissions(user.id);
      }
    } else {
      setSelectedUser(null);
      setUserPermissions([]);
    }
  };

  const handlePermissionInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPermission(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await permissionApi.create(newPermission);
      setNewPermission({ nome: '', descricao: '' });
      setShowAddForm(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar permissão');
    }
  };

  const handleTogglePermission = async (permissionId: number) => {
    if (!selectedUser?.id) return;
    
    try {
      const hasPermission = userPermissions.some(p => p.id === permissionId);
      const userPermission: UserPermission = {
        usuarioId: selectedUser.id,
        permissaoId: permissionId
      };
      
      if (hasPermission) {
        await userPermissionApi.removePermission(userPermission);
      } else {
        await userPermissionApi.assignPermission(userPermission);
      }
      
      await loadUserPermissions(selectedUser.id);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar permissão');
    }
  };

  const handleDeletePermission = async (permissionId: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta permissão?')) return;
    
    try {
      await permissionApi.delete(permissionId);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir permissão');
    }
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
        <p>Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciamento de Permissões</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-bold mb-2">Permissões Disponíveis</h2>
          
          <div className="mb-4">
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {showAddForm ? 'Cancelar' : 'Adicionar Permissão'}
            </button>
          </div>
          
          {showAddForm && (
            <div className="bg-gray-100 p-4 mb-4 rounded">
              <h3 className="text-lg font-bold mb-2">Nova Permissão</h3>
              <form onSubmit={handleAddPermission}>
                <div className="mb-2">
                  <label className="block mb-1">Nome</label>
                  <input
                    type="text"
                    name="nome"
                    value={newPermission.nome}
                    onChange={handlePermissionInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block mb-1">Descrição</label>
                  <textarea
                    name="descricao"
                    value={newPermission.descricao}
                    onChange={handlePermissionInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Salvar
                </button>
              </form>
            </div>
          )}
          
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Nome</th>
                    <th className="py-2 px-4 border-b">Descrição</th>
                    <th className="py-2 px-4 border-b">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((permission) => (
                    <tr key={permission.id}>
                      <td className="py-2 px-4 border-b">{permission.nome}</td>
                      <td className="py-2 px-4 border-b">{permission.descricao}</td>
                      <td className="py-2 px-4 border-b">
                        <button
                          onClick={() => handleDeletePermission(permission.id)}
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-2">Permissões do Usuário</h2>
          
          <div className="mb-4">
            <label className="block mb-1">Selecione um usuário</label>
            <select
              onChange={handleUserChange}
              className="w-full p-2 border rounded"
              value={selectedUser?.id || ''}
            >
              <option value="">Selecione um usuário</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.username})
                </option>
              ))}
            </select>
          </div>
          
          {selectedUser && (
            <div>
              <h3 className="text-lg font-bold mb-2">
                Permissões de {selectedUser.name}
                {selectedUser.isAdmin && ' (Administrador)'}
              </h3>
              
              {selectedUser.isAdmin && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                  Este usuário é um administrador e tem acesso a todas as funcionalidades.
                </div>
              )}
              
              {loading ? (
                <p>Carregando...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b">Permissão</th>
                        <th className="py-2 px-4 border-b">Descrição</th>
                        <th className="py-2 px-4 border-b">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {permissions.map((permission) => {
                        const hasPermission = userPermissions.some(p => p.id === permission.id);
                        return (
                          <tr key={permission.id}>
                            <td className="py-2 px-4 border-b">{permission.nome}</td>
                            <td className="py-2 px-4 border-b">{permission.descricao}</td>
                            <td className="py-2 px-4 border-b">
                              <button
                                onClick={() => handleTogglePermission(permission.id)}
                                className={`font-bold py-1 px-2 rounded ${
                                  hasPermission
                                    ? 'bg-green-500 hover:bg-green-700 text-white'
                                    : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                                }`}
                              >
                                {hasPermission ? 'Concedida' : 'Não Concedida'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPermissions;

