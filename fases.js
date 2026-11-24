// Cada caractere representa uma casa: # parede, . chão, S início, E saída.
// Uma rota é uma lista de [coluna, linha], começando em zero.
function patrulha(linha, inicio, fim) {
  const rota = [];
  const sentido = inicio < fim ? 1 : -1;
  for (let coluna = inicio; coluna !== fim + sentido; coluna += sentido) {
    rota.push([coluna, linha]);
  }
  return rota;
}

const fases = [
  {
    nome: "Fase 1",
    intervalo: 600,
    mapa: [
      "################",
      "#.............E#",
      "#..............#",
      "#.....##########",
      "#.......##.....#",
      "#..............#",
      "###########..###",
      "#..##..........#",
      "#..............#",
      "#S....##.......#",
      "################"
    ],
    guardas: [
      { rota: patrulha(8, 4, 10), direcao: "direita" },
      { rota: patrulha(5, 12, 5), direcao: "esquerda" },
      { rota: patrulha(2, 5, 12), direcao: "direita" }
    ]
  },
  {
    nome: "Fase 2",
    intervalo: 520,
    mapa: [
      "################",
      "#.............E#",
      "##########.#.#.#",
      "#..............#",
      "###.############",
      "#..............#",
      "#......##......#",
      "###########.####",
      "#..............#",
      "#S....##.......#",
      "################"
    ],
    guardas: [
      { rota: patrulha(8, 4, 12), direcao: "direita" },
      { rota: patrulha(5, 11, 3), direcao: "esquerda" },
      { rota: patrulha(3, 4, 12), direcao: "direita" },
      { rota: patrulha(1, 14, 9), direcao: "esquerda" }
    ]
  },
  {
    nome: "Fase 3",
    intervalo: 440,
    mapa: [
      "################",
      "#.............E#",
      "###########.#..#",
      "#..............#",
      "##.#############",
      "#.........##...#",
      "#..##..........#",
      "############.###",
      "#..............#",
      "#S...##........#",
      "################"
    ],
    guardas: [
      { rota: patrulha(8, 4, 13), direcao: "direita" },
      { rota: patrulha(6, 13, 6), direcao: "esquerda" },
      { rota: patrulha(5, 2, 9), direcao: "direita" },
      { rota: patrulha(3, 13, 3), direcao: "esquerda" },
      { rota: patrulha(1, 9, 14), direcao: "direita" }
    ]
  },
  {
    nome: "Fase 4",
    intervalo: 360,
    exigeFumaca: true,
    mapa: [
      "################",
      "#.............E#",
      "###.#######.##.#",
      "#.........######",
      "########...#####",
      "#..........##..#",
      "#..##..........#",
      "############.###",
      "#..............#",
      "#S...##........#",
      "################"
    ],
    guardas: [
      { rota: patrulha(8, 4, 13), direcao: "direita" },
      { rota: patrulha(6, 12, 5), direcao: "esquerda" },
      { rota: patrulha(5, 2, 8), direcao: "direita" },
      { rota: [[10, 4]], direcao: "esquerda" },
      { rota: patrulha(3, 9, 3), direcao: "esquerda" },
      { rota: patrulha(1, 8, 14), direcao: "direita" }
    ]
  },
];
