# 04 — IA de jogo clássica (dificuldade e táticas sem ML)

**Nível:** 🟢 → 🔴 · **Pré-requisitos:** trilha 03 (etapa 1 ajuda) · **Status:** iniciada (IA por papéis na Fase 1)

## Objetivo

Dominar as técnicas de IA usadas na maioria dos jogos comerciais: máquinas de estado, behavior trees, utility AI, steering, planejamento tático, além de **níveis de dificuldade** e **táticas** configuráveis. Tudo explicável e ajustável à mão.
Esta é a base para a trilha 05: antes de *treinar* uma IA, é preciso ter uma IA parametrizada e mensurável.

## Por que neste projeto

O `PROJECT_CONTEXT.md` pede IA por regras e estados no MVP. Hoje ela está em `src/game/systems/ai/`:

- `teamAi.ts`: papéis (portador, perseguidor, cobertura, apoio);
- `carrier.ts`: conduzir, passar ou chutar com probabilidades fixas;
- `goalkeeper.ts`: posicionamento e interceptação;
- `positioning.ts`: posição de apoio pela formação.

Há muito espaço para evoluir isso de forma didática.

## Conceitos

- **FSM / HFSM**: estados e transições (ex.: goleiro *posicionar → interceptar → segurar → distribuir*).
- **Behavior Trees**: sequências, seletores e decoradores; reuso de comportamentos.
- **Utility AI**: cada ação recebe uma nota (chutar, passar, conduzir) por curvas de consideração; a maior vence. É o próximo passo natural do `carrierAi`.
- **Steering behaviors**: seek, arrive, pursue, evade, separation, interceptação preditiva.
- **Análise espacial**: mapas de influência, "espaço livre", linhas de passe, *pitch control*.
- **Coordenação de time**: papéis, blackboard compartilhado, marcação individual × zona.
- **Dificuldade**: tempo de reação, precisão, erro proposital, agressividade, "rubber banding" e DDA (dificuldade dinâmica).
- **Táticas**: formação, bloco alto/baixo, largura, pressão, transições.
- **Depuração de IA**: desenhar intenções, alvos e notas na tela (*debug overlay*).

## Prática no Várzea FC

### 🟢 Etapa 1 — Visualizar e parametrizar

- [ ] **Debug overlay** (tecla `F1`, só em dev): desenhar o alvo de cada atleta, o papel (P/C/A), a linha de passe escolhida e a posição de guarda do goleiro.
- [ ] Extrair os números de decisão da IA (chance de chute, intervalo de decisão, chance de desarme, imprecisão) para um tipo `AiProfile`.
- [ ] Criar três perfis: **Fácil, Normal e Difícil**. Exemplos de diferenças: tempo de reação, chance de passe errado, velocidade do goleiro.
- [ ] Adicionar a escolha de dificuldade antes da partida e medir, com o simulador headless, o saldo de gols de cada perfil contra o Normal.

### 🟡 Etapa 2 — Comportamentos melhores

- [ ] Reescrever o goleiro como **FSM explícita**, com testes por transição.
- [ ] Transformar `carrierAi` em **Utility AI**: notas para chutar, passar curto, passar em profundidade, conduzir e proteger a bola, com curvas ajustáveis.
- [ ] **Desmarques**: atacantes sem a bola procuram espaço livre (amostrar pontos e escolher o mais distante dos adversários e com linha de passe aberta).
- [ ] **Marcação**: defensores escolhem entre marcar o homem mais perigoso e cobrir a zona.
- [ ] Fazer as **formações** (`2-1-1`, `1-2-1`, `1-1-2`) e a **abordagem** (ofensiva/equilibrada/defensiva) mudarem a IA de forma mensurável (Fase 2 do roadmap).

### 🔴 Etapa 3 — Sistemas táticos e dificuldade dinâmica

- [ ] **Mapa de influência** do campo (grade 16×9) atualizado algumas vezes por segundo e usado por desmarques e marcação.
- [ ] **Behavior tree** para o time (ataque organizado, contra-ataque, defesa em bloco, pressão alta) e comparação com a abordagem por papéis.
- [ ] **DDA (dificuldade dinâmica)**: ajustar sutilmente o perfil da IA conforme o placar e o desempenho do usuário. Discutir o lado ético e de design ("o jogador deve perceber?").
- [ ] **Torneio de IAs**: rodar perfis e táticas uns contra os outros no simulador headless e montar uma tabela de Elo.

## Para ir além

- GOAP (Goal-Oriented Action Planning) para o técnico da IA decidir substituições e mudanças táticas.
- Monte Carlo Tree Search para decidir lances de bola parada.
- Ler análises de *pitch control* do futebol real (dados de rastreamento) e adaptar ao 5×5.

## Referências

- *Programming Game AI by Example* (Mat Buckland): steering e futebol simulado, muito alinhado a este projeto.
- *Game AI Pro* (série de livros, capítulos gratuitos em http://www.gameaipro.com).
- *Behavior Trees in Robotics and AI* (Colledanchise & Ögren).
- Palestras de Dave Mark sobre Utility AI (GDC AI Summit).
