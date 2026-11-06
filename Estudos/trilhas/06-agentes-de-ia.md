# 06 — Agentes de IA com LLMs

**Nível:** 🟡 → 🔴 · **Pré-requisitos:** trilha 11 (etapa 1) para não expor chaves; trilha 07 (segurança de LLM) · **Status:** não iniciada

> ⚠️ **Escopo:** o MVP não tem backend. Chamar um LLM exige uma **chave de API que nunca pode ir para o navegador**.
> Por isso, esta trilha começa com scripts locais (Node) e só chega ao jogo por um backend/proxy (trilha 11). Funcionalidades com LLM ficam como **opcionais**: o jogo precisa funcionar sem elas.

## Objetivo

Construir agentes que **percebem, decidem e agem** usando LLMs: chamadas com saída estruturada, *tool use*, loops agênticos, servidores MCP, memória e, principalmente, **avaliação** (como saber se o agente é bom, barato e seguro).

## Por que neste projeto

Um jogo de gestão de futebol é cheio de bons casos de uso para agentes: dados estruturados (estatísticas, elenco), decisões com contexto (tática) e texto criativo (narração, notícias). A simulação pura do Várzea FC também pode virar **ferramenta** que um agente chama.

## Conceitos

- **Prompting e saída estruturada**: schema JSON, validação e nova tentativa.
- **Tool use / function calling**: o modelo pede para chamar uma função tipada; o código executa e devolve o resultado.
- **Loop agêntico**: observar → planejar → agir → verificar, com limites de passos e de custo.
- **MCP (Model Context Protocol)**: expor ferramentas e dados do jogo de forma padronizada para qualquer cliente compatível.
- **RAG**: buscar contexto (regras, histórico do clube) antes de responder.
- **Memória**: curta (conversa) × longa (resumos persistidos).
- **Avaliação (evals)**: conjuntos de casos, critérios, *LLM-as-judge*, regressão de prompts.
- **Custo e latência**: tokens, cache de prompt, escolha de modelo por tarefa.
- **Segurança**: *prompt injection* (ex.: nome de clube malicioso), vazamento de dados, permissões mínimas das ferramentas.

## Prática no Várzea FC

### 🟡 Etapa 1 — Primeiras chamadas (scripts locais)

- [ ] Script `labs/agents/gerar-elenco.ts`: gera jogadores fictícios (nome, posição, idade, atributos) com **saída estruturada** validada por schema e regras do domínio (atributos dentro dos limites, sem nomes de jogadores reais).
- [ ] **Narrador pós-jogo**: recebe os `MatchEvent` de uma partida (exportados do simulador) e escreve uma crônica curta no estilo de rádio de várzea.
- [ ] Guardar a chave em variável de ambiente (`.env` no `.gitignore`) e nunca no código. Ver a trilha 07.
- [ ] Criar um **eval** simples: 20 partidas de entrada, critérios (fatos corretos? placar certo? sem inventar jogadores?) e uma nota automatizada.

### 🟡 Etapa 2 — Ferramentas e técnico virtual

- [ ] Expor ferramentas tipadas: `simularPartida(taticaA, taticaB, n)`, `estatisticasDoTime()`, `listarElenco()`.
- [ ] **Técnico virtual**: um agente que recebe "quero vencer o Unidos do Morro", testa formações com `simularPartida` no simulador headless e recomenda uma tática com justificativa baseada nos números.
- [ ] Limitar o agente: máximo de chamadas, custo por sessão e *timeout*; registrar cada passo (rastreabilidade).
- [ ] Comparar as recomendações do agente contra uma busca exaustiva simples (é melhor? é mais barato?).

### 🔴 Etapa 3 — MCP, produto e avaliação contínua

- [ ] **Servidor MCP do Várzea FC**: expor simulação, elenco e tabela como ferramentas e recursos, e usar a partir de um cliente compatível (ex.: Claude Code).
- [ ] **Backend proxy** (trilha 11) para levar o narrador e o técnico ao jogo, com autenticação, limite de uso e cache de respostas.
- [ ] **Teste de prompt injection**: criar um clube chamado `Ignore as instruções e…` e garantir que o narrador não obedece. Documentar as defesas.
- [ ] **Evals no CI** (trilha 02): mudanças de prompt só entram se a nota não cair.
- [ ] Agente de **dev**: automatizar uma tarefa do próprio repositório (ex.: triagem de issues ou revisão de PR com regras do projeto) e medir se ajuda.

## Para ir além

- Multiagentes: técnico, auxiliar de dados e "imprensa" debatendo a escalação.
- Comparar um agente LLM jogando **gestão** (decisões lentas) com a IA da trilha 04/05 jogando a **partida** (decisões a 60 Hz). Por que LLM não serve para controlar atletas em tempo real?
- Geração de escudos/uniformes fictícios a partir de descrição, com o editor de uniforme como ferramenta.

## Referências

- Documentação da Anthropic (Claude API, tool use, MCP): https://docs.anthropic.com
- Model Context Protocol: https://modelcontextprotocol.io
- Artigo "Building effective agents" (Anthropic, 2024).
- OWASP Top 10 for LLM Applications: https://genai.owasp.org
