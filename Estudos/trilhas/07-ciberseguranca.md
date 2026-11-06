# 07 — Cibersegurança

**Nível:** 🟢 → 🔴 · **Pré-requisitos:** nenhum (acompanha todas as trilhas) · **Status:** não iniciada

## Objetivo

Pensar como atacante para construir como defensor: **modelar ameaças**, proteger a **cadeia de suprimentos**, endurecer o **frontend**, validar **dados não confiáveis** (saves, replays, entradas de LLM), proteger **segredos** e, quando houver backend, aplicar o **OWASP Top 10**.

## Por que neste projeto

Um jogo é um alvo clássico: jogadores tentam trapacear, editar saves e manipular rankings. O projeto também passa por todas as camadas (frontend, CI, nuvem, backend futuro, LLM), cada uma com riscos próprios. Segurança aqui é prática, não teoria.

> Ética: todos os testes de ataque são feitos **no seu próprio projeto e ambientes**. Nunca contra sistemas de terceiros sem autorização.

## Conceitos

- **Modelagem de ameaças** (STRIDE), superfície de ataque e fronteiras de confiança.
- **Cliente nunca é confiável**: tudo que roda no navegador pode ser lido e alterado (DevTools, `window.__varzea`, localStorage).
- **Cadeia de suprimentos**: dependências npm, lockfile, *typosquatting*, scripts de instalação, *actions* de terceiros no CI.
- **Headers de segurança**: CSP, `X-Content-Type-Options`, `Referrer-Policy`, HSTS.
- **Validação de dados não confiáveis**: schema, versão, limites; por que um "hash" ou HMAC no cliente *não* impede adulteração.
- **Segredos**: nada no repositório nem no bundle; OIDC no CI; rotação.
- **Anti-cheat**: validação autoritativa no servidor; a simulação determinística permite **reexecutar o replay** e conferir o placar.
- **OWASP Top 10** (web/API) e **OWASP Top 10 for LLM** (prompt injection, vazamento, ferramentas com permissão excessiva).
- **Privacidade (LGPD)**: dados mínimos, consentimento, retenção.

## Prática no Várzea FC

### 🟢 Etapa 1 — Higiene básica

- [ ] Escrever `SECURITY.md` (como reportar vulnerabilidades) e um **modelo de ameaças** do estado atual em `docs/` (SPA estática: quais ativos existem? quem atacaria? o quê?).
- [ ] Rodar `npm audit` e ativar Dependabot alerts + **secret scanning** e **push protection** no GitHub.
- [ ] Garantir que o gancho `window.__varzea` não existe no build de produção (teste automatizado procurando a string no `dist/`).
- [ ] Ativar o **CodeQL** (SAST) no GitHub Actions.

### 🟡 Etapa 2 — Frontend e dados

- [ ] Definir uma **Content Security Policy** restritiva no deploy (sem `unsafe-inline` nos scripts) e testar se o jogo continua funcionando.
- [ ] Na camada de persistência (Fase 6), **validar o save** com schema (ex.: `zod`/`valibot`), versão e limites (atributos 0–99, saldo não negativo). Escrever testes com saves malformados e maliciosos.
- [ ] **Exercício de ataque**: editar o save no DevTools para ganhar dinheiro infinito. Documentar por que isso é aceitável num jogo offline e o que mudaria com um ranking online.
- [ ] Fixar *actions* de terceiros do CI por **SHA** e definir `permissions:` mínimas nos workflows.
- [ ] Gerar **SBOM** (CycloneDX) e checar licenças das dependências.

### 🔴 Etapa 3 — Servidor, anti-cheat e LLM

- [ ] **Ranking à prova de trapaça** (com a trilha 11): o cliente envia o replay `{seed, comandos}`, o servidor reexecuta `stepMatch` e só aceita o placar se bater. Tentar burlar o próprio sistema (comandos impossíveis, replay forjado, *replay attack*).
- [ ] **OWASP Top 10 na API**: autenticação, autorização por recurso (IDOR), *rate limiting*, validação de entrada, logs sem dados sensíveis.
- [ ] Rodar o **OWASP ZAP** contra o ambiente de staging.
- [ ] **Segurança de LLM** (trilha 06): testes de *prompt injection* via nomes de clube/jogador, ferramentas com permissão mínima e saída do modelo tratada como dado não confiável.
- [ ] **OIDC** do GitHub Actions para a AWS e políticas IAM de menor privilégio (trilha 02).
- [ ] Fazer um **mini-CTF** pessoal: esconder uma "flag" no backend de staging e tentar obtê-la explorando uma falha plantada de propósito. Depois corrigir e escrever um *post-mortem*.

## Para ir além

- Assinatura de builds e proveniência (SLSA, `npm --provenance` se publicar pacotes).
- Ofuscação × segurança real: por que ofuscar o JS do jogo não impede trapaça.
- Estudar casos reais de trapaça em jogos online e como foram mitigados.

## Referências

- OWASP Top 10: https://owasp.org/www-project-top-ten · OWASP ASVS · OWASP Cheat Sheet Series
- OWASP Top 10 for LLM Applications: https://genai.owasp.org
- *Threat Modeling: Designing for Security* (Adam Shostack).
- MDN: Content Security Policy · GitHub Docs: Security hardening for GitHub Actions.
- LGPD (Lei 13.709/2018), para coleta de dados de jogadores.
