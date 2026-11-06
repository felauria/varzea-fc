# 01 — Testes e qualidade

**Nível:** 🟢 → 🔴 · **Pré-requisitos:** TypeScript básico · **Status:** iniciada (55 testes unitários existentes)

## Objetivo

Saber escolher **o tipo certo de teste para cada risco**: unitário, propriedade, integração, E2E, regressão visual, mutação e simulação. Também saber medir se os testes de fato protegem o código, e não só se a cobertura está alta.

## Por que neste projeto

Jogos são difíceis de testar por causa de tempo real, aleatoriedade e renderização. O Várzea FC já separa a simulação pura (`src/game/systems`) da renderização (`src/game/entities`), então dá para praticar todos os níveis da pirâmide:

```text
          ▲  E2E (Playwright): abrir o jogo, pausar, marcar gol
         ▲▲  Integração: InputManager + MatchScene; React + GameBridge
       ▲▲▲▲  Unitários / propriedade: vec2, pitch, kicks, possession
     ▲▲▲▲▲▲  Simulação: milhares de partidas IA × IA com invariantes
```

## Conceitos

- **Pirâmide de testes** e o custo de cada camada (velocidade × confiança × fragilidade).
- **Determinismo**: RNG com semente (`createRng`) e passo fixo tornam a simulação reproduzível.
- **Testes de propriedade**: em vez de exemplos, afirmar regras que valem para *qualquer* entrada (ex.: "a velocidade nunca passa do máximo").
- **Testes de mutação**: alteram o código de propósito e verificam se algum teste falha. Medem a *qualidade* dos testes.
- **Snapshot/golden files**: comparar uma saída com uma referência aprovada (replays, estatísticas).
- **Regressão visual**: comparar screenshots do canvas.
- **Test doubles**: fakes, stubs e mocks (o teste do `InputManager` usa um `EventTarget` falso).
- **TDD** como ferramenta de design, e não como religião.

## Prática no Várzea FC

### 🟢 Etapa 1 — Fundamentos e cobertura

- [ ] Ler os testes existentes (`src/**/*.test.ts`) e anotar no diário que técnica cada um usa.
- [ ] Ativar cobertura (`@vitest/coverage-v8`), rodar `npx vitest run --coverage` e listar os arquivos menos cobertos.
- [ ] Escrever testes para `ai/goalkeeper.ts` (`goalkeeperGuardPosition`, `predictInterceptY`), que hoje só são testados indiretamente.
- [ ] Escrever testes para `ballPhysics.ts`: bola no fundo da rede, rede lateral, quique com `z > 0`.
- [ ] Praticar TDD na próxima regra da Fase 2 (ex.: troca de lado no intervalo): teste primeiro, código depois.

### 🟡 Etapa 2 — Propriedade, integração e E2E

- [ ] Adicionar `fast-check` e escrever propriedades:
  - `normalize(v)` tem comprimento 0 ou 1;
  - `directionFromAxes` nunca passa de comprimento 1;
  - `detectGoal` é simétrico (espelhar a jogada troca o time que marcou);
  - após `separatePlayers`, nenhum par fica sobreposto.
- [ ] Teste de **invariantes da simulação**: rodar N partidas com sementes diferentes e afirmar que a bola nunca sai do campo, ninguém fica com `NaN` e o placar só sobe.
- [ ] Testes de componente React (`@testing-library/react` + `jsdom`) para `MatchOverlays` e `Scoreboard`.
- [ ] **E2E com Playwright**: abrir o jogo, pressionar `Esc` e verificar o overlay, disparar `blur` e verificar a pausa, forçar um gol via `window.__varzea` e verificar o placar.
- [ ] Rodar os E2E em Chromium, Firefox e WebKit.

### 🔴 Etapa 3 — Qualidade dos testes e regressões difíceis

- [ ] **Teste de mutação** com StrykerJS em `src/game/systems`. Investigar os mutantes sobreviventes e melhorar os testes.
- [ ] **Golden replays** (depende do projeto-ponte de replays): gravar 3 partidas e garantir que o placar e o hash do estado final não mudam sem intenção.
- [ ] **Regressão visual** do campo e dos uniformes com `toHaveScreenshot` do Playwright (cuidado com WebGL/headless: fixar viewport e semente).
- [ ] **Testes estatísticos de balanceamento**: "em 500 partidas IA × IA com times iguais, a taxa de vitória de cada lado fica entre 40% e 60%". Entender falsos positivos e intervalos de confiança.
- [ ] **Benchmarks** com `vitest bench` para `stepMatch` (ligação com a trilha 08).

## Para ir além

- Fuzzing do `InputManager` com sequências aleatórias de teclas.
- Testes de contrato da `GameBridge` quando houver mais telas.
- Escrever um ADR sobre a estratégia de testes do projeto.

## Referências

- Vitest: https://vitest.dev · Playwright: https://playwright.dev · fast-check: https://fast-check.dev · StrykerJS: https://stryker-mutator.io
- Livro: *Unit Testing: Principles, Practices, and Patterns* (Vladimir Khorikov).
- Palestra da Rare (GDC) sobre testes automatizados em *Sea of Thieves*.
