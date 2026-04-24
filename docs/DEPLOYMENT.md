# Deploy

Este projeto pode ser publicado com:

- backend no Render
- frontend estatico na HostGator

## Backend no Render

1. Crie um novo Web Service apontando para este repositorio.
2. Use o diretorio `backend`.
3. Configure o comando de start:

```bash
npm start
```

4. Configure as variaveis de ambiente:

```env
NODE_ENV=production
CORS_ORIGIN=https://seudominio.com,https://www.seudominio.com
DATA_DIR=/var/data
```

5. Se usar disco persistente no Render, monte o disco em `/var/data`.

Observacao:
- sem disco persistente, SQLite e PDFs enviados podem ser perdidos em reinicios e novos deploys

## Frontend na HostGator

1. No arquivo `frontend/.env`, defina a URL publica da API:

```env
VITE_API_URL=https://api.seudominio.com/api
```

2. Gere o build:

```bash
cd frontend
npm run build
```

3. Envie o conteudo da pasta `frontend/dist` para `public_html`.

O arquivo `frontend/public/.htaccess` ja esta preparado para manter as rotas do React funcionando na hospedagem.

## Estrategia recomendada

- rapido para publicar: HostGator no frontend + Render com disco persistente no backend
- mais robusto no futuro: migrar SQLite para banco gerenciado e mover uploads para armazenamento externo
