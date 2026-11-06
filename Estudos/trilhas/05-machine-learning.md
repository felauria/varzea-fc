# 05 — Machine learning no jogo

**Nível:** 🟡 → 🔴 · **Pré-requisitos:** trilha 04 (etapa 1), projeto-ponte de replays, Python básico (etapa 3) · **Status:** não iniciada

> ⚠️ **Escopo:** o `PROJECT_CONTEXT.md` diz que a IA do MVP **não usa aprendizado de máquina**.
> Esta trilha é um **laboratório**: o código fica isolado (ex.: `labs/ml/` ou uma branch `labs/*`) e não substitui a IA por regras.
> Se um experimento se provar melhor, a mudança vira uma decisão registrada no contexto do projeto antes de entrar no jogo.

## Objetivo

Aprender o ciclo completo de ML aplicado a jogos: **coletar dados** de partidas, **treinar** modelos (imitação, algoritmos evolutivos e reforço), **avaliar** de forma honesta e **embarcar** o modelo no navegador. Isso cobre os três desejos da sua lista:

1. **Treinar a IA com jogadas dos usuários**: aprendizado por imitação (*behavior cloning*).
2. **Treinar dificuldades**: otimizar parâmetros de perfis para atingir uma meta de desafio.
3. **Treinar táticas**: evoluir ou aprender posicionamento e decisões de time.

## Por que neste projeto

Poucos projetos pessoais têm um **ambiente de simulação pronto**. O Várzea FC tem: `stepMatch()` é pura, determinística com semente e roda no Node a milhares de passos por segundo, sem navegador. É exatamente o que treinos por reforço e evolução precisam.

## Conceitos

- **Dados e features**: representar o estado (posição relativa da bola, companheiros, adversários, gol) de forma invariante ao lado do campo.
- **Behavior cloning**: aprendizado supervisionado de `estado → ação` a partir de jogadas humanas; *distribution shift* e DAgger.
- **Algoritmos genéticos / neuroevolução**: evoluir parâmetros ou pequenas redes com uma *fitness* definida por partidas simuladas.
- **Reinforcement learning**: MDP, recompensa, política, PPO, *reward shaping* e *reward hacking* (a IA "trapaceando" a recompensa).
- **Self-play** e ligas (como no AlphaStar): evitar que a IA aprenda só a vencer a si mesma.
- **Avaliação**: conjuntos de teste, sementes fixas, intervalo de confiança, Elo.
- **Embarque**: exportar para ONNX e rodar com ONNX Runtime Web ou TensorFlow.js; custo de inferência por quadro.
- **Privacidade e consentimento** ao coletar jogadas de usuários (ligação com a trilha 07).

## Prática no Várzea FC

### 🟡 Etapa 1 — Dados e simulador (tudo em TypeScript)

- [ ] **Projeto-ponte: replays determinísticos.** Gravar `{seed, comandos por passo}` e reproduzir a partida idêntica. Testar comparando um hash do estado final.
- [ ] **Simulador headless (CLI)**: `npm run sim -- --matches 1000 --home normal --away dificil`, que imprime estatísticas.
- [ ] **Extrator de features**: função pura `observe(state, playerId) → number[]`, normalizada e espelhada para o time visitante. Testes garantindo a simetria.
- [ ] **Coleta opt-in de jogadas**: com consentimento explícito na interface, salvar localmente pares `(observação, comando)` das partidas do usuário e permitir exportar como JSON.

### 🟡 Etapa 2 — Otimização sem redes neurais (dificuldade e táticas)

- [ ] **Treinar dificuldade**: usar busca aleatória e depois um **algoritmo genético** sobre o `AiProfile` (trilha 04) para encontrar um perfil que vença o Normal em ~50% das partidas (Médio), ~25% (Fácil) e ~75% (Difícil). A *fitness* é a distância até a taxa-alvo.
- [ ] **Treinar táticas**: evoluir as posições dos *slots* de cada formação (`domain/formations.ts`) e os pesos da Utility AI. Comparar o resultado contra a formação original em 1.000 partidas.
- [ ] Discutir *overfitting* tático: a tática evoluída contra um único adversário vence os outros?

### 🔴 Etapa 3 — Redes neurais, imitação e reforço

- [ ] **Behavior cloning**: treinar uma rede pequena (MLP) com as jogadas exportadas para prever direção e ação a partir da observação. Criar o modo "**Fantasma**", em que um atleta da IA joga como você. Medir onde ele falha (*distribution shift*).
- [ ] **Ambiente Gymnasium**: expor a simulação ao Python (processo Node falando JSON por stdin/stdout ou WebSocket) com `reset()` e `step(action)`.
- [ ] **RL com PPO** (Stable-Baselines3) para um subproblema primeiro: o **goleiro** (recompensa por defesas, penalidade por gols). Depois, um atacante em 1×1.
- [ ] **Self-play** do time inteiro com liga de oponentes passados.
- [ ] **Embarcar no navegador**: exportar para ONNX, carregar com ONNX Runtime Web e comparar desempenho (ms por inferência) e qualidade contra a IA por regras.
- [ ] Escrever um relatório no diário: o que a IA aprendeu de inesperado (*reward hacking* costuma aparecer!).

## Para ir além

- Treinar uma IA que **imite estilos** (ex.: "time que toca a bola" × "time de chutão") com aprendizado condicionado.
- **DDA aprendida**: um modelo que prevê se o jogador está frustrado (gols sofridos seguidos, inatividade) e ajusta a dificuldade.
- Ler sobre o ambiente **Google Research Football**, um caso real de RL em futebol.

## Referências

- *Hands-On Machine Learning* (Aurélien Géron), para fundamentos.
- Spinning Up in Deep RL (OpenAI): https://spinningup.openai.com
- Gymnasium: https://gymnasium.farama.org · Stable-Baselines3: https://stable-baselines3.readthedocs.io
- ONNX Runtime Web: https://onnxruntime.ai · TensorFlow.js: https://www.tensorflow.org/js
- Artigos: "Google Research Football: A Novel Reinforcement Learning Environment" (2019); DAgger (Ross et al., 2011).
