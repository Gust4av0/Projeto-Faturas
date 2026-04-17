# 📄 Invoice Manager - Gestão Inteligente de Faturas

Um sistema completo e intuitivo para organizar, gerenciar e processar faturas (boletos/notas) com geração automática de PDFs personalizados.

## ✨ Funcionalidades Principais

### 📁 Organização de Faturas
- Criar e gerenciar pastas e subpastas ilimitadas
- Organizar faturas por categoria
- Interface intuitiva e responsiva

### 📝 Cadastro de Faturas
- Título e descrição customizáveis
- Status de rascunho/completo
- Histórico de alterações

### 📤 Upload e Importação de PDFs
- Arrastar e soltar PDFs
- Importação via botão
- Suporte a PDFs protegidos com senha

### 🔒 Processamento de PDFs com Senha
- Detecta automaticamente PDFs protegidos
- Modal para inserção de senha
- Intercala páginas com descrição (Boleto > Descrição > Boleto > Descrição, etc)

### 📥 Geração Automática de PDFs
- Mescla PDF original com descrição cadastrada
- PDFs sem senha: adiciona descrição no final
- PDFs com senha: intercala descrição entre páginas
- Pronto para impressão

### 💾 Banco de Dados Persistente
- SQLite integrado
- Sem dependências externas
- Dados salvos localmente

## 🚀 Como Começar

### Pré-requisitos
- Node.js 16+ instalado
- npm ou yarn

### Instalação

#### 1. Clonar o repositório
```bash
git clone <seu-repo>
cd Projeto\ V2
```

#### 2. Instalar dependências do Frontend
```bash
cd frontend
npm install
```

#### 3. Instalar dependências do Backend
```bash
cd ../backend
npm install
```

## 📚 Como Executar

### Terminal 1 - Backend (API)
```bash
cd backend
npm start
```
A API rodará em: `http://localhost:3001`

### Terminal 2 - Frontend (Interface)
```bash
cd frontend
npm run dev
```
O frontend estará disponível em: `http://localhost:5173`

## 🎯 Fluxo de Uso

### 1. Página Inicial (Landing Page)
- Apresenta a visão geral do projeto
- Clique em "Começar" para acessar o dashboard

### 2. Dashboard
- **Criar Pasta**: Organize suas faturas em categorias
- **Navegar**: Clique nas pastas para entrar/sair
- **Gerenciar**: Dentro de uma pasta, crie faturas

### 3. Cadastrar Fatura
- Clique em "Nova Fatura"
- Preencha título e descrição
- Clique em "Criar"

### 4. Importar PDF
- Clique em "Importar PDF"
- Arraste o PDF ou selecione do computador
- Se tiver senha, o sistema pedirá automaticamente
- O PDF será processado com a descrição

### 5. Baixar PDF Processado
- Na card da fatura, clique em "Baixar"
- O PDF estará pronto para impressão com a descrição

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Interface dinâmica
- **Vite** - Build rápido e hot reload
- **Tailwind CSS** - Estilização moderna
- **Axios** - Requisições HTTP
- **Lucide React** - Ícones

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Better-sqlite3** - Banco de dados
- **PDF-lib** - Manipulação de PDFs
- **Multer** - Upload de arquivos
- **CORS** - Segurança

## 📁 Estrutura do Projeto

```
Projeto V2/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── FolderView.jsx
│   │   │   ├── InvoiceView.jsx
│   │   │   ├── InvoiceCard.jsx
│   │   │   ├── InvoiceForm.jsx
│   │   │   └── PDFUpload.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── backend/
│   ├── routes/
│   │   ├── folders.js
│   │   └── invoices.js
│   ├── database.js
│   ├── pdfService.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── README.md
```

## 🔌 API Endpoints

### Pastas
- `GET /api/folders` - Listar pastas
- `POST /api/folders` - Criar nova pasta
- `DELETE /api/folders/:id` - Deletar pasta

### Faturas
- `GET /api/invoices` - Listar faturas
- `POST /api/invoices` - Criar fatura
- `POST /api/invoices/upload-pdf` - Upload de PDF
- `GET /api/invoices/:id/download` - Baixar PDF
- `DELETE /api/invoices/:id` - Deletar fatura

## 🎨 Design

O sistema foi desenvolvido com foco em:
- **Usabilidade**: Interface intuitiva e responsiva
- **Estética**: Design moderno com Tailwind CSS
- **Performance**: Vite para build rápido
- **Segurança**: Validação no frontend e backend

## 🔐 Segurança

- ✅ Validação de entrada
- ✅ CORS configurado
- ✅ Upload seguro de arquivos
- ✅ Proteção contra SQL injection (Prepared Statements)

## 📝 Licença

Este projeto é fornecido como está, para fins educacionais e comerciais.

## 📞 Suporte

Para dúvidas ou problemas, verifique:
1. Se o backend está rodando em `localhost:3001`
2. Se o frontend está rodando em `localhost:5173`
3. Verifique o console do navegador para erros
4. Verifique o terminal do backend para logs

## 🚀 Melhorias Futuras

- [ ] Autenticação de usuários
- [ ] Compartilhamento de pastas
- [ ] Busca e filtros avançados
- [ ] Previewde PDFs inline
- [ ] Exportação em lote
- [ ] Integração com serviços de armazenamento
- [ ] Mobile app

---

**Desenvolvido com ❤️ para facilitar o gerenciamento de faturas**
