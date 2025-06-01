// Definição de tipos para o sistema MedFlow

// Tipo para usuário
export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'Administrador' | 'Doutor' | 'Enfermeira' | 'Farmacêutico';
  createdAt: Date;
}

// Tipo para paciente
export interface Patient {
  id: string;
  cpf: string;
  rg: string;
  dateOfBirth: Date;
  registrationDate: Date;
  address: string;
  cep: string;
  description: string;
  fileNumber: string;
}

// Tipo para medicamento
export interface Medicine {
  id: string;
  name: string;
  description: string;
  dosage: string;
  manufacturer: string;
  category: string;
  registrationNumber: string;
  active: boolean;
}

// Tipo para lote de medicamento
export interface Batch {
  id: string;
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  quantity: number;
  manufacturingDate: Date;
  expirationDate: Date;
  supplier: string;
  notes: string;
}
