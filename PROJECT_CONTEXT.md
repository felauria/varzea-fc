# Várzea FC — Contexto do Projeto

> Documento de referência do produto. Deve ser lido antes de qualquer implementação e atualizado quando decisões relevantes forem alteradas.

**Versão:** 0.2  
**Status:** Conceito definido; desenvolvimento do MVP ainda não iniciado  
**Gênero:** Futebol arcade + gerenciamento de clube + estratégia  
**Plataforma inicial:** Navegador desktop  
**Modo inicial:** Single-player  
**Direção visual:** Pixel art 2D, visão top-down  

---

## 1. Visão geral

**Várzea FC** é um jogo web de futebol híbrido. O jogador começa com um clube pequeno, monta e administra seu elenco, define formações e estratégias e também entra em campo para controlar diretamente os atletas durante as partidas.

A proposta combina três experiências:

1. **Gestão:** administrar elenco, orçamento, contratações e treinamento.
2. **Estratégia:** escolher escalações, formações e comportamento tático.
3. **Ação:** jogar partidas de futebol em tempo real, controlando um atleta por vez enquanto os demais são conduzidos por uma IA simples.

O jogador também poderá optar por simular automaticamente uma partida, sem controlá-la diretamente.

O objetivo de longo prazo é transformar um clube modesto em uma equipe de destaque, conquistando competições e evoluindo sua estrutura.

## 2. Pilares de experiência

- **Futebol divertido primeiro:** a partida precisa ser agradável de jogar antes de o gerenciamento ganhar profundidade.
- **Gestão com consequências:** contratações, treinamento, tática e orçamento devem influenciar o desempenho do time.
- **Identidade do clube:** o jogador deve reconhecer seu time, especialmente por meio do uniforme personalizado.
- **Fácil de começar, com espaço para evoluir:** os controles e regras iniciais devem ser simples, mas a arquitetura deve permitir adicionar profundidade.
- **Projeto incremental:** entregar fatias funcionais e testáveis, sem tentar construir todos os sistemas simultaneamente.

## 3. Plataforma e controles

### 3.1. Plataforma do MVP

- Jogo executado no navegador, prioritariamente em computadores desktop.
- Interface adaptável a diferentes tamanhos de janela, com foco em telas widescreen e 1920×1080.
- O usuário poderá jogar a partida usando **teclado**.
- O mouse poderá ser usado nos menus de gerenciamento.
- A aplicação deverá permitir modo de tela cheia, mas não depender dele.

### 3.2. Manete / gamepad

**Gamepad não faz parte do MVP.** O suporte a controles USB/Bluetooth (Xbox, PlayStation ou compatíveis) será uma implementação futura.

A arquitetura de entrada deverá ser independente do dispositivo sempre que isso não gerar complexidade excessiva. As mecânicas devem consumir ações abstratas, e não depender diretamente de eventos de teclado. Isso facilitará adicionar gamepad depois, mas não se deve implementar nem testar suporte a manete nesta primeira versão.

### 3.3. Mapeamento inicial do teclado

| Tecla | Ação |
|---|---|
| `W` `A` `S` `D` | Movimentar o jogador controlado |
| `Espaço` | Passe curto |
| `J` | Finalização |
| `K` | Passe em profundidade |
| `L` | Passe longo |
| `Shift` | Correr / sprint |
| `Q` | Trocar jogador controlado |
| `E` | Desarme / pressão defensiva |
| `Esc` | Pausar / abrir menu de pausa |

Os comandos devem ser configuráveis futuramente. O sistema de input deve impedir que teclas como `Espaço` e setas provoquem scroll da página enquanto o jogo estiver ativo. Também deve lidar corretamente com perda de foco da janela para evitar que o jogador continue andando por causa de uma tecla que ficou marcada como pressionada.

## 4. Direção visual e pixel art

### 4.1. Estética

- Pixel art 2D moderna.
- Câmera top-down (visão de cima), mostrando o campo inteiro durante a partida.
- Leitura visual clara: bola, jogadores, gols, limites do campo e equipes devem ser fáceis de distinguir.
- Interface de gerenciamento com aparência de jogo esportivo moderno, sem abandonar a identidade visual do projeto.
- Animações e efeitos devem priorizar legibilidade e resposta aos comandos.

### 4.2. Produção dos assets

As pixel arts do Várzea FC serão produzidas especificamente para o projeto pelo assistente e entregues como arquivos de imagem organizados para integração. Não buscar sprites aleatórios na internet nem usar artes de jogos comerciais.

Enquanto os assets finais não estiverem disponíveis, o desenvolvimento poderá usar placeholders claramente temporários (formas simples ou sprites provisórios). O código deve permitir substituir esses placeholders pelos assets finais sem reescrever a lógica do jogo.

A estrutura de assets deverá prever, no mínimo:

