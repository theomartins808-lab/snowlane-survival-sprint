# Snowlane Survival Sprint

Crie um jogo endless runner 2.5D estilo Subway Surfers com visual blocky voxel estilo Minecraft, em HTML, CSS e JavaScript com Three.js.



CONCEITO PRINCIPAL - DESAFIO NÃO PEGUE A MOEDA:

- O objetivo NÃO é pegar moedas, é DESVIAR de todas elas

- O jogador corre automaticamente e deve sobreviver o máximo de tempo possível SEM pegar nenhuma moeda

- O cronômetro no topo é a pontuação principal: ele conta para cima 00:00, 00:01, 00:02...

- Se o jogador pegar UMA moeda, o cronômetro PARA NA HORA e a corrida termina - Game Over

- Mostrar na tela "VOCÊ PEGOU UMA MOEDA! TEMPO PARADO!"

- Quanto mais tempo sem pegar moeda, maior o recorde



VISUAL:

- Câmera atrás do personagem, em terceira pessoa, visão 2.5D

- Cenário de Natal com neve caindo, céu azul escuro anoitecendo

- 3 trilhos de trem paralelos, chão cinza com dormentes marrons

- Laterais com pinheiros com neve, presentes, bonecos de neve, postes e prédios ao fundo

- Personagem blocky com cabeça quadrada marrom, camiseta azul com quadrado laranja, calça jeans e tênis branco



GAMEPLAY:

- Personagem corre sozinho e a velocidade aumenta com o tempo

- Controles: Setas ou WASD para trocar de trilho (A / D), pular (W / Espaço), abaixar (S)

- No celular: swipe esquerda, direita, cima e baixo

- Obstáculos normais: trens vermelhos e marrons, barreiras para pular e para abaixar - bater neles também dá Game Over

- Moedas douradas aparecem em fileiras, em padrões traiçoeiros: às vezes ocupando 2 trilhos para forçar a troca rápida, às vezes em arco para forçar pular, às vezes perto dos trens

- As moedas brilham muito e giram para chamar atenção, para tentar enganar o jogador

- Dificuldade progressiva: a cada 15 segundos mais moedas aparecem e mais juntas



HUD:

- No topo no centro: cronômetro grande branco 00:00 - esse é o recorde

- Abaixo do cronômetro: texto "NÃO PEGUE A MOEDA!"

- No canto superior direito: melhor tempo salvo e distância em metros

- No canto superior esquerdo: botão de pause

- No canto inferior esquerdo: mostrar as teclas WASD como guia

- Tela inicial: título "NÃO PEGUE A MOEDA!", explicação do desafio e botão JOGAR

- Tela de Game Over: mostrar tempo final, motivo "VOCÊ PEGOU UMA MOEDA!" ou "VOCÊ BATEU!", botão JOGAR NOVAMENTE e botão de recorde

- Salvar o melhor tempo no localStorage



ESTILO:

- Gráficos low-poly, cores vivas, iluminação suave, sombras simples

- Personagem com animação de corrida

- Partículas de neve caindo

- Quando pegar moeda: efeito de flash vermelho, som de erro, cronômetro congela e treme

- Responsivo para celular e PC, rodando liso a 60fps

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://snowlane-survival-sprint.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/014ef62c-bf4a-432c-9181-15a09672ef96).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
