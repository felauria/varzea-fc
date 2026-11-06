# Arquitetura — Várzea FC

Resumo técnico da fundação. Decisões de produto estão em [`PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md).

## Stack

| Peça | Versão | Papel |
|---|---|---|
| React | 19.3 | Shell da aplicação, telas, HUD e overlays |
| Phaser | 4.2 | Renderização do campo e loop da partida (WebGL) |
| TypeScript | 7.0 | Tipagem (`strict`, `verbatimModuleSyntax`, `erasableSyntaxOnly`) |
| Vite | 8.3 | Desenvolvimento e build |
| Vitest | 5.1 | Testes unitários (ambiente Node, sem DOM) |
| oxlint | 1.x | Lint (padrão atual do template oficial `create-vite`) |

As versões são as estáveis mais recentes no momento da instalação (nov/2026), seguindo o template `react-ts` do `create-vite`.
O template já usa oxlint em vez de ESLint. Além disso, o `typescript-eslint` ainda não suporta o TypeScript 7.

## Camadas

```text
React (app/, features/, components/)
   │  GameBridge (snapshot do HUD + comandos tipados)
   ▼
Phaser scenes (game/scenes/)        ← lê InputManager (game/input/)
   │  stepMatch(state, commands, dt, rng) → eventos
   ▼
Simulação pura (game/systems/, game/core/, domain/)
   ▲
Visual (game/entities/, game/assets/) — só lê o estado
```

### 1. Simulação pura (`game/core`, `game/systems`, `domain`)

- Não importa Phaser nem React. Roda no Node, por isso é testada diretamente.
- `MatchState` é um objeto simples e mutável. `stepMatch()` avança um passo fixo (1/60 s) e retorna `MatchEvent[]` (gol, chute, posse, desarme, fase).
- Aleatoriedade sempre por um `Rng` injetado (`createRng(seed)`), o que deixa os testes determinísticos.
- Módulos pequenos por responsabilidade:
  - `movement`: direção normalizada, aceleração, limites e colisão entre atletas.
  - `ballPhysics`: atrito exponencial, altura e quique, rebatida nos limites, rede, detecção de gol.
  - `possession`: domínio, espalmada do goleiro, desarme.
  - `kicks`: escolha do receptor (cone de mira, linha livre, avanço), planejamento de passes e chute.
  - `userControl`: aplica os comandos do usuário e faz a troca de jogador.
  - `ai/`: posicionamento por formação, portador da bola, goleiro e papéis do time (perseguidor, cobertura, apoio).
  - `matchSetup`, `matchEngine`: criação, saída de bola, fases e cronômetro.
- Todo o balanceamento fica em `game/core/tuning.ts`.

### 2. Input (`game/input`)

- `actions.ts`: ações abstratas (`shortPass`, `sprint`…) e mapeamento por `KeyboardEvent.code`, que independe do layout (ABNT2/US).
- `InputManager`: `isDown()` (contínuo) e `wasPressed()` (uma vez, ignora auto-repeat). Também chama `preventDefault` nas teclas do jogo (Espaço não rola a página) e ignora campos de texto. Ao perder o foco ou ao ocultar a aba, solta todas as teclas e avisa a cena, que pausa.
- `commands.ts` converte ações em `ControlCommands`. A simulação nunca vê teclas, então adicionar manete no futuro significa só uma nova fonte de `ActionReader`.

### 3. Phaser (`game/scenes`, `game/entities`, `game/assets`)

- `BootScene` carrega o `ASSET_MANIFEST` (vazio por enquanto) e gera os placeholders.
- `MatchScene` orquestra: lê o input, roda `stepMatch` em passo fixo com acumulador, sincroniza as views e publica o HUD. As ações únicas valem só no primeiro passo de cada quadro.
- O input nativo do Phaser fica desligado (`input: { keyboard: false, … }`) para não haver duas fontes de teclado.
- Views (`PitchView`, `PlayerView`, `BallView`) só leem o estado. Trocar placeholder por spritesheet acontece aqui, sem mexer nas regras.

### 4. React ⇄ Phaser (`GameBridge`, `GameCanvas`)

- `GameCanvas` cria o `Phaser.Game` num `useEffect` dependente de `deps` estáveis (criados uma vez com `useState`). Re-renderizações do HUD não recriam o jogo, e o desmonte chama `game.destroy(true)`.
- O canvas é dimensionado por `computeIntegerFit`: um `ResizeObserver` calcula o maior múltiplo **inteiro** de 640×360 que cabe (640×360 → 1280×720 → 1920×1080), e o Phaser (`Scale.FIT`) preenche esse quadro. Abaixo de 1× a escala é fracionária. Depois de cada redimensionamento chamamos `scale.getParentBounds()` antes de `scale.refresh()`, porque o `refresh` do Phaser usa o tamanho do pai em cache.
- `GameBridge` é o canal tipado:
  - Phaser → React: `publish(patch)` gera um snapshot imutável `MatchHudState`, lido com `useSyncExternalStore`. Só notifica quando algo muda.
  - React → Phaser: `send('pause' | 'resume' | 'restart')`, escutado pela cena com `onCommand`.
- HUD (placar, relógio) e overlays (gol, pausa, fim de jogo) são React. O canvas desenha só o jogo.

## Decisões registradas

| Decisão | Motivo |
|---|---|
| Resolução lógica 640×360 | 16:9, escala inteira para 720p (×2) e 1080p (×3); atletas de 10×16 px legíveis. |
| Campo "fechado" (bola rebate nas linhas) | Arcade, sem laterais/escanteios no protótipo; evita regras de reinício antes de validar a diversão. |
| Partida de um período (3 min) | O prompt permite simplificar; dois tempos de 2 min e intervalo vêm na Fase 2. |
| Controle segue a bola | Ao passar ou dominar, o controle vai ao receptor (padrão do gênero, reduz trocas manuais). |
| Goleiro sempre pela IA | Conforme o contexto; `Q` nunca seleciona o goleiro. |
| Uniformes por camadas | `kitSprite.ts` define um modelo em que cada pixel pertence a uma camada (camisa, detalhe, calção, meias…), e o padrão da camisa é uma função pura. Gera-se uma textura por uniforme em uso, nunca uma imagem por combinação. Com a arte final, o modelo vira uma máscara PNG com o mesmo papel. |
| Sem dependências extras | Nada de motor de física, roteador ou gerenciador de estado nesta fase. |
| StrictMode ligado | Em dev o React monta, desmonta e monta de novo; o `GameCanvas` destrói a primeira instância corretamente. |

## Limitações conhecidas

- Física e IA simples, de propósito. Com o usuário parado, o próprio time fica passivo (o atleta que domina passa a ser controlado).
- Sem áudio, animações por quadro, laterais/escanteios, faltas ou dois tempos.
- O bundle tem ~1,6 MB (430 kB gzip), quase todo do Phaser; dá para dividir em chunks quando houver mais telas.
- Os testes cobrem a simulação, o input e a ponte. A integração visual (Phaser/React) foi verificada manualmente no navegador.
