// Regras e controles. O p5.js chama setup() uma vez e draw() a cada quadro.
const elemento = seletor => document.querySelector(seletor);
const tamanhoDaCasa = 48;
const intervaloDoJogador = 150;
const esperaParaRepetir = 450;
const duracaoDaFumaca = 3000;
const direcoes = {
  cima: { x: 0, y: -1 }, direita: { x: 1, y: 0 },
  baixo: { x: 0, y: 1 }, esquerda: { x: -1, y: 0 }
};
const teclasDeMovimento = {
  w: 'cima', arrowup: 'cima', s: 'baixo', arrowdown: 'baixo',
  a: 'esquerda', arrowleft: 'esquerda', d: 'direita', arrowright: 'direita'
};
let faseAtual = 0;
let jogador, guardas, fumaca, tela;
let imagens = {};
let imagensProntas = false;
let estadoDoJogo = 'inicio';
let tempoTotal = 0;
let quantidadeDeAlarmes = 0;
let tempoDosGuardas = 0;
let tempoDoJogador = 0;
let repetindoMovimento = false;
let teclasPressionadas = [];
let direcaoDoNinja = 'baixo';

function setup() {
  tela = createCanvas(768, 528);
  tela.parent('area-do-mapa');
  tela.id('board');
  tela.style('width', '100%');
  tela.style('height', 'auto');
  tela.attribute('tabindex', '0');
  tela.attribute('aria-label', 'Mapa do jogo. Use as setas ou WASD para andar.');
  pixelDensity(1);
  atualizarProgresso();
  configurarBotoes();
  configurarAudio();
  carregarFase();
  carregarImagens();
  window.addEventListener('blur', pausarAoSair);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pausarAoSair();
  });
}

async function carregarImagens() {
  try {
    for (const nome of ['ninja', 'guarda', 'fumaca']) {
      // Um elemento <img> carrega o PNG por caminho, inclusive em file://.
      imagens[nome] = await new Promise((resolver, rejeitar) => {
        const imagem = createImg(`imagens/${nome}.png`, '', resolver);
        imagem.hide();
        imagem.elt.onerror = rejeitar;
      });
    }
    imagensProntas = true;
    noSmooth();
    elemento('#action').disabled = false;
    elemento('#restart').disabled = false;
    elemento('#action').textContent = 'Iniciar missão';
    atualizarSeletorDeFases();
  } catch (erro) {
    mostrarMensagem('Não foi possível carregar as imagens',
      'Extraia o ZIP completo e mantenha os PNGs na pasta imagens.', 'Carregamento indisponível');
  }
}

function draw() {
  if (!imagensProntas) return;
  if (estadoDoJogo === 'jogando') atualizarJogo(Math.min(deltaTime, 50));
  push();
  scale(width / 768, height / 528);
  desenharMapa();
  desenharVisaoDosGuardas();
  for (const guarda of guardas) {
    desenharPersonagem(imagens.guarda, guarda.x, guarda.y, guarda.direcao);
  }
  desenharFumaca();
  desenharPersonagem(imagens.ninja, jogador.x, jogador.y, direcaoDoNinja);
  pop();
  atualizarPainel();
}

// Início, repetição e troca de fase usam a mesma rotina.
function iniciarFase(indice = faseAtual, novaPartida = false) {
  if (!imagensProntas || !faseEstaLiberada(indice)) return;
  faseAtual = indice;
  if (novaPartida) {
    tempoTotal = 0;
    quantidadeDeAlarmes = 0;
  }
  carregarFase();
  retomarJogo();
  tocarEfeito('inicio');
}

function carregarFase() {
  const fase = fases[faseAtual];
  for (let y = 0; y < fase.mapa.length; y++) {
    const x = fase.mapa[y].indexOf('S');
    if (x !== -1) jogador = { x, y };
  }
  guardas = fase.guardas.map(dados => ({
    ...dados, x: dados.rota[0][0], y: dados.rota[0][1],
    pontoDaRota: 0, sentidoDaRota: 1
  }));
  fumaca = { disponivel: true, tempoRestante: 0, x: 0, y: 0 };
  tempoDosGuardas = 0;
  tempoDoJogador = 0;
  repetindoMovimento = false;
  teclasPressionadas = [];
  direcaoDoNinja = 'baixo';
}

function retomarJogo() {
  estadoDoJogo = 'jogando';
  elemento('#overlay').hidden = true;
  teclasPressionadas = [];
  tela.elt.focus();
  iniciarMusica();
  atualizarSeletorDeFases();
}

