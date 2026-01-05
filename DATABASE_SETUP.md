# Database Setup Guide

## Iniciar o PostgreSQL local

```bash
# Na raiz do projeto
docker-compose up -d postgres

# Verificar se está rodando
docker ps | grep postgres
```

## Aplicar o schema ao banco de dados

```bash
# Navegar até o pacote db
cd packages/db

# Aplicar o schema (push direto sem migrations)
npm run db:push
```

## Seed inicial (opcional)

Após o servidor iniciar, você pode popular o banco com dados de teste:

```bash
curl -X POST http://localhost:3000/seed
```

## Comandos úteis

```bash
# Visualizar o banco no Drizzle Studio
cd packages/db
npm run db:studio

# Parar todos os containers
docker-compose down

# Resetar o banco (CUIDADO: apaga todos os dados)
docker-compose down -v
docker-compose up -d postgres
cd packages/db && npm run db:push
```
