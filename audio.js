// Apenas reprodução de MP3. Nenhum som é sintetizado pelo jogo.
let musica;
let efeitos = {};
let somSilenciado = false;
let volumeDosEfeitos = 0.45;

function configurarAudio() {
  musica = elemento('#background-music');
  musica.volume = 0.25;
  for (const tipo of ['inicio', 'derrota', 'fase', 'fumaca']) {
    efeitos[tipo] = elemento('#effect-' + tipo);
  }
  ajustarVolumesDosEfeitos();
  elemento('#music-volume').oninput = evento => {
    musica.volume = Number(evento.target.value) / 100;
  };
  elemento('#effects-volume').oninput = evento => {
    volumeDosEfeitos = Number(evento.target.value) / 100;
    ajustarVolumesDosEfeitos();
  };
  elemento('#toggle-sound').onclick = evento => {
    somSilenciado = !somSilenciado;
    for (const audio of [musica, ...Object.values(efeitos)]) audio.muted = somSilenciado;
    evento.currentTarget.textContent = somSilenciado ? 'Ativar som' : 'Silenciar som';
    evento.currentTarget.setAttribute('aria-pressed', String(somSilenciado));
    if (!somSilenciado) iniciarMusica();
  };
  musica.onerror = () => {
    elemento('#audio-status').textContent = 'Não foi possível carregar a música. Confira a pasta audio.';
  };
  // O primeiro gesto libera o som se o navegador bloquear o autoplay.
  document.addEventListener('pointerdown', iniciarMusica);
  document.addEventListener('keydown', iniciarMusica);
  iniciarMusica();
}

function iniciarMusica() {
  if (!musica || somSilenciado || !musica.paused) return;
  musica.play().then(() => {
    elemento('#audio-status').textContent = 'Música contínua em todas as telas.';
  }).catch(erro => {
    elemento('#audio-status').textContent = erro.name === 'NotAllowedError'
      ? 'Clique ou pressione uma tecla para ouvir a música.'
      : 'Não foi possível tocar a música. Confira o MP3 na pasta audio.';
  });
}

function tocarEfeito(tipo) {
  if (!efeitos[tipo] || somSilenciado || volumeDosEfeitos === 0) return;
  for (const efeito of Object.values(efeitos)) {
    efeito.pause();
    efeito.currentTime = 0;
  }
  efeitos[tipo].play().catch(() => {
    elemento('#audio-status').textContent = 'Não foi possível tocar um efeito. Confira a pasta audio.';
  });
}

function ajustarVolumesDosEfeitos() {
  for (const tipo of Object.keys(efeitos)) {
    efeitos[tipo].volume = volumeDosEfeitos * (tipo === 'inicio' ? 0.4 : 1);
  }
}