function continuarJogo() {
  if (!imagensProntas) return;
  if (estadoDoJogo === 'pausado') retomarJogo();
  else if (estadoDoJogo === 'vitoria') iniciarFase(0, true);
  else iniciarFase(faseAtual + (estadoDoJogo === 'faseConcluida' ? 1 : 0));
}

function atualizarJogo(tempoPassado) {
  tempoTotal += tempoPassado;
  fumaca.tempoRestante = Math.max(0, fumaca.tempoRestante - tempoPassado);
  tempoDosGuardas += tempoPassado;
  tempoDoJogador += tempoPassado;
  if (tempoDosGuardas >= fases[faseAtual].intervalo) {
    tempoDosGuardas = 0;
    for (const guarda of guardas) atualizarGuarda(guarda);
    verificarSeFoiVisto();
  }
  const espera = repetindoMovimento ? intervaloDoJogador : esperaParaRepetir;
  if (teclasPressionadas.length && tempoDoJogador >= espera) {
    tempoDoJogador = 0;
    repetindoMovimento = true;
    moverJogador(teclasDeMovimento[teclasPressionadas.at(-1)]);
  }
  verificarSeFoiVisto();
}

function existeParede(x, y) {
  const casa = fases[faseAtual].mapa[y]?.[x];
  return casa === undefined || casa === '#';
}

function moverJogador(direcao) {
  if (estadoDoJogo !== 'jogando') return;
  direcaoDoNinja = direcao;
  const x = jogador.x + direcoes[direcao].x;
  const y = jogador.y + direcoes[direcao].y;
  if (existeParede(x, y)) return;
  jogador = { x, y };
  verificarSeFoiVisto();
  if (estadoDoJogo === 'jogando' && fases[faseAtual].mapa[y][x] === 'E') concluirFase();
}

function concluirFase() {
  atualizarProgresso(faseAtual);
  tocarEfeito('fase');
  if (faseAtual === fases.length - 1) {
    estadoDoJogo = 'vitoria';
    mostrarMensagem('Missão cumprida!',
      `Tempo desta partida: ${Math.floor(tempoTotal / 1000)} segundos. Alarmes: ${quantidadeDeAlarmes}.`,
      'Jogar novamente');
  } else {
    estadoDoJogo = 'faseConcluida';
    const aviso = fases[faseAtual + 1].exigeFumaca
      ? 'Na próxima fase, guarde a bomba para atravessar o muro vigiado pela sentinela!'
      : 'Sua bomba será renovada. Observe as patrulhas da próxima fase.';
    mostrarMensagem('Passagem livre.', aviso, 'Próxima fase');
  }
}

function atualizarGuarda(guarda) {
  if (guarda.rota.length === 1) return; // Sentinela fixa.
  let proximo = guarda.pontoDaRota + guarda.sentidoDaRota;
  if (proximo < 0 || proximo >= guarda.rota.length) {
    guarda.sentidoDaRota *= -1;
    proximo = guarda.pontoDaRota + guarda.sentidoDaRota;
  }
  const [x, y] = guarda.rota[proximo];
  let destino = y > guarda.y ? 'baixo' : 'cima';
  if (x !== guarda.x) destino = x > guarda.x ? 'direita' : 'esquerda';
  if (guarda.direcao !== destino) {
    // Só gira 90° por ação. A meia-volta passa por uma direção intermediária.
    const ordem = ['cima', 'direita', 'baixo', 'esquerda'];
    const atual = ordem.indexOf(guarda.direcao);
    const anterior = (atual + 3) % 4;
    guarda.direcao = ordem[anterior] === destino ? destino : ordem[(atual + 1) % 4];
  } else {
    guarda.x = x;
    guarda.y = y;
    guarda.pontoDaRota = proximo;
  }
}

function calcularVisao(guarda) {
  const casas = [];
  const direcao = direcoes[guarda.direcao];
  for (let distancia = 1; distancia <= 3; distancia++) {
    const x = guarda.x + direcao.x * distancia;
    const y = guarda.y + direcao.y * distancia;
    if (existeParede(x, y)) break;
    casas.push({ x, y });
  }
  return casas;
}

function verificarSeFoiVisto() {
  if (estadoDoJogo !== 'jogando' || jogadorEstaNaFumaca()) return;
  for (const guarda of guardas) {
    const casasVigiadas = [guarda, ...calcularVisao(guarda)];
    if (casasVigiadas.some(casa => casa.x === jogador.x && casa.y === jogador.y)) {
      quantidadeDeAlarmes++;
      estadoDoJogo = 'derrota';
      tocarEfeito('derrota');
      mostrarMensagem('Você foi visto!', 'Espere os guardas virarem e use as paredes.', 'Tentar novamente');
      return;
    }
  }
}

