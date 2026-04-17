# 📂 Invoice Manager - Estrutura Completa do Projeto

## 🎯 Visão Geral

```
Projeto V2/
│
├── 📖 DOCUMENTAÇÃO
│   ├── README.md ........................... Documentação principal
│   ├── QUICK_START.md ..................... Início em 5 minutos
│   ├── DEVELOPMENT.md ..................... Guia técnico detalhado
│   ├── PROJECT_SUMMARY.md ................. Resumo do projeto
│   ├── CHECKLIST.md ....................... Verificação completa
│   └── STRUCTURE.md ....................... Este arquivo
│
├── 🔧 SCRIPTS DE SETUP
│   ├── setup.bat .......................... Setup automático Windows
│   └── setup.sh ........................... Setup automático Linux/Mac
│
├── 🎨 FRONTEND (React + Vite + Tailwind)
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   │
│   └── src/
│       ├── main.jsx ........................ Entry point
│       ├── App.jsx ......................... Roteamento principal
│       ├── index.css ....................... Estilos globais
│       │
│       ├── 📄 pages/
│       │   ├── LandingPage.jsx ............ Landing page com apresentação
│       │   │                             - Hero section
│       │   │                             - Features grid
│       │   │                             - How it works
│       │   │                             - CTA buttons
│       │   │
│       │   └── Dashboard.jsx ............. Dashboard principal
│       │                                 - Roteamento interno
│       │                                 - Fetch de pastas
│       │                                 - CRUD operations
│       │
│       ├── 🧩 components/
│       │   ├── Navbar.jsx ................. Barra de navegação
│       │   │                             - Logo
│       │   │                             - Logout button
│       │   │
│       │   ├── FolderView.jsx ............ Visualização de pastas
│       │   │                             - Grid de pastas
│       │   │                             - Breadcrumb
│       │   │                             - Input criar pasta
│       │   │                             - Navegação
│       │   │
│       │   ├── InvoiceView.jsx ........... Visualização de faturas
│       │   │                             - Cards de faturas
│       │   │                             - Gerenciamento
│       │   │
│       │   ├── InvoiceCard.jsx ........... Card individual de fatura
│       │   │                             - Thumbnail
│       │   │                             - Status badge
│       │   │                             - Botões ações
│       │   │
│       │   ├── InvoiceForm.jsx ........... Formulário nova fatura
│       │   │                             - Modal
│       │   │                             - Input título
│       │   │                             - Textarea descrição
│       │   │                             - Submit/Cancel
│       │   │
│       │   └── PDFUpload.jsx ............. Upload de PDFs
│       │                                 - Drag & drop
│       │                                 - Seleção arquivo
│       │                                 - Modal senha
│       │                                 - Loading state
│       │
│       └── ⚙️ config/
│           └── api.js ..................... Endpoints e config API
│                                         - API_ENDPOINTS
│                                         - API_CONFIG
│                                         - Base URL
│
├── ⚙️ BACKEND (Node.js + Express)
│   ├── package.json ....................... Dependências Node
│   ├── server.js .......................... Servidor Express principal
│   ├── .env ............................... Variáveis ambiente
│   ├── .env.example ....................... Exemplo .env
│   ├── .gitignore ......................... Arquivos ignorar
│   │
│   ├── 📚 database.js ..................... Inicialização SQLite
│   │                                     - Conexão DB
│   │                                     - Criação tabelas
│   │                                     - Schemas
│   │
│   ├── 📄 pdfService.js ................... Processamento de PDFs
│   │                                     - mergePDFWithDescription()
│   │                                     - savePDF()
│   │                                     - extractPdfInfo()
│   │                                     - wrapText()
│   │
│   ├── 🔀 routes/
│   │   ├── folders.js ..................... API de pastas
│   │   │                                 - GET /api/folders
│   │   │                                 - POST /api/folders
│   │   │                                 - DELETE /api/folders/:id
│   │   │
│   │   └── invoices.js ................... API de faturas
│   │                                     - GET /api/invoices
│   │                                     - POST /api/invoices
│   │                                     - POST /upload-pdf
│   │                                     - GET /:id/download
│   │                                     - DELETE /:id
│   │
│   └── 📁 uploads/ ....................... Pasta para PDFs salvos
│       ├── [uuid].pdf ..................... PDFs originais
│       └── [uuid]-final.pdf .............. PDFs processados
│
└── 💾 DATABASE
    └── invoices.db ....................... SQLite database
        └── Tables:
            ├── folders ................... Hierarquia de pastas
            ├── invoices .................. Dados de faturas
            └── audit_log ................. Log de operações
```

## 📊 Detalhes dos Componentes

### Frontend Components

```
App.jsx
├── Routes
│   ├── / ...................... LandingPage
│   └── /dashboard/* ........... Dashboard
│       ├── Navbar ............. Sempre visível
│       └── Dashboard Routes
│           ├── / ............. FolderView
│           └── /invoice/:id .. InvoiceView
│
FolderView
├── Breadcrumb Navigation
├── Create Folder Input
├── Folder Grid
│   └── FolderCard (clickable)
└── Empty State

InvoiceCard
├── Thumbnail
├── Title
├── Description
├── Status Badge
└── Actions
    ├── Download
    └── Delete

InvoiceForm (Modal)
├── Title Input
├── Description Textarea
└── Submit/Cancel Buttons

PDFUpload (Modal)
├── Drag & Drop Area
├── File Select Button
├── Password Input (conditional)
└── Upload/Cancel Buttons
```

