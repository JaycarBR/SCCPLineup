const posicoesDiv = document.getElementById("posicoes");
const formacaoSelect = document.getElementById("formacao");
const aplicarBtn = document.getElementById("aplicar");
const categoriaSelect = document.getElementById("categoria");

let draggedPlayer = null;
let formacaoAtual = "41212"; // guarda a formação aplicada

// Jogadores separados por categoria (ADICIONADO Raniele)
const jogadoresPorCategoria = {
  goleiros: ["Hugo", "J. Ricardo", "F. Longo"],
  defensores: ["Matheus", "P. Milans", "Jacaré", "G. Henrique", "G. Paulista", "Ramalho", "Tchoca", "Bidu", "Angileri", "Hugo"],
  meias: ["Allan","Raniele", "Martinez", "André", "M. Pereira", "Charles", "Bidon", "Carrillo", "Bahia", "Garro", "Labyad", "Amorim"], // Raniele adicionado aqui
  atacantes: ["Depay", "Vitinho", "Kayke", "Yuri", "G. Negão", "P. Raul", "K. Cesar", "Dieguinho"]
};

// NOVO: Jogadores iniciais para popular o campo na load (11 jogadores)
const jogadoresIniciais = [
  "Hugo",        // 0: Goleiro
  "Bidu",     // 1: Defesa
  "G. Henrique", // 2: Defesa
  "G. Paulista", // 3: Defesa
  "Matheus",        // 4: Defesa
  "Raniele",     // 5: Volante/Meia
  "André",       // 6: Meia
  "Bidon",       // 7: Meia
  "Garro",       // 8: Meia
  "Depay",       // 9: Atacante
  "Yuri"         // 10: Atacante
];

// Renderiza lista de jogadores da categoria escolhida
function renderizarJogadores(categoria) {
  const lista = document.getElementById("lista-jogadores");
  lista.innerHTML = "";

  jogadoresPorCategoria[categoria].forEach(nome => {
    // Só adiciona na lista se NÃO estiver já no campo
    if (!Array.from(posicoesDiv.querySelectorAll('.nome-jogador')).some(el => el.textContent === nome)) {
      const jogador = document.createElement("div");
      jogador.classList.add("jogador");
      jogador.textContent = nome;
      jogador.setAttribute("draggable", "true");

      aplicarEventosDragTouch(jogador);
      lista.appendChild(jogador);
    }
  });
}

// NOVO: Função para popular campo com jogadores iniciais
function popularCampoInicial(coords) {
  criarPosicoes(coords); // Cria posições vazias primeiro

  // Preenche com os 11 jogadores iniciais
  const nomes = posicoesDiv.querySelectorAll('.nome-jogador');
  jogadoresIniciais.forEach((nome, index) => {
    if (index < nomes.length && nomes[index].textContent === "") {
      nomes[index].textContent = nome;
    }
  });
}

function criarPosicoes(coords) {
  posicoesDiv.innerHTML = "";

  const campo = document.querySelector("#campo-wrapper img");
  const largura = campo.clientWidth;
  const altura = campo.clientHeight;

  coords.forEach(coord => {
    const pos = document.createElement("div");
    pos.classList.add("posicao");

    // Calcula posição em pixels
    let left = coord.x * largura;
    let top = coord.y * altura;

    // Garante que o círculo fique dentro da imagem
    const raio = largura * 0.03;
    left = Math.min(Math.max(left, raio), largura - raio);
    top = Math.min(Math.max(top, raio), altura - raio);

    pos.style.left = left + "px";
    pos.style.top = top + "px";

    const circulo = document.createElement("div");
    circulo.classList.add("circulo");
    circulo.style.width = raio * 2 + "px";
    circulo.style.height = raio * 2 + "px";

    const nome = document.createElement("div");
    nome.classList.add("nome-jogador");
    nome.textContent = ""; // Vazio inicialmente

    // Suporte a mouse (drop de jogador)
    pos.addEventListener("dragover", e => e.preventDefault());
    pos.addEventListener("drop", e => {
      if (draggedPlayer) {
        if (nome.textContent !== "") {
          const jogadorAntigo = document.createElement("div");
          jogadorAntigo.classList.add("jogador");
          jogadorAntigo.textContent = nome.textContent;
          jogadorAntigo.setAttribute("draggable", "true");

          aplicarEventosDragTouch(jogadorAntigo);
          document.getElementById("lista-jogadores").appendChild(jogadorAntigo);
        }

        nome.textContent = draggedPlayer.textContent;
        draggedPlayer.remove();
        draggedPlayer = null;
        renderizarJogadores(categoriaSelect.value); // Atualiza lista
      }
    });

    // Suporte a toque (drop de jogador)
    pos.addEventListener("touchend", e => {
      if (draggedPlayer) {
        if (nome.textContent !== "") {
          const jogadorAntigo = document.createElement("div");
          jogadorAntigo.classList.add("jogador");
          jogadorAntigo.textContent = nome.textContent;
          jogadorAntigo.setAttribute("draggable", "true");

          aplicarEventosDragTouch(jogadorAntigo);
          document.getElementById("lista-jogadores").appendChild(jogadorAntigo);
        }

        nome.textContent = draggedPlayer.textContent;
        draggedPlayer.remove();
        draggedPlayer = null;
        renderizarJogadores(categoriaSelect.value); // Atualiza lista
      }
    });

    pos.appendChild(circulo);
    pos.appendChild(nome);
    posicoesDiv.appendChild(pos);

    tornarArrastavel(pos);
  });
}

