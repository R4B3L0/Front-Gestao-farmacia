# Projeto Combinado: Backend Java (Demo API) + Frontend React/TypeScript (MedFlow UI)

Este projeto combina o backend da API Java (originalmente do projeto `demo(2).zip`) com o frontend React/TypeScript (originalmente do projeto MedFlow).

## Estrutura

- `/backend`: Contém o código-fonte da API Java/Spring Boot (do projeto `demo`).
- `/frontend`: Contém o código-fonte do frontend React/TypeScript (medflow_source).

## Como Executar

**Pré-requisitos:**

- Java JDK (versão 21, conforme informado)
- Maven
- Node.js e npm (ou yarn)
- PostgreSQL (ou outro banco de dados configurado no `backend/src/main/resources/application.properties`)

**1. Backend (Java API):**

   - Navegue até o diretório `backend`.
   - Configure o banco de dados: Certifique-se de que um banco de dados PostgreSQL esteja rodando e atualize as credenciais e URL em `src/main/resources/application.properties` se necessário (atualmente configurado para `jdbc:postgresql://localhost:7522/postgres` com usuário `postgres` e senha `minhasenha123`).
   - Compile e execute a aplicação Spring Boot usando Maven:
     ```bash
     cd backend
     ./mvnw spring-boot:run
     ```
   - A API estará rodando, por padrão, em `http://localhost:8080`.

**2. Frontend (React/TypeScript):**

   - Navegue até o diretório `frontend`.
   - **Instale as dependências:** O conflito de dependências reportado (`ERESOLVE` entre `react-day-picker` e `date-fns`) foi corrigido ajustando a versão do `date-fns` no `package.json`. Execute:
     ```bash
     cd frontend
     npm install
     # ou: yarn install
     ```
   - Inicie o servidor de desenvolvimento:
     ```bash
     npm run dev
     # ou: yarn dev
     ```
   - O frontend estará acessível, por padrão, em `http://localhost:5173`.

## Observações e Ajustes Realizados

- **Dependências do Frontend:** O conflito com `date-fns` foi resolvido alterando sua versão para `^3.6.0` no `package.json`.
- **Integração API:**
    - A URL base da API no frontend está configurada em `frontend/src/config.ts` (atualmente `http://localhost:8080`).
    - **Cadastro de Medicamentos (`MedicineRegistration.tsx`):**
        - O formulário foi ajustado para enviar apenas os campos `nome`, `principioAtivo` e `controlado`, conforme a `MedicamentoEntity` do backend.
        - Campos extras do formulário original (descrição, dosagem, fabricante, categoria, número de registro) foram removidos da lógica de envio e do formulário visível.
        - A chamada de API foi ajustada para usar o endpoint `POST /api/medicamentos/cadastrar`.
    - **Controle de Lotes (`BatchControl.tsx`):**
        - O formulário e a listagem foram ajustados para usar os campos do `LoteDTO` do backend: `medicamentoId`, `numeroLote`, `dataValidade`, `quantidadeAtual`, `localArmazenado`.
        - Campos extras do formulário original (nome do medicamento, data de fabricação, fornecedor) foram removidos da lógica de envio e do formulário visível.
        - As chamadas de API foram ajustadas para usar os endpoints `GET /api/lotes/listar-todos`, `POST /api/lotes/cadastrar` e `DELETE /api/lotes/deletar/{id}`.
        - A formatação e comparação de datas foram ajustadas para o formato `yyyy-MM-dd`.
    - **Pesquisa de Medicamentos (`MedicineSearch.tsx`):** Esta página ainda utiliza dados simulados (`mockMedicines`). **Será necessário implementar a busca real** utilizando o endpoint `GET /api/medicamentos/listar` ou similar do backend.
    - **Login e Cadastro de Usuário/Cliente:** As páginas `Login.tsx`, `UserRegistration.tsx` e `PatientFile.tsx` (cadastro de clientes/pacientes) **não foram ajustadas** para o novo backend, pois ele não possui endpoints equivalentes para usuários ou clientes (apenas para medicamentos e lotes). Será necessário implementar esses endpoints no backend e ajustar o frontend correspondentemente.
- **CORS:** A configuração de CORS no backend (`backend/src/main/java/com/example/demo/DemoApplication.java` ou um arquivo de configuração dedicado, se existir) pode precisar ser ajustada para permitir requisições do frontend (`http://localhost:5173`). Verifique se há uma configuração `@CrossOrigin` ou `WebMvcConfigurer`.