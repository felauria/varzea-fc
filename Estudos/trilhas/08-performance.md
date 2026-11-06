# 08 — Performance e profiling

**Nível:** 🟡 → 🔴 · **Pré-requisitos:** trilha 03 (etapa 1) · **Status:** não iniciada

## Objetivo

Medir antes de otimizar: entender o **orçamento de quadro** (16,6 ms a 60 FPS), usar profilers, reduzir alocações e pausas do garbage collector, mover trabalho para fora da thread principal e manter o carregamento rápido.

## Por que neste projeto

Jogos deixam a performance *visível*: uma travada de 50 ms é sentida pelo jogador. O Várzea FC ainda é leve, ótimo para criar **linhas de base** agora e acompanhar a evolução. O simulador headless também precisa ser rápido para os treinos da trilha 05.

## Conceitos

- Orçamento de quadro: input → simulação → render → composição.
- Profiling no Chrome DevTools (Performance, Memory), flame charts e *long tasks*.
- **Alocações e GC**: `vec2.ts` cria objetos novos a cada operação. É simples e seguro, mas gera lixo. Quando isso importa? Medir!
- Object pooling, estruturas de dados contíguas (*typed arrays*), *structure of arrays*.
- **Web Workers** e `OffscreenCanvas`; mensagens × `SharedArrayBuffer`.
- Custos de renderização no WebGL: *draw calls*, *batching*, atlas de texturas.
- Carregamento: tamanho do bundle (o Phaser tem ~1,2 MB), *code splitting*, compressão, cache.
- Benchmarks confiáveis: aquecimento, variância, mediana × p95.

## Prática no Várzea FC

### 🟡 Etapa 1 — Linha de base

- [ ] Contador de FPS e tempo de `stepMatch`/render no debug overlay (ligação com a trilha 04).
- [ ] Gravar um perfil de 30 s no Chrome DevTools durante uma partida e anotar no diário onde o tempo é gasto.
- [ ] `vitest bench` para `stepMatch`: passos por segundo no Node. Esse é o número que limita os treinos da trilha 05.
- [ ] Medir o tamanho do bundle por módulo (`rollup-plugin-visualizer` ou equivalente).

### 🔴 Etapa 2 — Otimizações guiadas por dados

- [ ] Experimento: versão mutável de `vec2` só nos *hot paths* (movimento, física). Medir o ganho real e decidir se vale a perda de legibilidade (registrar em ADR).
- [ ] Rodar a simulação num **Web Worker**, com o Phaser só desenhando o estado recebido. Medir a latência de input.
- [ ] **Code splitting**: carregar o Phaser só ao entrar na partida, deixando os menus de gestão leves.
- [ ] Simulador headless em **paralelo** com `worker_threads` para o CI de balanceamento.
- [ ] Testar em máquina fraca (CPU throttling 6× no DevTools) e definir um requisito mínimo.

## Para ir além

- Portar o núcleo da simulação para **WebAssembly** (Rust/AssemblyScript) e comparar com TypeScript.
- Interpolação de renderização entre passos fixos (para monitores de 144 Hz ficarem mais suaves).

## Referências

- Chrome DevTools, Performance: https://developer.chrome.com/docs/devtools/performance
- web.dev: Core Web Vitals e otimização de carregamento.
- "Data-Oriented Design" (Richard Fabian, livro online).
