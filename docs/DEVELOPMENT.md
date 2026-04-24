# 🚀 Guia de Desenvolvimento

## Setup Inicial

### Opção 1: Script Automático (Recomendado)

#### Windows
```bash
setup.bat
```

#### Linux/Mac
```bash
chmod +x setup.sh
./setup.sh
```

### Opção 2: Manual

```bash
# Backend
cd backend
npm install

# Frontend (em outro terminal)
cd frontend
npm install
```

## Executando o Projeto

### Terminal 1 - Backend
```bash
cd backend
npm start
```

Será exibido:
```
╔════════════════════════════════════════╗
║   Invoice Manager API                  ║
║   Rodando em: http://localhost:3001     ║
║   Banco de dados: SQLite               ║
╚════════════════════════════════════════╝
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

O Vite mostrará algo como:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

## 📝 Estrutura de Pastas

```
backend/
├── routes/
│   ├── folders.js     # CRUD de pastas
│   └── invoices.js    # CRUD de faturas + upload PDF
├── database.js        # Inicialização do SQLite
├── pdfService.js      # Serviço de manipulação de PDFs
├── server.js          # Servidor Express
├── package.json
├── .env
└── uploads/           # PDFs salvos aqui

frontend/
├── src/
│   ├── pages/
│   │   ├── LandingPage.jsx    # Home do projeto
│   │   └── Dashboard.jsx      # Interface principal
│   ├── components/
│   │   ├── Navbar.jsx         # Barra superior
│   │   ├── FolderView.jsx     # Visualizar pastas
│   │   ├── InvoiceView.jsx    # Visualizar faturas
│   │   ├── InvoiceCard.jsx    # Card de fatura
│   │   ├── InvoiceForm.jsx    # Formulário nova fatura
│   │   └── PDFUpload.jsx      # Drag & drop de PDFs
│   ├── config/
│   │   └── api.js             # Configuração da API
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
└── package.json
```

## 🔌 API Endpoints

### Saúde da API
- `GET /health` - Verifica se a API está rodando

### Pastas
- `GET /api/folders?path=/` - Lista pastas de um caminho
- `POST /api/folders` - Cria nova pasta
  ```json
  { "name": "Minha Pasta", "parentPath": "/" }
  ```
- `DELETE /api/folders/:id` - Deleta pasta

### Faturas
- `GET /api/invoices` - Lista todas as faturas
- `POST /api/invoices` - Cria nova fatura
  ```json
  {
    "title": "Fatura Claro",
    "description": "Descrição da fatura...",
    "folderId": null
  }
  ```
- `POST /api/invoices/upload-pdf` - Upload de PDF (multipart/form-data)
  ```
  - file: arquivo PDF
  - invoiceId: (opcional) ID da fatura
  - password: (opcional) senha do PDF
  ```
- `GET /api/invoices/:id/download` - Baixa o PDF processado
- `DELETE /api/invoices/:id` - Deleta fatura

## 🐛 Troubleshooting

### Erro: "Cannot find module 'better-sqlite3'"
```bash
cd backend
npm install better-sqlite3
```

### Erro: "CORS error"
- Certifique-se que o backend está rodando em `http://localhost:3001`
- Certifique-se que o frontend está em `http://localhost:5173`
- Verifique o arquivo `.env` do frontend

### Erro: "PDF upload falha"
- Verifique se a pasta `backend/uploads` existe
- Verifique as permissões de escrita na pasta

### Erro: "Banco de dados travado"
- Delete os arquivos `invoices.db*` em `backend/`
- Reinicie o servidor backend

## 📚 Tecnologias e Versões

- **Node.js**: 16+ (use `node --version`)
- **npm**: 7+ (use `npm --version`)
- **React**: 18.2.0
- **Express**: 4.18.2
- **Better-sqlite3**: 9.2.2
- **PDF-lib**: 1.17.1

## 🔒 Arquivo .env

### Backend (backend/.env)
```env
PORT=3001
NODE_ENV=development
```

### Frontend (frontend/.env)
```env
VITE_API_URL=http://localhost:3001/api
```

## 📊 Fluxo de Dados

```
Frontend (React)
    ↓
Axios Request
    ↓
Express Backend
    ↓
SQLite Database
    ↓
PDF Processing (pdf-lib)
    ↓
Return Response
    ↓
Frontend Display
```

## 🎯 Exemplos de Uso

### Criar uma Fatura
1. Clique em "Nova Fatura"
2. Preencha título: "Fatura Claro"
3. Preencha descrição: "Claro - Telefone - Março/2026"
4. Clique em "Criar"

### Importar PDF
1. Clique em "Importar PDF"
2. Arraste o PDF ou selecione do computador
3. Se tiver senha, insira na janela de diálogo
4. O sistema processará e gerará novo PDF

### Baixar PDF Processado
1. Clique no botão "Baixar" da fatura
2. O PDF será salvo com o título como nome do arquivo

## 📈 Desenvolvimento Futuro

- [ ] Autenticação com JWT
- [ ] Banco de dados em produção (PostgreSQL)
- [ ] Testes automatizados
- [ ] Docker setup
- [ ] CI/CD pipeline
- [ ] Compressão de PDFs
- [ ] Preview de PDFs inline

## 🆘 Suporte

Para debugar, abra o console do navegador (F12) e verifique:
1. Network tab - veja as requisições à API
2. Console - procure por erros
3. Terminal do backend - veja logs do servidor

---

**Desenvolvido com ❤️ para facilitar o gerenciamento de faturas**