- Jogadores e animações de movimento.
- Goleiros.
- Bola.
- Campo, linhas, áreas e gols.
- Elementos de estádio, quando necessários.
- Ícones e elementos da interface.
- Máscaras e padrões dos uniformes.
- Escudos fictícios dos clubes, conforme forem criados.

Manter escala, paleta, proporções, transparência e estilo consistentes entre todos os assets. Definir dimensões finais dos sprites após validar a escala dos personagens dentro do campo; não misturar tamanhos de frames dentro de um mesmo spritesheet.

### 4.3. Animações

A primeira versão deve priorizar as animações essenciais para a leitura do jogo: parado, correndo e ação com a bola. A implementação poderá começar com poucas direções e evoluir depois, desde que a organização dos spritesheets permita adicionar frames e direções sem alterar as regras da partida.

## 5. Personalização do clube e dos uniformes

A personalização de uniforme é parte do MVP, não uma ideia reservada para uma expansão futura.

O jogador poderá configurar o uniforme do próprio clube com:

- Cor principal da camisa.
- Cor secundária.
- Cor de detalhes.
- Padrão da camisa.
- Cor do calção.
- Cor das meias.

### 5.1. Padrões iniciais

1. Camisa lisa.
2. Listras verticais.
3. Listras horizontais.
4. Faixa diagonal.
5. Metade a metade.
6. Faixa central.

### 5.2. Requisitos técnicos

- Mostrar uma prévia do uniforme no editor.
- Aplicar a aparência escolhida a todos os jogadores de linha do clube durante a partida.
- Manter o uniforme do goleiro visualmente distinto.
- Garantir contraste suficiente entre os dois times para que o jogador identifique rapidamente cada equipe.
- Salvar as escolhas na carreira.
- Evitar gerar ou armazenar uma imagem diferente para cada combinação de cores.
- Preferir sprites-base com máscaras, camadas de cor e padrões aplicados dinamicamente.
- A aparência personalizada deve funcionar nas direções e animações disponíveis.

A implementação exata (por exemplo, texturas geradas em canvas, máscaras ou composição de camadas no Phaser) deverá ser escolhida pelo Claude Code após avaliar a abordagem mais simples e confiável para o projeto. A solução precisa ser reutilizável e fácil de testar.

## 6. Partidas de futebol

### 6.1. Formato do MVP

- Futebol **5 contra 5**: um goleiro e quatro jogadores de linha por equipe.
- Campo horizontal visto de cima.
- Partidas em tempo real.
- Dois tempos de dois minutos cada, com intervalo.
- Partidas single-player contra equipes controladas pela IA.
- O jogador controla diretamente um atleta por vez.
- Companheiros e adversários são controlados por IA.
- Placar, cronômetro, gols e encerramento de partida.

O 5 contra 5 é uma decisão de escopo para viabilizar uma experiência divertida antes de aumentar a complexidade para futebol 7 ou 11.

### 6.2. Mecânicas essenciais

- Movimentação em oito direções com velocidade diagonal normalizada.
- Bola com movimento, colisões e desaceleração básicos.
- Posse e condução de bola.
- Passe curto.
- Passe em profundidade.
- Passe longo.
- Finalização.
- Corrida / sprint.
- Desarme e pressão.
- Troca do jogador controlado.
- Goleiro controlado por IA.
- Detecção de gol, reinício após gol e atualização do placar.
- Pausa e retomada da partida.

As ações devem considerar direção de movimento, direção do gol, posição dos companheiros e contexto básico da partida. Não exigir precisão de simulação de futebol real no MVP; priorizar controles responsivos e regras consistentes.

### 6.3. IA inicial

A IA deve ser simples, legível e suficientemente funcional para criar uma partida:

- Jogadores próximos à bola podem pressionar ou disputar a posse.
- Companheiros sem a bola devem ocupar espaços úteis conforme sua posição.
- Atletas devem tentar apoiar jogadas e oferecer opções de passe.
- Jogadores em posição defensiva devem proteger a região do próprio gol.
- O goleiro deve acompanhar a bola e tentar defender finalizações dentro de sua área.
- O time adversário deve conseguir avançar, passar e finalizar de forma básica.

Não implementar aprendizado de máquina. Usar regras e estados de comportamento simples, separados em módulos que possam evoluir.

### 6.4. Formações iniciais

O goleiro é fixo e não entra na contagem dos quatro jogadores de linha:

- `2-1-1`: dois defensores, um meio-campista e um atacante.
- `1-2-1`: um defensor, dois meio-campistas e um atacante.
- `1-1-2`: um defensor, um meio-campista e dois atacantes.

A formação escolhida deve influenciar o posicionamento e o comportamento da IA.

### 6.5. Partida manual ou simulada

O jogador poderá:

