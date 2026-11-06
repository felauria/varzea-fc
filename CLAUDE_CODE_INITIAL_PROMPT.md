# Prompt inicial — Claude Code | Várzea FC

> Antes de usar: coloque este arquivo e `PROJECT_CONTEXT.md` na raiz do repositório do jogo. Abra o Claude Code nesse diretório e envie o conteúdo deste prompt.

---

Você será o engenheiro principal responsável por iniciar o desenvolvimento do **Várzea FC**, um jogo web de futebol híbrido com gerenciamento de clube e partidas 2D jogáveis.

## 1. Leia o contexto antes de agir

Leia integralmente o arquivo `PROJECT_CONTEXT.md`. Ele é a fonte de verdade sobre conceito, escopo, controles, direção visual e decisões já tomadas.

Em caso de conflito entre este prompt e `PROJECT_CONTEXT.md`, siga `PROJECT_CONTEXT.md`.

Decisões já definidas e que não devem ser reabertas sem motivo técnico relevante:

- O jogo será web, para navegador desktop.
- O visual será pixel art 2D, com câmera top-down.
- O formato inicial das partidas será 5 contra 5: um goleiro e quatro jogadores de linha por equipe.
- O jogo será single-player no MVP.
- O jogador controlará um atleta por vez; companheiros, adversários e goleiros serão conduzidos por IA.
- No MVP, a partida será jogada pelo teclado.
- Manete/gamepad ficará para uma versão futura. Não implementar Gamepad API agora.
- As pixel arts finais serão produzidas separadamente para o projeto. Use placeholders temporários e organizados até os assets finais serem entregues.
- O jogador poderá personalizar as cores e o padrão do uniforme do próprio clube. Essa funcionalidade faz parte do MVP.
- Não haverá backend, login ou multiplayer no MVP. A persistência inicial será local.

## 2. Sua missão nesta primeira sessão

Não tente implementar o jogo inteiro de uma vez.

Sua primeira missão é criar a fundação técnica e entregar uma **primeira fatia jogável do futebol**. A prioridade é comprovar que movimentar os jogadores, disputar a bola e marcar gols é divertido e funciona bem no navegador.

Trabalhe diretamente no repositório atual:

1. Inspecione os arquivos e a estrutura existentes antes de modificá-los.
2. Preserve qualquer trabalho válido que já esteja no projeto. Não sobrescreva arquivos importantes sem entender seu conteúdo.
3. Se o repositório estiver vazio, inicialize a aplicação.
4. Defina a arquitetura mínima necessária para React, TypeScript, Vite e Phaser trabalharem juntos.
5. Implemente apenas a primeira fatia descrita na seção 5.
6. Execute testes, lint (se configurado) e build. Corrija os erros encontrados.
7. Documente como instalar, executar e testar o projeto.

Não pare depois de apresentar um plano. Depois de uma análise breve, implemente a primeira fatia dentro do escopo definido.

## 3. Diretrizes técnicas

### Stack de referência

- React + TypeScript para a aplicação e interface.
- Phaser para o campo, entidades, animações e loop da partida.
- Vite para desenvolvimento e build.
- Vitest para testes unitários, caso seja adequado à configuração.

Escolha versões estáveis e compatíveis entre si no momento da instalação. Não use versões beta, experimentais ou dependências desnecessárias. Registre as principais decisões técnicas.

### Separação de responsabilidades

- React é responsável pela estrutura da aplicação e pelas telas.
- Phaser é responsável pela renderização e execução da partida.
- Regras de futebol e estado de domínio não devem ficar misturados à interface.
- Não crie um componente React ou uma cena Phaser gigantesca com toda a lógica do jogo.
- Separe entidades, sistemas, input e regras em módulos pequenos e com responsabilidades claras.
- Use TypeScript de forma consistente. Evite `any`; quando for inevitável, justifique.
- Evite abstrações prematuras. A arquitetura deve ser simples, mas preparada para crescer.