### Backend Routes

```
/health
└── GET: Health check

/api/folders
├── GET: Listar pastas (com filtro path)
├── POST: Criar nova pasta
└── /:id DELETE: Deletar pasta

/api/invoices
├── GET: Listar faturas
├── POST: Criar fatura
├── /upload-pdf POST: Upload de PDF
├── /:id/download GET: Download PDF processado
└── /:id DELETE: Deletar fatura
```

## 🗄️ Database Schema

```sql
-- Tabela: folders
folders
├── id (TEXT PRIMARY KEY)
├── name (TEXT)
├── path (TEXT UNIQUE)
├── parentPath (TEXT)
└── createdAt (TIMESTAMP)

-- Tabela: invoices
invoices
├── id (TEXT PRIMARY KEY)
├── title (TEXT)
├── description (TEXT)
├── folderId (FOREIGN KEY)
├── status (TEXT: 'draft' | 'complete')
├── pdfPath (TEXT)
├── originalPdfPath (TEXT)
├── password (TEXT)
├── createdAt (TIMESTAMP)
└── updatedAt (TIMESTAMP)

-- Tabela: audit_log
audit_log
├── id (INT PRIMARY KEY)
├── action (TEXT)
├── entityType (TEXT)
├── entityId (TEXT)
├── details (TEXT)
└── createdAt (TIMESTAMP)
```

## 🔌 API Response Examples

### Criar Pasta
```json
POST /api/folders
{
  "id": "uuid",
  "name": "Minha Pasta",
  "path": "/Minha Pasta",
  "parentPath": "/",
  "type": "folder"
}
```

### Criar Fatura
```json
POST /api/invoices
{
  "id": "uuid",
  "title": "Fatura Claro",
  "description": "Descrição...",
  "status": "draft",
  "createdAt": "2026-04-17T..."
}
```

### Upload PDF
```json
POST /api/invoices/upload-pdf
{
  "success": true,
  "message": "PDF processado com sucesso",
  "pdfInfo": {
    "pages": 6,
    "hasText": true,
    "success": true
  }
}
```

## 🎨 Styling (Tailwind Classes Principais)

```
Layout:
- flex, grid, container, max-w-*, gap-*

Colors:
- bg-blue-600, text-gray-800, border-gray-300

Interactivity:
- hover:, focus:, disabled:, transition

Responsive:
- md:, lg:, sm:

Spacing:
- p-*, m-*, pt-*, mb-*
```

## 📦 Dependências Principais

**Frontend (20+ packages):**
- react, react-dom, react-router-dom
- axios
- lucide-react
- tailwindcss, postcss, autoprefixer

**Backend (8+ packages):**
- express, cors
- better-sqlite3
- pdf-lib, pdf-parse
- multer
- dotenv
- uuid

## 🚀 Fluxo de Execução

```
1. User acessa http://localhost:5173
   ↓
2. App.jsx carrega
   ↓
3. Frontend detecta localStorage.userToken
   ↓
4. Se não existir → LandingPage
   Se existir → Dashboard
   ↓
5. Dashboard carrega FolderView
   ↓
6. Frontend faz GET /api/folders
   ↓
7. Backend conecta a SQLite
   ↓
8. Retorna pastas/faturas
   ↓
9. Frontend renderiza componentes
   ↓
10. User interage (criar, editar, upload)
    ↓
11. Frontend envia requisição
    ↓
12. Backend processa (cria pasta, faz upload, processa PDF)
    ↓
13. Salva em SQLite
    ↓
14. Retorna resposta
    ↓
15. Frontend atualiza UI
```

## ✨ Features Detalhados

**Pastas:**
- Criar ilimitadas
- Subpastas aninhadas
- Navegação breadcrumb
- Delete com cascade

**Faturas:**
- Título + descrição
- Status: draft ou complete
- Relacionadas a pastas
- Histórico automático

**PDFs:**
- Upload sem senha: adiciona descrição no final
- Upload com senha: intercala boleto > descrição
- Geração automática
- Pronto para imprimir

**Interface:**
- Drag & drop
- Modal para senha
- Loading states
- Error handling
- Responsive design

## 📈 Escalabilidade

Está pronto para:
- ✅ Adicionar autenticação JWT
- ✅ Migrar para PostgreSQL
- ✅ Containerizar com Docker
- ✅ Deploy em nuvem
- ✅ Adicionar testes

## 🎓 Arquitetura

```
MVC-like Architecture:
├── Models: database.js (schemas)
├── Views: React components
├── Controllers: route handlers
└── Services: pdfService.js

Clean Code:
✓ Modularização
✓ Separation of concerns
✓ Reusable components
✓ Error handling
✓ Input validation
```

---

**Desenvolvido com ❤️ para facilitar o gerenciamento de faturas**

**Pronto para Uso** ✅
