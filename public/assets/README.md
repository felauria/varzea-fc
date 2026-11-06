# Assets do Várzea FC

Pasta reservada para as pixel arts **originais** do projeto. Não adicionar sprites de terceiros nem de jogos comerciais.

```text
sprites/players/  # spritesheets dos atletas (sprite-base neutro, sem cor de uniforme)
sprites/ball/     # bola e sombra
sprites/pitch/    # gramado, linhas, gols, elementos de estádio
kits/             # máscaras de camadas do uniforme e padrões de camisa
crests/           # escudos fictícios
ui/               # ícones e elementos de interface
```

Cada arquivo novo deve ser registrado em `src/game/assets/manifest.ts` (`ASSET_MANIFEST`). Nenhum outro módulo referencia caminhos de arquivo.

Enquanto a arte final não chega, os placeholders são gerados em código (`src/game/assets/placeholderTextures.ts`).
A escala atual dos atletas é 10×16 px numa resolução lógica de 640×360. Ajuste o tamanho dos quadros finais depois de validar a escala dentro do campo, e não misture tamanhos de quadro num mesmo spritesheet.