### Integração React e Phaser

Crie um componente React responsável por montar e desmontar a instância do Phaser corretamente.

Garanta que:

- A instância Phaser não seja recriada a cada renderização do React.
- Eventos e listeners sejam removidos ao desmontar o componente.
- O canvas se ajuste ao espaço disponível sem distorcer a proporção do campo.
- A comunicação entre interface e jogo seja explícita e tipada.

### Input do teclado

Implemente um `InputManager` ou solução equivalente. A lógica da partida deve consultar ações abstratas, não ficar espalhada em listeners de teclado.

Mapeamento inicial:

| Tecla | Ação |
|---|---|
| `W` `A` `S` `D` | Movimentar |
| `Espaço` | Passe curto |
| `J` | Finalização |
| `K` | Passe em profundidade |
| `L` | Passe longo |
| `Shift` | Correr |
| `Q` | Trocar jogador controlado |
| `E` | Desarme / pressão |
| `Esc` | Pausar |

Requisitos de input:

- Movimentação diagonal normalizada para não ser mais rápida que a movimentação vertical ou horizontal.
- Evitar repetição indesejada de ações de passe, chute e troca de jogador enquanto a tecla permanece pressionada; distinguir ações contínuas de ações acionadas uma vez.
- Impedir scroll da página quando `Espaço` estiver sendo usado pelo jogo.
- Limpar o estado das teclas quando a janela perder foco ou a partida for pausada.
- Não implementar suporte a manete nesta etapa.

## 4. Direção visual nesta etapa

As pixel arts finais serão fornecidas posteriormente. Não tente substituir essa etapa criando imagens genéricas retiradas da internet.

Por enquanto:

- Use placeholders simples, com formas e cores claramente provisórias, para jogadores, bola e gols.
- Organize os assets em uma estrutura própria e centralize os caminhos em um carregador ou manifesto.
- Não misture a lógica visual temporária com a lógica de futebol.
- Mantenha proporções e escala consistentes para que os placeholders possam ser substituídos por spritesheets sem reescrever as mecânicas.
- Use renderização pixel-perfect quando aplicável: evite suavização indesejada, preserve proporções e prefira escalas inteiras para pixel art.

Não invente arte final nem adicione logos de clubes reais.

## 5. Escopo exato da primeira entrega: protótipo de partida

Implemente uma cena de partida 2D que possa ser iniciada no navegador e testada imediatamente.

### Campo e apresentação

- Campo de futebol horizontal, visto de cima.
- Gramado com cores e marcações legíveis.
- Dois gols, áreas, linha central e círculo central.
- Placar visível.
- Janela de jogo responsiva, preservando a proporção do campo.
- Visual provisório, mas organizado e coerente.

### Jogadores

- Dois times com cinco atletas cada: um goleiro e quatro jogadores de linha.
- Um jogador do time do usuário será controlável pelo teclado.
- O usuário poderá trocar o atleta controlado usando `Q`.
- Os outros jogadores terão comportamento básico de IA.
- O goleiro deverá ter comportamento simples de proteção do gol.
- Os jogadores precisam ter velocidade e colisões/limites básicos para não atravessar indefinidamente o campo.

### Bola e ações

- Bola com movimento e desaceleração básicos.
- Posse de bola simplificada e indicação visual de quem está com ela.
- Passe curto (`Espaço`).
- Passe em profundidade (`K`).
- Passe longo (`L`).
- Finalização (`J`).
- Corrida (`Shift`).
- Desarme/pressão (`E`).
- Movimento com `WASD`.

As ações devem ser claras e responsivas. Não tente simular toda a física real do futebol. Prefira uma implementação arcade consistente e fácil de ajustar.

Quando possível, a direção da ação deve considerar a direção de movimento do jogador e o posicionamento de companheiros ou do gol adversário. Caso o jogador esteja sem direção de movimento, use uma direção coerente com a orientação atual ou com o gol adversário.

### IA inicial

