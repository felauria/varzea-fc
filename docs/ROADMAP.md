# Roadmap — Várzea FC

Alinhado às fases da seção 14 do [`PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md). Cada etapa deve terminar jogável e testada.

## ✅ Fase 1 — Protótipo de partida (concluída)

- Campo, gols, placar, cronômetro, pausa.
- 5×5 com goleiros; movimento em 8 direções normalizado; corrida.
- Posse, passe curto/profundidade/longo, finalização, desarme/pressão, troca de jogador.
- IA básica por papéis; goleiro que acompanha e defende.
- Detecção de gol, reinício, aviso de gol.
- Fundação: React + Phaser + ponte tipada, InputManager, testes.

## Fase 2 — Partida completa (próxima)

1. **Sessão de ajuste de jogabilidade** com testes manuais: velocidades, força dos passes, eficácia do desarme, chance de defesa do goleiro e frequência de chutes da IA (tudo em `tuning.ts`).
2. Dois tempos de 2 minutos, intervalo e troca de lado.
3. Encerramento com tela de resultado (já existe uma versão simples).
4. Reinícios: lateral, escanteio e tiro de meta (ou manter o campo fechado, se os testes mostrarem que é mais divertido; registrar a decisão).
5. Formações (`2-1-1`, `1-2-1`, `1-1-2`) e abordagem (ofensiva/equilibrada/defensiva) influenciando a IA de forma observável.
6. Atributos dos atletas (velocidade, passe, finalização, defesa, resistência) afetando a simulação; energia/fadiga na corrida.
7. Melhorias de IA: desmarques, linha defensiva, goleiro saindo nos cruzamentos.
8. Simulação automática de partida (sem renderização), reaproveitando `stepMatch` acelerado ou um modelo estatístico baseado em força.

## Fase 3 — Arte e uniformes

- Integrar spritesheets finais (parado, correndo, ação com a bola) via `ASSET_MANIFEST`.
- Máscaras de uniforme por camada sobre os sprites finais, reaproveitando `kitSprite.ts`.
- Editor de uniforme (6 padrões, cores de camisa/detalhe/calção/meias) com prévia.
- Contraste automático entre os uniformes dos times (`relativeLuminance` já existe em `domain/kit.ts`).
- Áudio básico (apito, chute, torcida).

## Fase 4 — Gestão

- Clubes fictícios, elenco, detalhes do jogador, nível geral.
- Táticas e escalação.
- Treinamento simplificado; mercado simplificado; economia centralizada em regras de domínio.

## Fase 5 — Competição e carreira

- Quatro clubes, turno único + final; pontuação 3/1/0.
- Calendário, simulação dos jogos sem o usuário, classificação, artilharia, premiação.

## Fase 6 — Persistência e acabamento

- Camada de persistência em LocalStorage com versão de esquema e validação/migração.
- Tela inicial (novo jogo / continuar), configurações (incluindo remapeamento de teclas), tela cheia.
- Tratamento de erros, responsividade e balanceamento final.

## Futuro (fora do MVP)

Gamepad (nova implementação de `ActionReader`), multiplayer, futebol 7/11, salvamento em nuvem.
