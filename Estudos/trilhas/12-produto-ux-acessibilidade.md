# 12 — Produto, UX e acessibilidade

**Nível:** 🟢 → 🟡 · **Pré-requisitos:** nenhum · **Status:** não iniciada

## Objetivo

Aprender a decidir **o que** construir e **se funcionou**: playtest, métricas, balanceamento com dados, onboarding, acessibilidade e internacionalização. Habilidades que diferenciam um dev que entrega *produto* de um que só entrega *código*.

## Por que neste projeto

O pilar nº 1 do `PROJECT_CONTEXT.md` é "futebol divertido primeiro". Diversão não se prova com testes unitários: precisa de pessoas jogando e de dados. Jogos também têm guias de acessibilidade bem maduros para estudar e aplicar.

## Conceitos

- **Playtest**: roteiro, observação sem interferir, perguntas abertas, sessões curtas e frequentes.
- **Métricas de jogo**: duração, gols, posse, taxa de acerto de passe, abandono; funis.
- **Balanceamento**: hipótese → mudança em `tuning.ts` → medir → decidir.
- **Onboarding**: ensinar os controles jogando (tutorial contextual).
- **Acessibilidade em jogos**: remapeamento de teclas, daltonismo (contraste de uniformes!), redução de movimento (screen shake), legendas, velocidade de jogo.
- **i18n**: textos extraídos, formatos de número/tempo.
- **Pesquisa com usuários**: entrevistas e questionários curtos.

## Prática no Várzea FC

### 🟢 Etapa 1 — Ouvir jogadores

- [ ] Escrever um **roteiro de playtest** de 10 minutos e rodar com 3 pessoas. Registrar no diário o que confundiu, o que divertiu e o que frustrou.
- [ ] Listar as 3 maiores dores e transformar em tarefas no `backlog.md`.
- [ ] **Tutorial contextual** na primeira partida: dicas que aparecem na hora certa ("aperte Espaço para passar").

### 🟡 Etapa 2 — Dados e acessibilidade

- [ ] Painel de estatísticas pós-jogo (posse, chutes, passes certos), que também serve à trilha 06 (narrador).
- [ ] **Remapeamento de teclas** salvo localmente (o `InputManager` já recebe `KeyBindings` no construtor).
- [ ] **Contraste automático de uniformes**: se os dois times forem parecidos (`relativeLuminance` em `domain/kit.ts`), o visitante usa o segundo uniforme. Testar com simuladores de daltonismo.
- [ ] Opção "reduzir movimento" (desliga screen shake e animações fortes) respeitando `prefers-reduced-motion`.
- [ ] Rodar a auditoria de acessibilidade (Lighthouse/axe) nas telas React e corrigir problemas.
- [ ] Preparar **i18n** (pt-BR padrão, en como segunda língua) para os textos da interface.

## Referências

- Game Accessibility Guidelines: https://gameaccessibilityguidelines.com
- Xbox Accessibility Guidelines (documentação pública da Microsoft).
- *Playtesting* (Celia Hodent, *The Gamer's Brain*).
- WCAG 2.2 (para as telas de gestão).