Implemente apenas a inteligência necessária para comprovar o loop:

- Um adversário próximo pode perseguir a bola.
- Os demais adversários tentam ocupar posições de apoio ou defesa.
- Companheiros sem a bola oferecem opções de passe e ocupam posições básicas.
- O goleiro acompanha a bola e tenta defendê-la.
- A IA adversária deve conseguir recuperar a posse e tentar avançar/finalizar.

A IA pode ser simples, baseada em estados e regras. Não implemente machine learning.

### Gols e partida

- Detectar quando a bola atravessar a linha de gol dentro da região válida.
- Atualizar o placar.
- Reposicionar os jogadores e a bola após um gol.
- Incluir um cronômetro simplificado e uma ação de pausa.
- Exibir uma mensagem clara quando um gol acontecer.

Nesta primeira entrega, não é obrigatório implementar todos os detalhes do formato de dois tempos, intervalo, competição ou gerenciamento. O objetivo é ter uma partida básica funcional. Essas funcionalidades virão em etapas seguintes.

## 6. O que NÃO implementar nesta etapa

Não implemente agora:

- Gamepad ou manete.
- Multiplayer local ou online.
- Backend, API, autenticação ou banco de dados remoto.
- Mercado de jogadores.
- Treinamento e progressão de atributos.
- Economia do clube.
- Calendário e competição completa.
- Editor de uniforme completo.
- Futebol 7 ou 11.
- VAR, impedimento ou arbitragem avançada.
- Sprites finais ou assets copiados de terceiros.

A personalização de uniforme continua sendo um requisito obrigatório do MVP completo, mas não deve atrasar a validação inicial da partida. Prepare a estrutura para que, depois, o uniforme seja aplicado por camadas/máscaras ou por uma solução equivalente, sem criar uma imagem diferente para cada combinação de cores.

## 7. Qualidade e testes

Antes de considerar esta primeira entrega concluída:

- Execute o projeto localmente e confirme que abre no navegador.
- Execute o build de produção.
- Crie testes unitários para regras puras relevantes, por exemplo normalização da movimentação, cálculo de direção de passe ou detecção de gol, conforme a arquitetura adotada.
- Verifique se os eventos de teclado não ficam presos ao perder foco.
- Verifique se a movimentação diagonal não é mais rápida.
- Verifique se o canvas não é recriado a cada renderização React.
- Verifique se o jogo pode ser pausado e retomado.
- Verifique se um gol atualiza o placar e reinicia a jogada.

Não declare que algo foi testado se não tiver executado o teste correspondente. Informe claramente qualquer limitação que ainda exista.

## 8. Documentação e entregáveis

Ao concluir a primeira entrega, deixe no repositório:

- Aplicação executável.
- Estrutura de pastas organizada.
- `README.md` com pré-requisitos, instalação, comandos e instruções para jogar.
- `docs/ARCHITECTURE.md` resumindo a arquitetura e as decisões tomadas.
- `docs/ROADMAP.md` com as próximas etapas alinhadas a `PROJECT_CONTEXT.md`.
- Testes automatizados relevantes.

Não duplique o documento de contexto inteiro. Faça referência a `PROJECT_CONTEXT.md` como fonte de verdade.

## 9. Como trabalhar e como responder

Trabalhe em etapas pequenas. Não faça uma refatoração ampla sem necessidade. Quando encontrar uma decisão não especificada, escolha a solução mais simples que respeite o contexto, registre a decisão e continue; só interrompa para perguntar quando existir um bloqueio real ou risco de apagar trabalho importante.

No final, apresente:

1. O que foi criado.
2. Como executar o projeto.
3. Quais teclas já funcionam.
4. Quais testes e comandos foram executados e seus resultados.
5. O que ainda não está implementado.
6. Qual deve ser a próxima tarefa recomendada.

**Comece lendo `PROJECT_CONTEXT.md` e inspecionando o repositório. Em seguida, implemente a primeira fatia jogável definida neste prompt.**
