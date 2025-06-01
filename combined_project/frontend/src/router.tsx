import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import UserRegistration from './pages/UserRegistration';
import Dashboard from './pages/Dashboard';
import PatientRegistration from './pages/PatientRegistration';
import PatientFile from './pages/PatientFile';
import MedicineRegistration from './pages/MedicineRegistration';
import MedicineSearch from './pages/MedicineSearch';
import BatchControl from './pages/BatchControl';
import StockControl from './pages/StockControl';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<UserRegistration />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="cadastro-paciente" element={<PatientRegistration />} />
          <Route path="ficha-paciente/:id?" element={<PatientFile />} />
          <Route path="cadastro-medicamento" element={<MedicineRegistration />} />
          <Route path="pesquisa-medicamento" element={<MedicineSearch />} />
          <Route path="controle-lote" element={<BatchControl />} />
          <Route path="controle-estoque" element={<StockControl />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