function usarFumaca() {
  if (estadoDoJogo !== 'jogando' || !fumaca.disponivel) return;
  fumaca = { disponivel: false, tempoRestante: duracaoDaFumaca, x: jogador.x, y: jogador.y };
  tocarEfeito('fumaca');
}

function jogadorEstaNaFumaca() {
  return fumaca.tempoRestante > 0 && Math.abs(jogador.x - fumaca.x) <= 1 &&
    Math.abs(jogador.y - fumaca.y) <= 1;
}

function configurarBotoes() {
  const acoes = {
    '#action': continuarJogo, '#restart': () => iniciarFase(0, true),
    '#retry-level': () => iniciarFase(), '#smoke-button': usarFumaca
  };
  for (const seletor of Object.keys(acoes)) elemento(seletor).onclick = acoes[seletor];
  for (const botao of document.querySelectorAll('[data-dir]')) {
    botao.onclick = () => moverJogador(botao.dataset.dir);
  }
  for (const botao of document.querySelectorAll('[data-fase]')) {
    botao.onclick = () => iniciarFase(Number(botao.dataset.fase), true);
  }
}

function keyPressed(evento) {
  if (evento.target.tagName === 'INPUT') return;
  const tecla = evento.key.toLowerCase();
  if (evento.target instanceof HTMLButtonElement && [' ', 'enter'].includes(tecla)) return;
  const direcao = teclasDeMovimento[tecla];
  if (direcao || tecla === ' ') evento.preventDefault();
  if (evento.repeat) return;
  if (direcao && estadoDoJogo === 'jogando') {
    teclasPressionadas.push(tecla);
    tempoDoJogador = 0;
    repetindoMovimento = false;
    moverJogador(direcao);
  }
  if (tecla === ' ') usarFumaca();
  if (tecla === 'p') alternarPausa();
  if (tecla === 'r') iniciarFase(0, true);
  if (tecla === 't') iniciarFase();
}

function keyReleased(evento) {
  teclasPressionadas = teclasPressionadas.filter(tecla => tecla !== evento.key.toLowerCase());
  tempoDoJogador = 0;
  repetindoMovimento = false;
}

function alternarPausa() {
  if (estadoDoJogo === 'pausado') retomarJogo();
  else if (estadoDoJogo === 'jogando') {
    estadoDoJogo = 'pausado';
    mostrarMensagem('Respire nas sombras.', 'Continue quando estiver pronto.', 'Continuar');
  }
}

function pausarAoSair() {
  teclasPressionadas = [];
  if (estadoDoJogo === 'jogando') alternarPausa();
}

function mostrarMensagem(titulo, texto, botao) {
  teclasPressionadas = [];
  elemento('#message-title').textContent = titulo;
  elemento('#message-body').textContent = texto;
  elemento('#action').textContent = botao;
  elemento('#overlay').hidden = false;
  elemento('#action').focus();
}

function atualizarPainel() {
  elemento('#level').textContent = `${fases[faseAtual].nome} / ${fases.length}`;
  const minutos = String(Math.floor(tempoTotal / 60000)).padStart(2, '0');
  const segundos = String(Math.floor(tempoTotal / 1000) % 60).padStart(2, '0');
  elemento('#timer').textContent = minutos + ':' + segundos;
  let aviso = fumaca.disponivel ? 'Fumaça disponível' : 'Fumaça utilizada';
  let instrucao = 'Alcance o portão verde. As faixas douradas mostram a visão dos guardas.';
  if (fases[faseAtual].exigeFumaca) instrucao = 'Guarde a bomba para a sentinela do muro central.';
  if (fumaca.tempoRestante > 0) {
    const situacao = jogadorEstaNaFumaca() ? 'Oculto' : 'Fumaça no mapa';
    aviso = `${situacao} · ${(fumaca.tempoRestante / 1000).toFixed(1)}s`;
    instrucao = 'Fumaça fixa em 3×3 casas. Você só fica oculto dentro da nuvem!';
  } else if (!fumaca.disponivel) instrucao = 'Fumaça esgotada. Use as paredes e espere a patrulha.';
  elemento('#smoke').textContent = aviso;
  elemento('#smoke-button').disabled = !fumaca.disponivel || estadoDoJogo !== 'jogando';
  if (estadoDoJogo === 'jogando') elemento('#status').textContent = instrucao;
}
