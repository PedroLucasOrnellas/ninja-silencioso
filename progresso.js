// O mesmo registro é mantido para preservar o progresso das versões anteriores.
const chaveDoProgresso = 'ninja-silencioso-progresso-v1';
let ultimaFaseConcluida = -1;
let armazenamentoDisponivel = true;

function lerProgressoSalvo() {
  try {
    const dados = JSON.parse(localStorage.getItem(chaveDoProgresso));
    const fase = dados?.ultimaFaseConcluida;
    return Number.isInteger(fase) && fase >= -1 && fase < fases.length ? fase : -1;
  } catch (erro) {
    if (erro instanceof SyntaxError) return -1;
    throw erro;
  }
}

// Sem argumento, lê o progresso. Com um índice, registra a fase concluída.
function atualizarProgresso(concluida = -1) {
  ultimaFaseConcluida = Math.max(ultimaFaseConcluida, concluida);
  try {
    ultimaFaseConcluida = Math.max(ultimaFaseConcluida, lerProgressoSalvo());
    if (concluida >= 0) {
      localStorage.setItem(chaveDoProgresso, JSON.stringify({ ultimaFaseConcluida }));
    }
    armazenamentoDisponivel = true;
  } catch (erro) {
    armazenamentoDisponivel = false;
  }
  atualizarSeletorDeFases();
}

function faseEstaLiberada(indice) {
  return Number.isInteger(indice) && indice >= 0 && indice < fases.length &&
    indice <= ultimaFaseConcluida + 1;
}

function atualizarSeletorDeFases() {
  for (const botao of document.querySelectorAll('[data-fase]')) {
    const indice = Number(botao.dataset.fase);
    let situacao = faseEstaLiberada(indice) ? 'Disponível' : 'Bloqueada';
    if (indice <= ultimaFaseConcluida) situacao = 'Concluída';
    botao.textContent = `${fases[indice].nome} · ${situacao}`;
    botao.disabled = !imagensProntas || !faseEstaLiberada(indice);
    if (indice === faseAtual) botao.setAttribute('aria-current', 'step');
    else botao.removeAttribute('aria-current');
  }
  const concluidas = ultimaFaseConcluida + 1;
  let aviso = `${concluidas} de ${fases.length} fases concluídas. Vença para liberar a próxima.`;
  if (concluidas === fases.length) aviso = 'Todas concluídas! Escolha qualquer fase para jogar novamente.';
  if (!armazenamentoDisponivel) aviso += ' Salvamento bloqueado: o avanço vale apenas nesta sessão.';
  elemento('#progress-status').textContent = aviso;
}