- Jogar a partida manualmente pelo teclado; ou
- Solicitar uma simulação automática.

A simulação deverá considerar, de maneira simplificada, os atributos dos atletas, a formação, a estratégia e a força relativa das equipes. Não deve ser um resultado puramente aleatório.

## 7. Gerenciamento do clube

O gerenciamento será introduzido depois que o núcleo de partidas estiver funcional.

### 7.1. Central do clube

Deverá exibir:

- Nome e identidade do clube.
- Saldo financeiro.
- Próxima partida.
- Últimos resultados.
- Situação na competição.
- Resumo do elenco.
- Acesso às demais áreas do jogo.

### 7.2. Elenco e jogadores

Cada jogador deverá possuir, no mínimo:

- Nome fictício.
- Posição principal.
- Idade.
- Nível geral calculado.
- Velocidade.
- Finalização.
- Passe.
- Defesa.
- Resistência.
- Energia / condição física.

Os valores devem afetar o comportamento e o desempenho dos jogadores em campo. Atributos e fórmulas devem ser definidos em um módulo de domínio, sem duplicar regras na interface.

### 7.3. Treinamento

Permitir selecionar um jogador e realizar um treinamento simplificado que evolua gradualmente um atributo. O sistema deve respeitar limites de atributo e custos ou restrições definidos para a economia do MVP.

### 7.4. Mercado

Disponibilizar uma pequena lista de atletas fictícios para contratação. Cada atleta deverá apresentar posição, atributos, nível geral e custo.

Não implementar inicialmente negociações avançadas, agentes, leilões ou contratos complexos.

### 7.5. Táticas

O usuário poderá escolher uma das formações iniciais e uma abordagem:

- **Ofensiva:** maior participação no ataque.
- **Equilibrada:** distribuição entre ataque e defesa.
- **Defensiva:** prioridade à proteção do próprio gol.

A escolha deve produzir efeitos observáveis no posicionamento e no comportamento dos jogadores.

## 8. Competição e progressão do MVP

O universo inicial terá quatro clubes fictícios, incluindo o clube do usuário.

Formato:

1. Fase classificatória em turno único: cada equipe enfrenta as outras três uma vez.
2. Os dois melhores colocados disputam a final.

Pontuação:

- Vitória: 3 pontos.
- Empate: 1 ponto.
- Derrota: 0 pontos.

Os jogos que não envolvem o usuário poderão ser simulados automaticamente.

Ao final, apresentar campeão, classificação, artilharia, melhor jogador, estatísticas resumidas e recompensas.

## 9. Economia simplificada

Entradas possíveis:

- Premiações.
- Receitas de partidas.
- Recompensas da competição.

Saídas possíveis:

- Contratação de jogadores.
- Treinamento.
- Custos operacionais simplificados.

A economia deve criar decisões, mas não se tornar uma planilha complexa. Os valores deverão ser centralizados em regras de domínio e balanceáveis.

## 10. Telas previstas

1. Tela inicial: novo jogo e continuar.
2. Criação da carreira: seleção de clube.
3. Editor de uniforme.
4. Central do clube.
5. Elenco e detalhes do jogador.
6. Táticas e escalação.
7. Treinamento.
8. Mercado de jogadores.
9. Competição: tabela e calendário.
10. Partida.
11. Intervalo.
12. Resultado e recompensas.
13. Configurações.

A sequência de implementação deverá respeitar a prioridade do jogo jogável: não construir todas as telas antes de validar a partida.

## 11. Tecnologia e arquitetura desejadas

Stack de referência:

- **React + TypeScript:** shell da aplicação, menus e telas administrativas.
- **Phaser:** campo, entidades visuais, animações e loop da partida.
- **Vite:** desenvolvimento e build.
- **LocalStorage:** persistência local inicial.
- **Vitest:** testes unitários, se compatível com a configuração escolhida.

O Claude Code deverá verificar versões estáveis e compatíveis no momento da instalação, sem fixar versões desatualizadas por hábito.

### 11.1. Separação de responsabilidades

- React não deve controlar diretamente a física ou o loop da partida.
- Phaser não deve conter regras de gerenciamento do clube.
- Regras de domínio (atributos, formações, calendário, economia e resultados) devem ficar separadas da apresentação.
- A comunicação entre React e Phaser deve ocorrer por uma interface clara, como eventos tipados ou um serviço de integração.
- O sistema de input deve transformar teclas em ações do jogo.
- Assets devem ser carregados por um ponto organizado, sem caminhos de arquivo espalhados pelo código.
- A persistência deve ter versão de esquema para permitir migrações futuras.

### 11.2. Estrutura de diretórios sugerida

A estrutura final pode ser adaptada com justificativa, mas deve preservar separação por responsabilidade. Uma referência:

```text
src/
  app/                  # aplicação React, rotas e layout
  components/           # componentes compartilhados
  features/
    club/               # central e identidade do clube
    squad/              # elenco e jogadores
    uniforms/           # editor de uniformes
    tactics/            # escalações e formações
    training/           # treinamento
    market/             # mercado
    competition/        # calendário e tabela
  game/
    scenes/             # cenas Phaser
    entities/           # jogador, bola, gol e objetos
    systems/            # física, regras de partida e IA
    input/              # ações e adaptadores de entrada
    assets/             # carregamento e manifestos de assets
  domain/               # modelos e regras de negócio puras
  storage/              # LocalStorage e versionamento
  shared/               # tipos e utilitários compartilhados
public/
  assets/               # imagens, spritesheets e áudio
```

## 12. Persistência

O MVP não terá backend, login ou banco de dados remoto.

Salvar localmente:

- Carreira e clube selecionado.
- Personalização do uniforme.
- Elenco e atributos.
- Saldo e movimentações relevantes.
- Formação e estratégia.
- Calendário, resultados e progresso da competição.

Criar uma camada de persistência isolada, com validação e versão do formato salvo. A aplicação deverá lidar com ausência de save e com dados inválidos sem quebrar a inicialização.

## 13. Escopo do MVP

### Obrigatório para o MVP completo

- [ ] Criar e continuar uma carreira.
- [ ] Selecionar um clube fictício.
- [ ] Personalizar uniforme: cores, padrão, calção e meias.
- [ ] Visualizar e gerenciar o elenco.
- [ ] Configurar formação e estratégia.
- [ ] Treinar jogadores de forma simplificada.
- [ ] Contratar jogadores de um mercado simplificado.
- [ ] Visualizar calendário e classificação.
- [ ] Jogar partidas 5 contra 5 em tempo real.
- [ ] Controlar o jogo pelo teclado.
- [ ] Usar IA para companheiros, adversários e goleiros.
- [ ] Passar, finalizar, correr, desarmar e trocar o jogador controlado.
- [ ] Detectar gols, controlar o tempo e concluir partidas.
- [ ] Simular partidas automaticamente.
- [ ] Atualizar resultados, classificação e recompensas.
- [ ] Salvar e carregar a carreira localmente.

### Fora do MVP

- Gamepad / manete.
- Multiplayer local ou online.
- Contas e salvamento em nuvem.
- Futebol 7 ou 11.
- Clubes, escudos ou jogadores licenciados/reais.
- Mercado com negociações avançadas, agentes ou contratos complexos.
- VAR, impedimento e arbitragem avançada.
- Estádios 3D.
- Aplicação mobile nativa.

## 14. Ordem de desenvolvimento recomendada

### Fase 1 — Protótipo de partida

Campo, jogadores, bola, movimentação pelo teclado, posse, passe, chute, gol, placar e IA inicial. Usar placeholders temporários para validar a jogabilidade.

### Fase 2 — Partida completa

Completar as ações, troca de jogador, defesa, goleiros, cronômetro, dois tempos, pausa, reinícios e comportamento tático inicial.

### Fase 3 — Arte e uniformes

Integrar pixel arts originais, animações, sistema de aplicação dinâmica de cores/padrões e editor de uniforme.

### Fase 4 — Gestão

Criar clubes, elenco, formações, treinamento, mercado e economia simplificada.

### Fase 5 — Competição e carreira

Calendário, simulação dos outros jogos, classificação, final, premiação e progressão.

### Fase 6 — Persistência e acabamento

Salvamento, carregamento, tratamento de erros, configurações, responsividade, áudio e balanceamento.

## 15. Critérios de conclusão

O MVP estará pronto quando for possível:

1. Iniciar uma carreira e escolher um clube.
2. Personalizar o uniforme e visualizar o resultado nos jogadores.
3. Organizar elenco e formação.
4. Iniciar uma partida 5 contra 5.
5. Jogar usando somente o teclado, sem depender de manete.
6. Movimentar, passar, finalizar, correr, desarmar e trocar o atleta controlado.
7. Jogar contra uma equipe funcional controlada por IA.
8. Marcar gols, concluir os dois tempos e visualizar o resultado.
9. Simular partidas de outras equipes.
10. Atualizar a classificação e concluir a competição.
11. Salvar e carregar a carreira sem perder o progresso.

---

## 16. Princípios para decisões futuras

Quando surgir uma dúvida de implementação ou produto, priorizar nesta ordem:

1. Jogabilidade divertida e responsiva.
2. Escopo pequeno e entregas verificáveis.
3. Código modular, tipado e testável.
4. Identidade visual consistente.
5. Facilidade para adicionar gamepad e multiplayer futuramente.

**Regra principal:** não sacrificar a qualidade da partida para construir rapidamente telas e sistemas de gerenciamento. O futebol jogável é o coração do Várzea FC.
