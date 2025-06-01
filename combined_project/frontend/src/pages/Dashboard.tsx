import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const userName = localStorage.getItem('userName') || 'Usuário';
  
  return (
    <div className="dashboard-welcome animate-fade-in">
      <div className="welcome-card">
        <h1 className="text-2xl font-bold mb-4">Bem-vindo ao MedFLOW, {userName}!</h1>
        <p className="text-gray-600 mb-6">
          Sistema de gestão médica e farmacêutica. Acesse as principais funcionalidades abaixo ou utilize o menu lateral.
        </p>
        
        <div className="dashboard-shortcuts">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/cadastro-medicamento" className="shortcut-card animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V16M8 12H16" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#2563EB" strokeWidth="2"/>
                  </svg>
                </div>
                <h3 className="font-medium mb-1">Cadastro de Medicamento</h3>
                <p className="text-sm text-gray-500">Registre novos medicamentos no sistema</p>
              </div>
            </Link>
            
            <Link to="/cadastro-paciente" className="shortcut-card animate-slide-up" style={{animationDelay: '0.2s'}}>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="#2563EB" strokeWidth="2"/>
                    <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" stroke="#2563EB" strokeWidth="2"/>
                  </svg>
                </div>
                <h3 className="font-medium mb-1">Cadastro de Paciente</h3>
                <p className="text-sm text-gray-500">Registre informações de pacientes</p>
              </div>
            </Link>
            
            <Link to="/pesquisa-medicamento" className="shortcut-card animate-slide-up" style={{animationDelay: '0.3s'}}>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="font-medium mb-1">Pesquisa de Medicamento</h3>
                <p className="text-sm text-gray-500">Busque medicamentos cadastrados</p>
              </div>
            </Link>
            
            <Link to="/controle-estoque" className="shortcut-card animate-slide-up" style={{animationDelay: '0.4s'}}>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 3H4C2.89543 3 2 3.89543 2 5V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V5C22 3.89543 21.1046 3 20 3Z" stroke="#2563EB" strokeWidth="2"/>
                    <path d="M16 8V16M12 11V16M8 14V16" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 className="font-medium mb-1">Controle de Estoque</h3>
                <p className="text-sm text-gray-500">Gerencie o estoque de medicamentos</p>
              </div>
            </Link>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-medium mb-4">Atividades Recentes</h2>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8V16M8 12H16" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="font-medium">Medicamento cadastrado</p>
                <p className="text-sm text-gray-500">Paracetamol 500mg foi adicionado ao sistema</p>
                <p className="text-xs text-gray-400 mt-1">Hoje, 14:32</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="#2563EB" strokeWidth="2"/>
                  <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" stroke="#2563EB" strokeWidth="2"/>
                </svg>
              </div>
              <div>
                <p className="font-medium">Paciente cadastrado</p>
                <p className="text-sm text-gray-500">Carlos Almeida foi adicionado ao sistema</p>
                <p className="text-xs text-gray-400 mt-1">Hoje, 11:15</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 3H4C2.89543 3 2 3.89543 2 5V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V5C22 3.89543 21.1046 3 20 3Z" stroke="#2563EB" strokeWidth="2"/>
                  <path d="M16 8V16M12 11V16M8 14V16" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="font-medium">Estoque atualizado</p>
                <p className="text-sm text-gray-500">Entrada de 500 unidades de Dipirona 500mg</p>
                <p className="text-xs text-gray-400 mt-1">Ontem, 16:45</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
