# 09 — Arquitetura e TypeScript avançado

**Nível:** 🟡 → 🔴 · **Pré-requisitos:** TypeScript básico · **Status:** iniciada (arquitetura da Fase 1)

## Objetivo

Tomar e **documentar** decisões de arquitetura que mantêm o projeto fácil de mudar à medida que cresce (gestão, competição, persistência, backend). Usar o sistema de tipos do TypeScript para tornar estados inválidos impossíveis de representar.

## Por que neste projeto

O Várzea FC vai juntar domínios bem diferentes: partida em tempo real, regras de gestão, economia, competição e persistência. É o cenário ideal para praticar fronteiras entre módulos, inversão de dependência e modelagem de domínio sem exagerar na abstração.

## Conceitos

- **Arquitetura em camadas / hexagonal**: domínio puro no centro; React, Phaser e LocalStorage como adaptadores.
- **ADR (Architecture Decision Records)**: registrar contexto, decisão e consequências.
- **Modelagem de domínio**: entidades, value objects, invariantes (atributos 0–99, saldo ≥ 0).
- **Tipos avançados**: uniões discriminadas (`MatchEvent`), *branded types* (`PlayerId`), *template literal types* (`HexColor`), `satisfies`, tipos condicionais.
- **Eventos de domínio** e comunicação entre módulos.
- **ECS** (Entity Component System) × OOP × funções puras sobre estado.
- **Monorepo / pacotes**: separar `@varzea/sim` (Node + navegador) de `@varzea/web`.
- **Imutabilidade × mutação controlada** e quando cada uma faz sentido.

## Prática no Várzea FC

### 🟡 Etapa 1 — Documentar e tipar melhor

- [ ] Criar `docs/adr/` e escrever os primeiros ADRs a partir das decisões em `docs/ARCHITECTURE.md` (resolução 640×360, campo fechado, uniformes por camadas…).
- [ ] *Branded types* para IDs (`PlayerId`, `ClubId`) e eliminar strings soltas.
- [ ] Revisar `MatchState` com uniões discriminadas por fase (ex.: `phaseTimer` só existe em `kickoff`/`goal`).
- [ ] Regra de dependência automatizada: `game/systems` e `domain` não podem importar `phaser` nem `react` (lint com regra de importação ou teste que lê os imports).

### 🔴 Etapa 2 — Escalar o projeto

- [ ] Modelar o domínio da **gestão** (clube, elenco, contratos simples, economia) como módulo puro com testes, antes de qualquer tela.
- [ ] Camada de **persistência** com portas e adaptadores: `SaveRepository` com implementação em LocalStorage e outra em memória para testes; schema versionado com migrações.
- [ ] Extrair a simulação para um pacote (`packages/sim`) num **monorepo** com npm workspaces. Será reutilizada pelo backend (anti-cheat) e pelos treinos de ML.
- [ ] Experimentar **ECS** num *spike* isolado e escrever um ADR comparando com a abordagem atual.

## Para ir além

- *Event sourcing* para a carreira (cada ação do usuário é um evento; o estado é derivado), o que facilita "desfazer" e depuração.
- Máquinas de estado tipadas para o fluxo de telas (ex.: XState).

## Referências

- *Fundamentals of Software Architecture* (Richards & Ford).
- *Domain-Driven Design Distilled* (Vaughn Vernon).
- *Effective TypeScript* (Dan Vanderkam) e o TypeScript Handbook.
- Michael Nygard, "Documenting Architecture Decisions" (artigo original sobre ADRs).
