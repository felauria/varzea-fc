# Backlog de estudos no projeto

Tarefas práticas, em ordem sugerida, que **avançam o jogo e o aprendizado ao mesmo tempo**.
Atualize o status, mova itens e adicione novos à vontade. Ao concluir, registre no [`diario.md`](diario.md).

Status: `[ ]` a fazer · `[~]` em andamento · `[x]` concluído

## Agora — próximas tarefas

| Status | Tarefa | Trilha | Nível | Por que agora |
|---|---|---|---|---|
| [ ] | Pipeline de CI no GitHub Actions (lint, tipos, testes, build) | 02 | 🟢 | Protege tudo o que vem depois. |
| [ ] | Proteção da `main` + Conventional Commits + PRs | 02 | 🟢 | Pratica o fluxo profissional desde cedo. |
| [ ] | Deploy no GitHub Pages | 02 | 🟢 | Amigos podem jogar, o que alimenta o playtest. |
| [ ] | Cobertura de testes + testes do goleiro e da física da bola | 01 | 🟢 | Conhecer os pontos cegos atuais. |
| [ ] | `SECURITY.md`, Dependabot, secret scanning e CodeQL | 07 | 🟢 | Higiene de segurança custa pouco no começo. |
| [ ] | Primeiro playtest com 3 pessoas | 12 | 🟢 | Validar o pilar "divertido primeiro". |

## Próximo — Fase 2 do jogo

| Status | Tarefa | Trilha | Nível |
|---|---|---|---|
| [ ] | Dois tempos, intervalo e troca de lado (com TDD) | 03 / 01 | 🟢 |
| [ ] | Debug overlay da IA (`F1`) | 04 | 🟢 |
| [ ] | Perfis de dificuldade (`AiProfile`: Fácil, Normal, Difícil) | 04 | 🟢 |
| [ ] | E2E com Playwright (pausa, perda de foco, gol) rodando no CI | 01 / 02 | 🟡 |
| [ ] | Testes de propriedade com `fast-check` | 01 | 🟡 |
| [ ] | Formações e abordagem influenciando a IA | 04 | 🟡 |
| [ ] | Input buffering e barra de força no chute | 03 | 🟢 |
| [ ] | Juice do gol (hit-stop, partículas, som) | 03 | 🟡 |

## Projetos-ponte

| Status | Tarefa | Destrava |
|---|---|---|
| [ ] | **Replays determinísticos** (`seed` + comandos por passo + hash do estado) | 01, 03, 05, 07, 10 |
| [ ] | **Simulador headless (CLI)** com estatísticas de N partidas | 04, 05, 08, 02 |
| [ ] | **Telemetria de partida** (eventos estruturados) | 05, 06, 12 |

## Depois — laboratórios

| Status | Tarefa | Trilha | Nível |
|---|---|---|---|
| [ ] | Algoritmo genético para calibrar os perfis de dificuldade | 05 | 🟡 |
| [ ] | Evoluir as posições das formações (táticas treinadas) | 05 | 🟡 |
| [ ] | Coleta opt-in de jogadas + modo "Fantasma" (behavior cloning) | 05 | 🔴 |
| [ ] | Goleiro treinado por reforço (PPO) e exportado para ONNX | 05 | 🔴 |
| [ ] | Narrador pós-jogo com saída estruturada e eval | 06 | 🟡 |
| [ ] | Técnico virtual com tool use chamando o simulador | 06 | 🟡 |
| [ ] | Servidor MCP do Várzea FC | 06 | 🔴 |
| [ ] | API de replays com validação no servidor (anti-cheat) | 11 / 07 | 🔴 |
| [ ] | Infraestrutura em S3 + CloudFront com Terraform e OIDC | 02 / 07 | 🔴 |
| [ ] | Modo espectador por WebSocket | 10 | 🔴 |

## Ideias soltas

Anote aqui ideias que surgirem durante os estudos, antes de decidir onde encaixá-las.

- 
