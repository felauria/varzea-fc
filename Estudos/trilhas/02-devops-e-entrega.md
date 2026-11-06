# 02 — DevOps e entrega

**Nível:** 🟢 → 🔴 · **Pré-requisitos:** git básico, trilha 01 (etapa 1) · **Status:** não iniciada

## Objetivo

Levar o código do commit ao navegador dos jogadores de forma **automática, segura e observável**: CI, deploy contínuo, ambientes de preview, versionamento, infraestrutura como código e monitoramento.

## Por que neste projeto

O Várzea FC é uma aplicação estática (HTML + JS), perfeita para começar DevOps sem servidor. Quando houver backend (trilha 11), a mesma base cresce para containers e nuvem. Ter o jogo publicado também deixa amigos jogarem, e isso alimenta o playtest (trilha 12).

## Conceitos

- **CI (integração contínua)**: cada push roda lint, tipos, testes e build.
- **CD (entrega/deploy contínuo)**: merge na `main` publica automaticamente.
- **Ambientes**: produção, staging e preview por pull request.
- **Fluxo de branches**: trunk-based × GitFlow; proteção de branch; revisão de PR.
- **Versionamento semântico** e **Conventional Commits**; changelog automático.
- **Infraestrutura como código** (Terraform): o ambiente descrito em arquivos versionados.
- **Containers** (Docker) e ambientes de desenvolvimento reproduzíveis (Dev Containers).
- **Observabilidade**: logs, métricas, rastreamento de erros e Web Vitals.
- **DORA metrics**: frequência de deploy, lead time, taxa de falha e tempo de recuperação.

## Prática no Várzea FC

### 🟢 Etapa 1 — Pipeline básico

- [ ] Criar `.github/workflows/ci.yml`: `npm ci` → `lint` → `typecheck` → `test` → `build`, com cache de `node_modules`.
- [ ] Proteger a `main` no GitHub: exigir CI verde e PR (mesmo trabalhando sozinho, para praticar o fluxo).
- [ ] Adotar Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`…) e escrever o guia em `CONTRIBUTING.md`.
- [ ] Ativar Dependabot (ou Renovate) para atualizar dependências com PRs automáticos.
- [ ] Publicar no **GitHub Pages** via Actions (ajustar `base` no `vite.config.ts`).

### 🟡 Etapa 2 — Entrega profissional

- [ ] **Preview por PR** (Cloudflare Pages, Netlify ou Vercel): cada PR ganha uma URL para testar a mudança.
- [ ] Rodar os E2E do Playwright no CI contra o build (ligação com a trilha 01), com upload de trace/vídeo quando falhar.
- [ ] **Orçamento de bundle**: falhar o CI se o JS passar de X kB gzip (ex.: `size-limit`).
- [ ] **Lighthouse CI** para acompanhar desempenho e acessibilidade.
- [ ] **Releases automáticas** com `release-please` ou `semantic-release`: tag, changelog e número de versão exibido no jogo.
- [ ] **Monitoramento de erros** no navegador (ex.: Sentry, plano gratuito), com source maps enviados no deploy.
- [ ] Criar um **Dev Container** (`.devcontainer/`) para abrir o projeto pronto em qualquer máquina ou no Codespaces.

### 🔴 Etapa 3 — Infraestrutura própria

- [ ] Publicar em **AWS S3 + CloudFront** descrito em **Terraform** (bucket privado + OAC, HTTPS, cache por hash de arquivo). É o mesmo padrão de infraestrutura usado em empresas.
- [ ] Separar `staging` e `production` com workspaces/variáveis do Terraform e aprovação manual para produção.
- [ ] Autenticar o GitHub Actions na AWS via **OIDC** (sem chaves fixas). Liga-se com a trilha 07.
- [ ] **CI de balanceamento**: um job agendado roda o simulador headless (1.000 partidas) e publica estatísticas como artefato/comentário no PR.
- [ ] Quando houver backend (trilha 11): Dockerfile multi-stage, `docker compose` local, deploy em container e health checks.
- [ ] Medir as **DORA metrics** do próprio projeto por um mês.

## Para ir além

- Feature flags (liberar uma mecânica nova só para parte dos jogadores).
- Deploy canário e rollback automático.
- Kubernetes/Helm quando houver serviços (só se fizer sentido; não force).

## Referências

- GitHub Actions: https://docs.github.com/actions · Terraform: https://developer.hashicorp.com/terraform
- Livros: *Accelerate* (Forsgren, Humble, Kim); *The DevOps Handbook*.
- Conventional Commits: https://www.conventionalcommits.org · Semantic Versioning: https://semver.org
