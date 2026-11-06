# Várzea FC

Jogo web de futebol híbrido: gerenciamento de clube + partidas 2D em pixel art, 5 contra 5, jogadas pelo teclado.

> A fonte de verdade sobre conceito, escopo e decisões de produto é o [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md).
> Arquitetura: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). Próximas etapas: [`docs/ROADMAP.md`](docs/ROADMAP.md).
> O projeto também é um laboratório de aprendizado: trilhas de estudo em [`Estudos/`](Estudos/README.md).

## Estado atual

**Fase 1 — protótipo de partida.** Uma partida 5×5 jogável no navegador contra a IA, com placeholders visuais.
Ainda não há menus, carreira, gerenciamento nem persistência.

## Pré-requisitos

- Node.js 20.19+ ou 22.12+ (desenvolvido com Node 24)
- npm 10+
- Navegador desktop com WebGL (Chrome, Edge, Firefox ou Safari recentes)

## Instalação e comandos

```bash
npm install
```

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento em http://localhost:5173 |
| `npm test` | Testes unitários (Vitest) |
| `npm run test:watch` | Testes em modo observação |
| `npm run lint` | Lint (oxlint) |
| `npm run typecheck` | Verificação de tipos (TypeScript) |
| `npm run build` | Typecheck + build de produção em `dist/` |
| `npm run preview` | Serve o build de produção localmente |

## Como jogar

Você controla o **Várzea FC** (azul e branco, ataca para a direita) contra o **Unidos do Morro** (vermelho).
O atleta controlado tem uma seta amarela sobre a cabeça; quem está com a bola tem um anel branco nos pés.

| Tecla | Ação |
|---|---|
| `W` `A` `S` `D` | Movimentar |
| `Shift` | Correr |
| `Espaço` | Passe curto |
| `K` | Passe em profundidade (à frente do companheiro) |
| `L` | Passe longo (pelo alto, passa por cima dos adversários) |
| `J` | Finalizar (segure `W`/`S` para escolher o canto) |
| `E` | Desarme (toque) / pressão no portador (segure, sem direção) |
| `Q` | Trocar para o jogador mais próximo da bola |
| `Esc` | Pausar / retomar |

Dicas:

- Passes e chutes usam a direção pressionada; sem direção, usam para onde o atleta está virado.
- Ao passar, o controle vai para o receptor, que se aproxima da bola automaticamente se você não mexer nele.
- Quando um companheiro domina a bola, o controle passa para ele.
- A partida dura 3 minutos de bola rolando. O relógio para nas comemorações de gol e saídas de bola.
- Se a janela perder o foco, o jogo pausa sozinho e solta todas as teclas.

## Estrutura

```text
src/
  app/            # raiz React e estilos globais
  components/     # componentes compartilhados (GameCanvas monta o Phaser)
  features/match/ # tela da partida: placar, overlays e legenda de controles
  domain/         # modelos puros: formações, uniformes, times fictícios
  shared/         # utilitários (escala inteira do canvas)
  game/
    core/         # tipos, vetores, geometria do campo, ajustes e RNG (puros)
    systems/      # regras e simulação da partida (puras, testadas): movimento, bola, posse, chutes, IA
    input/        # ações abstratas, InputManager e tradução para comandos
    entities/     # representação visual (Phaser) de campo, atletas e bola
    scenes/       # cenas Phaser: Boot (assets) e Match (orquestração)
    assets/       # manifesto de assets e placeholders gerados (uniformes por camadas)
    bridge/       # ponte tipada React ⇄ Phaser
public/assets/    # onde entrarão as pixel arts finais
```

## Depuração

Em modo de desenvolvimento, `window.__varzea` expõe o estado da partida (`getState()`), o `InputManager` e a cena, para inspeção no console. O gancho não existe no build de produção.
