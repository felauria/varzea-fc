# 11 — Backend e dados

**Nível:** 🟡 → 🔴 · **Pré-requisitos:** trilha 09 (etapa 1), trilha 07 (etapa 1) · **Status:** não iniciada

> ⚠️ **Escopo:** o MVP não tem backend, login nem banco remoto (`PROJECT_CONTEXT.md`). Esta trilha é laboratório e serve de base para as trilhas 06 (proxy de LLM), 07 (anti-cheat) e 10 (multiplayer).

## Objetivo

Projetar e operar um backend pequeno e bem feito: API tipada, banco de dados relacional, autenticação, testes de integração, migrações e deploy, reaproveitando o código da simulação no servidor.

## Por que neste projeto

Um ranking online e um proxy para LLMs são motivos reais e pequenos para ter um backend. O ranking ainda traz um problema interessante: confiar no placar enviado pelo cliente? (Não. Veja a trilha 07.)

## Conceitos

- Design de API (REST × RPC tipado), versionamento, paginação, erros consistentes.
- Node no servidor (Fastify/Hono), validação de entrada com schema, OpenAPI.
- PostgreSQL: modelagem, índices, transações, migrações; SQL de verdade, além do ORM.
- Autenticação (sessão × JWT × OAuth), autorização por recurso.
- Testes de integração com banco real (Testcontainers).
- Filas e trabalhos em segundo plano (validar replays, gerar narração).
- Telemetria/analytics: eventos, agregações, *data warehouse* simples.

## Prática no Várzea FC

### 🟡 Etapa 1 — API mínima

- [ ] Monorepo com `packages/sim` (trilha 09) e `apps/api`.
- [ ] Endpoint `POST /replays` que recebe `{seed, comandos}`, **reexecuta a simulação** e devolve o placar calculado pelo servidor.
- [ ] PostgreSQL local via `docker compose`, migrações versionadas e testes de integração com Testcontainers.
- [ ] Documentação OpenAPI gerada a partir dos schemas.

### 🔴 Etapa 2 — Produto online

- [ ] **Ranking** semanal com autenticação simples e proteção contra trapaça (trilha 07).
- [ ] **Proxy de LLM** para as funcionalidades da trilha 06, com cota por usuário e cache.
- [ ] **Telemetria** opt-in: eventos de partida agregados (onde se perde a bola, que tipo de passe mais acerta) para o playtest (trilha 12) e o dataset de ML (trilha 05).
- [ ] Salvamento na nuvem opcional, sincronizado com o save local versionado.
- [ ] Deploy em container com observabilidade (trilha 02).

## Referências

- *Designing Data-Intensive Applications* (Martin Kleppmann).
- Documentação do PostgreSQL (capítulos de índices e transações).
- Testcontainers: https://testcontainers.com · Fastify: https://fastify.dev
