# 🎫 Ticket Concurrency Challenge

<p align="center">
  <strong>Sistema de Venda de Ingressos de Alta Demanda</strong><br>
  Arquitetura resiliente para processar milhões de requisições concorrentes sem perda de dados.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS"/>
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white" alt="RabbitMQ"/>
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis"/>
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io"/>
</p>

---

## 🏗️ Arquitetura do Sistema

```mermaid
graph TD
    User([👤 User / Client])
    
    subgraph API_Layer [⚡ API Gateway]
        API[POST /orders]
        Redis_Idem[(Redis Cache<br/>Idempotency)]
    end
    
    subgraph Async_Layer [📬 Message Broker]
        Queue[RabbitMQ<br/>Queue: ticket_orders]
    end
    
    subgraph Worker_Layer [⚙️ Worker Service]
        Consumer[Order Consumer]
        Redis_Lock[(Redis Lock<br/>Concurrency)]
        DB[(PostgreSQL)]
        Socket[WebSocket Gateway]
    end

    %% Flow
    User -->|1. Request| API
    API -->|Validate| Redis_Idem
    API -->|2. Publish| Queue
    API -.->|202 Accepted| User
    
    Queue -->|3. Consume| Consumer
    Consumer -->|Acquire Lock| Redis_Lock
    Consumer -->|4. Process| DB
    
    DB -->|5. Notify| Socket
    Socket -.->|6. Push Update| User
```

### Fluxo de Processamento

1. **API Gateway**: Recebe a requisição, valida a chave de idempotência no Redis e enfileira o pedido. Retorna sucesso imediato ao cliente.
2. **RabbitMQ**: Absorve os picos de tráfego, garantindo que o banco de dados não seja sobrecarregado.
3. **Worker**: Consome as mensagens de forma controlada.
4. **Resistência**: Usa **Redis Locks** para garantir que apenas um processo mude o estoque de um ingresso por vez (evitando *overselling*).
5. **Notificação**: Assim que o processamento termina (sucesso ou falha), o cliente é avisado via WebSocket.

---

## ✨ Funcionalidades Implementadas

| Feature | Descrição |
|---------|-----------|
| **Idempotência** | Reenvios da mesma requisição (mesmo `Idempotency-Key`) retornam o resultado original sem reprocessar |
| **Processamento Assíncrono** | API retorna `202 Accepted` imediatamente; processamento ocorre via Worker |
| **Locking Distribuído** | Redis locks evitam race conditions entre múltiplos workers |
| **Transações Atômicas** | PostgreSQL garante consistência: estoque nunca fica negativo |
| **Real-time Feedback** | WebSocket notifica o cliente assim que o pedido é processado |
| **Retry com Backoff** | Mensagens com falha de lock são reprocessadas até 3x antes de ir para DLQ |
| **Broadcast de Estoque** | Todos os clientes conectados recebem atualizações de quantidade disponível |

---

## 🛠️ Stack Tecnológica

