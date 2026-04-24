# ⚡ Quick Start - Invoice Manager

## 🎯 Comece em 5 minutos!

### Pré-requisitos
- Node.js 16+ instalado
- npm atualizado

### Passo 1️⃣ - Clonar/Abrir o Projeto
```bash
cd "Projeto V2"
```

### Passo 2️⃣ - Setup Automático
**Windows:**
```bash
setup.bat
```

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

### Passo 3️⃣ - Abrir 2 Terminais

**Terminal 1 (Backend):**
```bash
cd backend
npm start
```

Você verá:
```
╔════════════════════════════════════════╗
║   Invoice Manager API                  ║
║   Rodando em: http://localhost:3001     ║
║   Banco de dados: SQLite               ║
╚════════════════════════════════════════╝
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Você verá:
```
➜  Local:   http://localhost:5173/
```

### Passo 4️⃣ - Acessar no Navegador
Abra: **http://localhost:5173**

### Passo 5️⃣ - Começar a Usar!

1. Clique em "**Começar**" na landing page
2. Clique em "**Nova Pasta**" para criar uma categoria
3. Dentro da pasta, clique "**Nova Fatura**"
4. Preencha título e descrição
5. Clique "**Importar PDF**" e arraste seu PDF
6. Se tiver senha, o sistema pedirá
7. Clique "**Baixar**" para obter o PDF com a descrição

---

## 🔧 Troubleshooting Rápido

### ❌ "npm: command not found"
**Solução**: Instale Node.js em nodejs.org

### ❌ "CORS error"
**Solução**: 
- Certifique-se que backend rodando em localhost:3001
- Certifique-se que frontend em localhost:5173

### ❌ "Cannot find module 'better-sqlite3'"
**Solução**:
```bash
cd backend
npm install better-sqlite3
```

### ❌ "Folder 'uploads' not found"
**Solução**: Será criada automaticamente no primeiro PDF

### ❌ "Banco de dados travado"
**Solução**:
1. Pare o backend (Ctrl+C)
2. Delete arquivos: `backend/invoices.db*`
3. Inicie novamente

---

## 📚 Documentação Completa

- 📖 [README.md](README.md) - Visão geral
- 🚀 [DEVELOPMENT.md](DEVELOPMENT.md) - Guia técnico
- 📦 [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - O que foi criado

---

## 🚀 Próximos Passos

Depois de rodar:

1. **Explore a interface** - Clique em tudo para entender
2. **Leia o código** - Comece por `frontend/src/App.jsx`
3. **Teste com PDFs reais** - Teste a funcionalidade de upload
4. **Modifique e customize** - Adicione suas próprias features

---

## 🎨 Customizações Rápidas

### Mudar cores (Tailwind)
Edite `frontend/tailwind.config.js`

### Mudar porta da API
Edite `backend/.env` e `frontend/.env`

### Adicionar nova pasta/fatura
Veja `backend/routes/folders.js` e `backend/routes/invoices.js`

---

## 💡 Dicas

- 🐳 Arraste PDFs direto para o modal para fazer upload
- 📱 Funciona em celular também!
- 💾 Dados são salvos automaticamente no banco
- 🔐 Senhas de PDF são criptografadas

---

## ✅ Pronto!

Você está pronto para usar o Invoice Manager!

**Dúvidas?** Consulte [DEVELOPMENT.md](DEVELOPMENT.md)

---

**Desenvolvido com ❤️ para facilitar o gerenciamento de faturas**
