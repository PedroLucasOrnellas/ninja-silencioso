// O mapa e as marcações são desenhados com formas.
// Personagens e fumaça usam imagens PNG geradas para o projeto.

function desenharMapa() {
  const mapa = fases[faseAtual].mapa;
  noStroke();
  for (let linha = 0; linha < mapa.length; linha++) {
    for (let coluna = 0; coluna < mapa[linha].length; coluna++) {
      const simbolo = mapa[linha][coluna];
      const x = coluna * tamanhoDaCasa;
      const y = linha * tamanhoDaCasa;

      fill('#273d30');
      if ((linha + coluna) % 2 === 1) fill('#24392d');
      rect(x, y, tamanhoDaCasa, tamanhoDaCasa);
      if (simbolo === '#') desenharParede(x, y);
      if (simbolo === 'E') desenharSaida(x, y);
      if (simbolo === 'S') {
        noFill();
        stroke('#799486');
        rect(x + 11, y + 11, 26, 26);
        noStroke();
      }
    }
  }
}

function desenharParede(x, y) {
  fill('#36453d');
  rect(x, y, tamanhoDaCasa, tamanhoDaCasa);
  fill('#4c5d50');
  rect(x + 2, y + 2, tamanhoDaCasa - 4, 4);
  fill('#1c2b22');
  rect(x + 2, y + tamanhoDaCasa - 5, tamanhoDaCasa - 4, 5);
  noFill();
  stroke('#2b3931');
  rect(x, y, tamanhoDaCasa, tamanhoDaCasa);
  noStroke();
}

function desenharSaida(x, y) {
  fill('#a9ce8b');
  rect(x + 6, y + 5, 36, 38);
  fill('#233a2b');
  rect(x + 12, y + 10, 24, 33);
  fill('#d1eab5');
  textAlign(CENTER, BASELINE);
  textSize(24);
  text('↑', x + 24, y + 32);
}

function desenharVisaoDosGuardas() {
  for (const guarda of guardas) {
    const casas = calcularVisao(guarda);
    for (let distancia = 0; distancia < casas.length; distancia++) {
      const x = casas[distancia].x * tamanhoDaCasa;
      const y = casas[distancia].y * tamanhoDaCasa;
      fill(231, 184, 86, 74 - distancia * 14);
      rect(x + 1, y + 1, tamanhoDaCasa - 2, tamanhoDaCasa - 2);
      fill('#c3a260');
      rect(x + 22, y + 22, 4, 4);
    }
  }
}

// Cada folha tem quatro imagens em uma grade 2x2:
// baixo / esquerda na primeira linha; direita / cima na segunda.
const quadrosDosPersonagens = {
  baixo: { coluna: 0, linha: 0 },
  esquerda: { coluna: 1, linha: 0 },
  direita: { coluna: 0, linha: 1 },
  cima: { coluna: 1, linha: 1 }
};

function desenharPersonagem(folha, coluna, linha, direcao) {
  const quadro = quadrosDosPersonagens[direcao];
  const larguraDoQuadro = folha.width / 2;
  const alturaDoQuadro = folha.height / 2;
  const origemX = quadro.coluna * larguraDoQuadro;
  const origemY = quadro.linha * alturaDoQuadro;

  // Os primeiros valores indicam onde mostrar; os últimos recortam a folha.
  image(folha, coluna * tamanhoDaCasa - 4, linha * tamanhoDaCasa - 8,
    56, 56, origemX, origemY, larguraDoQuadro, alturaDoQuadro);
}

function desenharFumaca() {
  if (fumaca.tempoRestante <= 0) return;
  push();
  // Transparência sem ler ou modificar os pixels do PNG local.
  drawingContext.globalAlpha = 145 / 255;
  for (let linha = fumaca.y - 1; linha <= fumaca.y + 1; linha++) {
    for (let coluna = fumaca.x - 1; coluna <= fumaca.x + 1; coluna++) {
      if (existeParede(coluna, linha)) continue;
      // Cada casa mostra um nono da imagem, formando uma nuvem contínua.
      const pedacoDaImagem = imagens.fumaca.width / 3;
      const origemX = (coluna - fumaca.x + 1) * pedacoDaImagem;
      const origemY = (linha - fumaca.y + 1) * pedacoDaImagem;
      image(imagens.fumaca, coluna * tamanhoDaCasa, linha * tamanhoDaCasa,
        tamanhoDaCasa, tamanhoDaCasa, origemX, origemY, pedacoDaImagem, pedacoDaImagem);
    }
  }
  pop();
}
