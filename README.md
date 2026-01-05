# 🎫 Ticket Concurrency Challenge

Este repositório documenta a implementação de um **Sistema de Venda de Ingressos de Alta Demanda**, projetado para suportar picos de tráfego intensos sem degradar a experiência do usuário ou gerar inconsistência de dados (como vender o mesmo assento duas vezes).

## 📜 Contexto do Negócio
A startup **"CrowdPass"** vai vender ingressos para a final do campeonato mundial de futebol. Espera-se que **1 milhão de usuários** tentem comprar os 50 mil ingressos disponíveis no exato momento da abertura das vendas.

O sistema atual (monolito síncrono) caiu na última venda. Sua missão é reescrever o núcleo de processamento de pedidos para ser **assíncrono, resiliente e à prova de falhas**.

---

## 🎯 Desafios Técnicos (Core Requirements)

### 1. Idempotência (Proteção contra Duplicidade)
Em momentos de instabilidade de rede, o usuário pode clicar no botão "Comprar" múltiplas vezes ou o app pode reenviar a requisição automaticamente.
- **Requisito:** Implementar um mecanismo de **Idempotência** baseado em chaves (`Idempotency-Key`).
- Se o servidor receber duas requisições com a mesma chave (mesmo payload), ele deve processar apenas a primeira e retornar o **mesmo resultado** para a segunda, sem criar duplicatas no banco ou cobrar o cartão duas vezes.

### 2. Arquitetura Assíncrona (RabbitMQ)
Para não derrubar o banco de dados, a API de entrada não deve processar a compra imediatamente.
- **Requisito:** O endpoint de compra deve apenas validar a requisição, publicar uma mensagem em uma fila de alta performance (`ticket_orders`) e retornar um `202 Accepted` imediato.
- Um serviço de background (Worker) deve consumir essa fila em velocidade controlada (*throttling*) para efetivar a reserva.

### 3. Feedback em Tempo Real (WebSockets)
Como a compra é assíncrona, o usuário não pode ficar sem resposta.
- **Requisito:** Implementar um **WebSocket Gateway**.
- Assim que o Worker processar o pedido (seja Sucesso ou "Esgotado"), o backend deve notificar o frontend ativamente via Socket, atualizando a UI do usuário em tempo real sem necessidade de *polling*.

### 4. Concorrência e Estoque
- **Requisito:** Garantir que o contador de ingressos nunca fique negativo. O sistema deve lidar com *race conditions* onde múltiplos workers tentam reservar o último ingresso simultaneamente.

---

## 🛠️ Stack Tecnológica Exigida
Este desafio deve ser implementado obrigatoriamente utilizando as seguintes tecnologias:

- **Framework:** [NestJS](https://nestjs.com/) (Modularidade e Injeção de Dependência).
- **Message Broker:** [RabbitMQ](https://www.rabbitmq.com/) (Gestão de filas e Pub/Sub para eventos).
- **Real-time:** [Socket.io](https://socket.io/) ou [ws](https://github.com/websockets/ws) (via NestJS Gateway).
- **Cache/Lock:** [Redis](https://redis.io/) (Para controle de idempotência e contagem rápida de estoque).
- **Banco de Dados:** PostgreSQL ou MongoDB (Persistência final).

## 🧪 Critérios de Aceite (Definition of Done)
1. [x] **API Robusta:** O endpoint `POST /orders` aceita a `Idempotency-Key` e rejeita/ignora reenvios.
2. [x] **Zero Downtime:** A API continua aceitando pedidos mesmo se o banco de dados estiver lento (fila absorve o pico).
3. [x] **Consistência:** Testes de carga (ex: k6) não geram vendas além do estoque total.
4. [x] **UX Fluida:** O cliente recebe a notificação via WebSocket em menos de 2 segundos após o processamento do worker.

---

> **Nota:** A arquitetura de pastas (Monorepo vs Polyrepo) e o setup inicial ficam a critério do arquiteto responsável (você).
