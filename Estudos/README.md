# Estudos — Várzea FC como laboratório de aprendizado

O Várzea FC tem dois objetivos: virar um jogo de verdade e servir de laboratório para aprender desenvolvimento de software de ponta a ponta.
Esta pasta registra **trilhas de estudo**, **tarefas práticas** no projeto e um **diário** do que foi aprendido.

> O produto continua guiado pelo [`PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md). Os estudos não podem quebrar o MVP.
> Quando um estudo divergir do escopo (ex.: machine learning, backend, multiplayer), ele vive como **experimento isolado** até virar decisão de produto.

## Como usar

1. Escolha uma trilha em [`trilhas/`](trilhas/) e leia o objetivo e os pré-requisitos.
2. Pegue a próxima tarefa da trilha. Cada uma é pequena e entrega algo verificável no projeto.
3. Registre no [`backlog.md`](backlog.md) o que está fazendo (status) e, ao terminar, escreva no [`diario.md`](diario.md) o que aprendeu.
4. Uma trilha não precisa ser concluída para começar outra. Elas se cruzam de propósito.

Legenda de nível: 🟢 iniciante · 🟡 intermediário · 🔴 avançado.
Legenda de status: `[ ]` a fazer · `[~]` em andamento · `[x]` concluído.

## Trilhas

### Pedidas por você

| # | Trilha | Em uma frase |
|---|---|---|
| 01 | [Testes e qualidade](trilhas/01-testes-e-qualidade.md) | Da pirâmide de testes a testes de propriedade, mutação, E2E e regressão visual. |
| 02 | [DevOps e entrega](trilhas/02-devops-e-entrega.md) | CI, deploy automático, previews por PR, versionamento, infraestrutura como código e observabilidade. |
| 03 | [Desenvolvimento de jogos](trilhas/03-game-dev.md) | Game loop, game feel, animação, áudio, câmera, design e balanceamento. |
| 04 | [IA de jogo clássica](trilhas/04-ia-de-jogo.md) | Máquinas de estado, behavior trees, utility AI, níveis de dificuldade e táticas sem ML. |
| 05 | [Machine learning no jogo](trilhas/05-machine-learning.md) | Coletar jogadas, imitar o jogador, treinar dificuldade e táticas com algoritmos genéticos e RL. |
| 06 | [Agentes de IA (LLMs)](trilhas/06-agentes-de-ia.md) | Técnico virtual, narrador, geração de conteúdo, tool use, MCP e avaliação de agentes. |
| 07 | [Cibersegurança](trilhas/07-ciberseguranca.md) | Modelagem de ameaças, cadeia de suprimentos, CSP, saves adulterados, anti-cheat e segurança de LLM. |

### Sugeridas para ampliar o repertório

| # | Trilha | Por que vale a pena |
|---|---|---|
| 08 | [Performance e profiling](trilhas/08-performance.md) | O jogo tem orçamento de 16,6 ms por quadro. É o melhor lugar para aprender a medir antes de otimizar. |
| 09 | [Arquitetura e TypeScript avançado](trilhas/09-arquitetura-e-typescript.md) | ECS, ADRs, tipos avançados, monorepo, decisões que escalam. |
| 10 | [Redes e multiplayer](trilhas/10-redes-e-multiplayer.md) | A simulação já é determinística, o que abre caminho para netcode, rollback e espectador. |
| 11 | [Backend e dados](trilhas/11-backend-e-dados.md) | Ranking, contas, banco de dados e APIs, como experimento fora do MVP. |
| 12 | [Produto, UX e acessibilidade](trilhas/12-produto-ux-acessibilidade.md) | Playtest, métricas, acessibilidade de jogos, onboarding e i18n. |

## Ordem sugerida

A ordem acompanha o [roadmap do jogo](../docs/ROADMAP.md), para que cada estudo também avance o produto:

1. **Agora (Fase 2 do jogo):** 01 Testes (E2E e CI) → 02 DevOps (pipeline e deploy) → 03 Game dev (game feel e dois tempos) → 04 IA clássica (dificuldade e táticas).
2. **Ponte para ML:** projeto-ponte **Replays determinísticos** (abaixo) → 05 ML (algoritmos genéticos primeiro, depois imitação e RL).
3. **Em paralelo, sempre:** 07 Segurança (cada nova peça ganha uma modelagem de ameaças) e 08 Performance.
4. **Depois do MVP jogável:** 06 Agentes de IA → 11 Backend → 10 Multiplayer.

## Projetos-ponte

Algumas entregas destravam várias trilhas ao mesmo tempo. Vale priorizá-las:

| Projeto-ponte | O que é | Destrava |
|---|---|---|
| **Replays determinísticos** | Gravar semente do RNG + comandos por passo fixo e reproduzir a partida idêntica. | Testes de regressão (01), dados para ML (05), anti-cheat (07), netcode por lockstep/rollback (10), destaques e narração (06). |
| **Simulador headless (CLI)** | Rodar milhares de partidas IA × IA no Node, sem navegador, e gerar estatísticas. | Balanceamento (03/12), treino de dificuldade e táticas (04/05), benchmarks (08), CI de balanceamento (02). |
| **Telemetria de partida** | Eventos estruturados (passe, chute, desarme, posse) com contexto. | Analytics e playtest (12), dataset de jogadas (05), observabilidade (02), técnico virtual (06). |
| **Perfis de dificuldade** | Parametrizar a IA (reação, precisão, agressividade) em perfis. | IA clássica (04), dificuldade treinada (05), DDA e UX (12). |

A simulação já ajuda: `stepMatch()` em `src/game/systems/matchEngine.ts` é pura, roda no Node e recebe um `Rng` com semente. Os testes já rodam partidas completas sem navegador.

## Arquivos desta pasta

- [`backlog.md`](backlog.md): tarefas práticas no projeto, com trilha, nível e status.
- [`diario.md`](diario.md): registro do que foi aprendido, problemas e decisões.
- [`_modelo-trilha.md`](_modelo-trilha.md): modelo para criar uma trilha nova.
