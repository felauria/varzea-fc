# 10 — Redes e multiplayer

**Nível:** 🔴 · **Pré-requisitos:** projeto-ponte de replays, trilha 11 (etapa 1), trilha 08 · **Status:** não iniciada

> ⚠️ **Escopo:** multiplayer está **fora do MVP** (`PROJECT_CONTEXT.md`). Tudo aqui é laboratório, em branch ou pasta separada.

## Objetivo

Entender como jogos em tempo real sincronizam estado pela rede: latência, *jitter*, perda de pacotes, **lockstep determinístico**, **predição no cliente**, **rollback** e servidor autoritativo.

## Por que neste projeto

A simulação do Várzea FC já é determinística (semente + passo fixo + comandos). Essa é a propriedade que permite *lockstep* e *rollback netcode*, as técnicas usadas em jogos de luta e de esporte. Poucos projetos de estudo começam com essa base.

## Conceitos

- TCP × UDP; WebSocket × WebRTC DataChannel; latência e RTT.
- **Lockstep determinístico**: todos simulam igual a partir dos mesmos comandos.
- **Rollback (GGPO)**: prever o input remoto, simular e corrigir voltando no tempo quando o input real chega.
- **Servidor autoritativo** com predição e reconciliação no cliente; interpolação de entidades.
- **Determinismo de ponto flutuante** entre navegadores: riscos e mitigação (ponto fixo?).
- Matchmaking, salas, reconexão, espectadores.

## Prática no Várzea FC

### 🔴 Etapa 1 — Fundamentos

- [ ] **Teste de determinismo**: a mesma gravação produz o mesmo hash de estado no Node, no Chrome, no Firefox e no Safari. Se não produzir, investigar (`Math.sin`/`Math.exp` podem variar).
- [ ] **Modo espectador**: um segundo navegador recebe só `{seed, comandos}` por WebSocket e reproduz a partida ao vivo.
- [ ] Simular latência e perda (atrasos artificiais no servidor) e observar o efeito.

### 🔴 Etapa 2 — Jogar em rede

- [ ] **1 × 1 local na mesma máquina** primeiro (dois conjuntos de teclas), sem rede, para separar input por jogador.
- [ ] **Lockstep com atraso de input** (2–4 quadros) entre dois navegadores via servidor WebSocket.
- [ ] **Rollback**: guardar snapshots do `MatchState`, prever o input remoto e voltar a simular. Medir quantos quadros de rollback cabem no orçamento (trilha 08).
- [ ] Comparar com uma versão de **servidor autoritativo** e escrever um ADR sobre qual abordagem se encaixa melhor num jogo de futebol 5×5.

## Referências

- Glenn Fiedler, série "Networking for Game Programmers" (gafferongames.com).
- Gabriel Gambetta, "Fast-Paced Multiplayer" (artigos com demos interativas).
- Documentação do GGPO e a palestra "8 Frames in 16ms" (Mortal Kombat/Injustice, GDC).
