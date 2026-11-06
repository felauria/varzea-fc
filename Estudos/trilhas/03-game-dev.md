# 03 — Desenvolvimento de jogos

**Nível:** 🟢 → 🔴 · **Pré-requisitos:** nenhum · **Status:** iniciada (fundação da Fase 1)

## Objetivo

Entender como um jogo é construído e por que ele é *gostoso* de jogar: loop, física arcade, input, animação, câmera, áudio, *game feel*, design de mecânicas, balanceamento e playtest.

## Por que neste projeto

Um jogo de futebol junta quase tudo de game dev em um escopo pequeno: física simples, IA, input responsivo, animação, interface e regras. As fases 2 e 3 do roadmap são, na prática, esta trilha.

## Conceitos

- **Game loop e passo fixo**: `MatchScene.update` acumula o tempo e chama `stepMatch` a 60 Hz. Entenda por que isso evita física diferente em monitores de 60 e 144 Hz.
- **Separação simulação × apresentação**: o estado é a verdade, e as views só desenham.
- **Game feel / juice**: screen shake, hit-stop, partículas, squash & stretch, som, feedback imediato.
- **Física arcade**: atrito exponencial, quique, colisão círculo-círculo, rebatida; *coyote time* e *input buffering*.
- **Animação**: spritesheets, máquinas de estado de animação, 4/8 direções, interpolação.
- **Pixel art**: escala inteira, paleta, legibilidade em resolução baixa.
- **Câmera**: seguir a bola, zoom, limites, *look-ahead*.
- **Áudio**: Web Audio, mixagem, som posicional, variação aleatória de pitch.
- **Game design**: loop central, risco × recompensa, curva de dificuldade, *readability*.
- **ECS × orientação a objetos** (ligação com a trilha 09).

## Prática no Várzea FC

### 🟢 Etapa 1 — Completar a partida (Fase 2)

- [ ] Dois tempos de 2 minutos, intervalo e troca de lado (mexe em `matchSetup`, `pitch` e no HUD).
- [ ] Barra de força no chute: segurar `J` carrega a potência e soltar chuta. Dica: o `InputManager` precisará de um evento de "soltou".
- [ ] **Input buffering**: apertar passe alguns quadros *antes* de dominar a bola ainda executa o passe.
- [ ] Indicador do receptor do passe (seta ou círculo no alvo do `pendingPass`).
- [ ] Decidir e implementar laterais/escanteios ou manter o campo fechado, depois de jogar as duas versões. Registrar a decisão.

### 🟡 Etapa 2 — Game feel e apresentação

- [ ] *Juice* no gol: hit-stop de 100 ms, partículas de confete, flash na rede.
- [ ] Rastro da bola nos chutes fortes e sombra que cresce com a altura.
- [ ] Câmera com zoom leve e acompanhamento da bola (opcional: testar se melhora ou piora a leitura).
- [ ] **Áudio** com Web Audio: chute, passe, apito, torcida que reage à proximidade do gol.
- [ ] Animação por quadros: parado, correndo e chute, com máquina de estados de animação separada das regras.
- [ ] Integrar os primeiros sprites finais via `ASSET_MANIFEST`, com uniforme por máscara.

### 🔴 Etapa 3 — Design e sistemas

- [ ] **Editor de uniforme** (Fase 3) com prévia ao vivo, reaproveitando `composeKitSprite`.
- [ ] **Replays e melhores momentos**: reproduzir os últimos 8 s antes de cada gol (depende do projeto-ponte de replays).
- [ ] **Atributos** (velocidade, passe, finalização, defesa, resistência) afetando a simulação, com fadiga no sprint.
- [ ] Sessão de **balanceamento guiado por dados** com o simulador headless (ligação com as trilhas 04 e 12).
- [ ] Protótipo de **modo treino**: cobrança de pênaltis ou rondo, como mecânica isolada para testar o *feel*.

## Para ir além

- Reescrever a simulação em ECS (bitECS/miniplex) e comparar com a abordagem atual.
- Game jam de fim de semana: criar um minijogo usando o motor do Várzea FC.
- Portar a simulação para rodar em um Web Worker (ligação com a trilha 08).

## Referências

- *Game Programming Patterns* (Robert Nystrom), gratuito em https://gameprogrammingpatterns.com. Leia "Game Loop", "Update Method", "State" e "Component".
- "Fix Your Timestep!" (Glenn Fiedler), artigo clássico sobre passo fixo.
- Palestra "Juice it or lose it" (Jonasson & Purho) e *Game Feel* (Steve Swink).
- *The Art of Game Design: A Book of Lenses* (Jesse Schell).
- Documentação e exemplos do Phaser 4: https://phaser.io, além das *skills* em `node_modules/phaser/skills/`.
