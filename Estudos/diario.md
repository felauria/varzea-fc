# Diário de estudos

Registre aqui, do mais recente para o mais antigo, o que foi aprendido no projeto.
O objetivo é fixar o conhecimento e criar um histórico do seu progresso, que pode virar portfólio e posts.

## Modelo de entrada

```markdown
### AAAA-MM-DD — título curto

**Trilha:** NN · **Tarefa:** link ou descrição · **Tempo:** ~Xh

**O que fiz:** …
**O que aprendi:** …
**O que deu errado / me surpreendeu:** …
**Dúvidas abertas:** …
**Próximo passo:** …
```

---

### 2026-11-06 — Fundação do projeto e primeira fatia jogável

**Trilha:** 01, 03, 04, 09 · **Tarefa:** fase 1 do roadmap

**O que foi feito:** projeto criado com React + Phaser + Vite + TypeScript. Partida 5×5 jogável contra a IA, com 55 testes unitários. O código está no GitHub em `felauria/varzea-fc`.

**Conceitos que já aparecem no código e valem estudar:**
- **Passo fixo com acumulador** (`MatchScene.update`): a simulação roda a 60 Hz independentemente da taxa de quadros.
- **Simulação pura separada da renderização** (`game/systems` × `game/entities`): é o que permite testar regras sem navegador.
- **RNG com semente** (`game/core/rng.ts`): testes determinísticos, base para replays.
- **Ações abstratas de input** (`game/input`): o mesmo jogo poderá aceitar manete sem mudar as regras.
- **Ponte tipada React ⇄ Phaser com `useSyncExternalStore`** (`game/bridge`).
- **IA por papéis** (perseguidor, cobertura, apoio), uma forma simples de utility/role-based AI.

**Bug interessante:** o canvas não acompanhava o redimensionamento porque `scale.refresh()` do Phaser usa o tamanho do elemento pai em cache. Lição: ler o código-fonte da biblioteca quando o comportamento contradiz a documentação.