### Backend
- **Framework:** [NestJS](https://nestjs.com/) com [Fastify](https://fastify.io/)
- **Message Broker:** [RabbitMQ](https://www.rabbitmq.com/)
- **Cache/Lock:** [Redis](https://redis.io/) com [ioredis](https://github.com/redis/ioredis)
- **Database:** [PostgreSQL](https://www.postgresql.org/) com [Drizzle ORM](https://orm.drizzle.team/)
- **WebSocket:** [Socket.io](https://socket.io/)

### Frontend
- **Framework:** [Next.js 16](https://nextjs.org/) com React 19
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **State:** [TanStack Query](https://tanstack.com/query)
- **Animations:** [Motion](https://motion.dev/)
- **Real-time:** [Socket.io Client](https://socket.io/)

### Infraestrutura
- **Monorepo:** [Turborepo](https://turbo.build/)
- **Containerization:** Docker + Docker Compose
- **Linting:** Biome, OxLint, OxFmt

---

## 🚀 Quick Start

### Pré-requisitos
- Node.js 22+
- npm 11+
- Docker e Docker Compose

### 1. Clone e instale as dependências

```bash
git clone https://github.com/felipesdotdev/ticket-concurrency-challenge.git
cd ticket-concurrency-challenge
npm install
```

### 2. Suba a infraestrutura (PostgreSQL, RabbitMQ, Redis)

```bash
docker-compose up -d
```

### 3. Configure o ambiente

Crie os arquivos `.env` necessários ou use os valores padrão do `docker-compose.yml`:

```env
# Database
DATABASE_URL=postgres://app:app@localhost:5432/ticketdb

# Redis
REDIS_URL=redis://localhost:6379

# RabbitMQ
RABBITMQ_URL=amqp://app:app@localhost:5672
```

### 4. Execute as migrations e seed

```bash
npm run db:push
npm run db:seed
```

### 5. Inicie o desenvolvimento

```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev:web
```

O servidor estará disponível em `http://localhost:3000` e o frontend em `http://localhost:3001`.

---

## 📁 Estrutura do Projeto

```
ticket-concurrency-challenge/
├── apps/
│   ├── server/                 # Backend NestJS
│   │   └── src/
│   │       ├── common/         # Interceptors (Idempotency)
│   │       ├── database/       # Conexão com PostgreSQL
│   │       ├── events/         # WebSocket Gateway
│   │       ├── infrastructure/ # Redis, RabbitMQ configs
│   │       └── orders/         # Módulo de pedidos (Controller, Service, Consumer)
│   │
│   └── web/                    # Frontend Next.js
│
├── packages/
│   ├── auth/                   # Configuração Better Auth
│   ├── config/                 # Configurações compartilhadas
│   └── db/                     # Schema Drizzle + Migrations
│
├── docker-compose.yml          # PostgreSQL, RabbitMQ, Redis
└── turbo.json                  # Configuração Turborepo
```

---

## 🔌 API Endpoints

### `POST /orders`
Cria um novo pedido de ingresso.

**Headers:**
| Header | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `Idempotency-Key` | UUID | ✅ | Chave única para evitar duplicatas |
| `x-user-id` | string | ❌ | ID do usuário (default: `user-123`) |

**Body:**
```json
{
  "ticketId": "uuid-do-ingresso",
  "quantity": 1
}
```

**Response (202 Accepted):**
```json
{
  "id": "uuid-do-pedido",
  "status": "PENDING",
  "message": "Order received and queued for processing"
}
```

### `GET /orders/:id`
Retorna os detalhes de um pedido.

### `GET /orders/tickets`
Lista todos os ingressos disponíveis.

---

## 🔔 WebSocket Events

Conecte-se ao WebSocket passando o `userId`:

```javascript
const socket = io('http://localhost:3000', {
  query: { userId: 'user-123' }
});
```

### Eventos

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `order:update` | `{ orderId, status, totalPrice, message }` | Notifica o usuário sobre o resultado do seu pedido |
| `ticket:update` | `{ ticketId, availableQuantity }` | Broadcast para todos: atualização de estoque |

---

## 🧪 Testando a Concorrência

Use ferramentas como [k6](https://k6.io/) ou [Artillery](https://artillery.io/) para simular carga:

```javascript
// k6 script exemplo
import http from 'k6/http';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export const options = {
  vus: 1000,
  duration: '30s',
};

export default function () {
  const payload = JSON.stringify({
    ticketId: 'seu-ticket-id',
    quantity: 1,
  });

  http.post('http://localhost:3000/orders', payload, {
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': uuidv4(),
    },
  });
}
```

---

## 📜 Contexto do Desafio Original

A startup **"CrowdPass"** vai vender ingressos para a final do campeonato mundial de futebol. Espera-se que **1 milhão de usuários** tentem comprar os 50 mil ingressos disponíveis no exato momento da abertura das vendas.

O sistema atual (monolito síncrono) caiu na última venda. A missão é reescrever o núcleo de processamento de pedidos para ser **assíncrono, resiliente e à prova de falhas**.

### 🎯 Desafios Técnicos (Core Requirements)

#### 1. Idempotência (Proteção contra Duplicidade)
Em momentos de instabilidade de rede, o usuário pode clicar no botão "Comprar" múltiplas vezes ou o app pode reenviar a requisição automaticamente.
- **Requisito:** Implementar um mecanismo de **Idempotência** baseado em chaves (`Idempotency-Key`).
- Se o servidor receber duas requisições com a mesma chave (mesmo payload), ele deve processar apenas a primeira e retornar o **mesmo resultado** para a segunda, sem criar duplicatas no banco ou cobrar o cartão duas vezes.

#### 2. Arquitetura Assíncrona (RabbitMQ)
Para não derrubar o banco de dados, a API de entrada não deve processar a compra imediatamente.
- **Requisito:** O endpoint de compra deve apenas validar a requisição, publicar uma mensagem em uma fila de alta performance (`ticket_orders`) e retornar um `202 Accepted` imediato.
- Um serviço de background (Worker) deve consumir essa fila em velocidade controlada (*throttling*) para efetivar a reserva.

#### 3. Feedback em Tempo Real (WebSockets)
Como a compra é assíncrona, o usuário não pode ficar sem resposta.
- **Requisito:** Implementar um **WebSocket Gateway**.
- Assim que o Worker processar o pedido (seja Sucesso ou "Esgotado"), o backend deve notificar o frontend ativamente via Socket, atualizando a UI do usuário em tempo real sem necessidade de *polling*.

#### 4. Concorrência e Estoque
- **Requisito:** Garantir que o contador de ingressos nunca fique negativo. O sistema deve lidar com *race conditions* onde múltiplos workers tentam reservar o último ingresso simultaneamente.

### ✅ Critérios de Aceite (Definition of Done)

- [x] **API Robusta:** O endpoint `POST /orders` aceita a `Idempotency-Key` e rejeita/ignora reenvios.
- [x] **Zero Downtime:** A API continua aceitando pedidos mesmo se o banco de dados estiver lento (fila absorve o pico).
- [x] **Consistência:** Testes de carga não geram vendas além do estoque total.
- [x] **UX Fluida:** O cliente recebe a notificação via WebSocket em menos de 2 segundos após o processamento do worker.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
