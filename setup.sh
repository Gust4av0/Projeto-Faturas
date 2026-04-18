#!/bin/bash

echo ""
echo "================================"
echo "Invoice Manager - Setup"
echo "================================"
echo ""

echo "[1/4] Instalando dependencias do Backend..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "Erro ao instalar dependencias do backend"
    exit 1
fi
cd ..

echo ""
echo "[2/5] Instalando dependencias do runtime de PDF protegido..."
cd backend/pdf-runtime
npm install
if [ $? -ne 0 ]; then
    echo "Erro ao instalar dependencias do runtime de PDF protegido"
    exit 1
fi
cd ../..

echo ""
echo "[3/5] Instalando dependencias do Frontend..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "Erro ao instalar dependencias do frontend"
    exit 1
fi
cd ..

echo ""
echo "[4/5] Criando diretorios necessarios..."
mkdir -p backend/uploads

echo ""
echo "[5/5] Setup completo!"
echo ""
echo "================================"
echo "Proximo Passo:"
echo "================================"
echo ""
echo "Abra dois terminais:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend"
echo "  npm start"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:3001"
echo ""