// Função para aplicar eventos de drag e toque na lista de jogadores
function aplicarEventosDragTouch(jogador) {
  jogador.addEventListener("dragstart", e => {
    draggedPlayer = jogador;
  });

  jogador.addEventListener("touchstart", e => {
    draggedPlayer = jogador;
  });
}

// Função para arrastar posições (drag corrigido - centraliza no mouse/dedo)
function tornarArrastavel(pos) {
  let offsetX = 0, offsetY = 0;

  pos.addEventListener("mousedown", e => {
    const rect = pos.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    function mover(ev) {
      const containerRect = pos.parentElement.getBoundingClientRect();
      pos.style.left = (ev.clientX - containerRect.left - offsetX) + "px";
      pos.style.top = (ev.clientY - containerRect.top - offsetY) + "px";
    }

    function soltar() {
      document.removeEventListener("mousemove", mover);
      document.removeEventListener("mouseup", soltar);
    }

    document.addEventListener("mousemove", mover);
    document.addEventListener("mouseup", soltar);
  });

  pos.addEventListener("touchstart", e => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = pos.getBoundingClientRect();
    offsetX = touch.clientX - rect.left;
    offsetY = touch.clientY - rect.top;

    function mover(ev) {
      ev.preventDefault();
      const touch = ev.touches[0];
      const containerRect = pos.parentElement.getBoundingClientRect();
      pos.style.left = (touch.clientX - containerRect.left - offsetX) + "px";
      pos.style.top = (touch.clientY - containerRect.top - offsetY) + "px";
    }

    function soltar() {
      document.removeEventListener("touchmove", mover);
      document.removeEventListener("touchend", soltar);
    }

    document.addEventListener("touchmove", mover, { passive: false });
    document.addEventListener("touchend", soltar);
  });
}

// Formações (mesmas de antes)
const formacoes = {
  "352": [
  { x: 0.5, y: 0.85 }, // goleiro
  { x: 0.3, y: 0.69 }, { x: 0.5, y: 0.69 }, { x: 0.7, y: 0.69 }, //zagueiros
  { x: 0.25, y: 0.4 }, // ala esquerda
  { x: 0.4, y: 0.5 }, // meia central esquerda
  { x: 0.6, y: 0.5 }, // meia central direita
  { x: 0.75, y: 0.4 }, // ala direita
  { x: 0.5, y: 0.29 }, //Meia armador
  { x: 0.4, y: 0.17 }, { x: 0.6, y: 0.17 } //Atacantes
],
  "442": [
    { x: 0.5, y: 0.85 },
    { x: 0.2, y: 0.7 }, { x: 0.4, y: 0.7 }, { x: 0.6, y: 0.7 }, { x: 0.8, y: 0.7 },
    { x: 0.25, y: 0.4 }, { x: 0.4, y: 0.45 }, { x: 0.6, y: 0.45 }, { x: 0.75, y: 0.4 },
    { x: 0.4, y: 0.17 }, { x: 0.6, y: 0.17 } //Atacantes
  ],
  "433": [
    { x: 0.5, y: 0.85 },
    { x: 0.2, y: 0.7 }, { x: 0.4, y: 0.7 }, { x: 0.6, y: 0.7 }, { x: 0.8, y: 0.7 },
    { x: 0.40, y: 0.5 }, { x: 0.5, y: 0.32 }, { x: 0.60, y: 0.5 },
    { x: 0.3, y: 0.25 }, { x: 0.5, y: 0.13 }, { x: 0.7, y: 0.25 }
  ],
  "41212": [
    { x: 0.5, y: 0.85 }, //Goleiro
    { x: 0.2, y: 0.7 }, { x: 0.4, y: 0.7 }, { x: 0.6, y: 0.7 }, { x: 0.8, y: 0.7 }, //Defensores
    { x: 0.5, y: 0.57 }, //Volante
    { x: 0.35, y: 0.43 }, { x: 0.65, y: 0.43 }, //Centro-campistas
    { x: 0.5, y: 0.29 }, //Meia armador 
    { x: 0.4, y: 0.17 }, { x: 0.6, y: 0.17 } //Atacantes
  ],
  "4141": [
  { x: 0.5, y: 0.85 }, // goleiro

  // defesa (linha de 4)
  { x: 0.2, y: 0.7 },
  { x: 0.4, y: 0.7 },
  { x: 0.6, y: 0.7 },
  { x: 0.8, y: 0.7 },
  { x: 0.5, y: 0.56 }, //Volante

  // meio-campo avançado (linha de 4)
  { x: 0.25, y: 0.31 }, // meia esquerda
  { x: 0.4, y: 0.31 },  // meia central esquerda
  { x: 0.6, y: 0.31 },  // meia central direita
  { x: 0.75, y: 0.31 }, // meia direita
  { x: 0.5, y: 0.13 }//atacante
]};

// Botão aplicar formação
aplicarBtn.addEventListener("click", () => {
  formacaoAtual = formacaoSelect.value;
  popularCampoInicial(formacoes[formacaoAtual]); // Usa nova função
});

// Atualiza lista ao trocar categoria
categoriaSelect.addEventListener("change", () => {
  renderizarJogadores(categoriaSelect.value);
});

// Inicializa com time completo em campo (4-1-2-1-2)
window.addEventListener("load", () => {
  popularCampoInicial(formacoes[formacaoAtual]); // Carrega time completo!
  renderizarJogadores("goleiros"); // Lista começa vazia (todos em campo)
});

// Recalcula ao redimensionar
window.addEventListener("resize", () => {
  popularCampoInicial(formacoes[formacaoAtual]);
});
