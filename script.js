// Constantes do Jogo
const TOTAL_CIRCLES = 21;
const MAX_NUMBER = 10;
const PYRAMID_ROWS = [1, 2, 3, 4, 5, 6]; // Círculos por linha
const CONTAINER = document.getElementById('pyramid-container');
const STATUS_DISPLAY = document.getElementById('current-player-display');
const NUMBER_DISPLAY = document.getElementById('next-number-display');
const RESULTS_DIV = document.getElementById('game-results');
const RESET_BUTTON = document.getElementById('reset-button');

// Estado do Jogo
let gameCircles = [];
let currentPlayer = 1; // 1: Jogador 1 (Vermelho), 2: Jogador 2 / Computador (Azul)
let circlesFilled = 0;
let gameOver = false;

// Rastreia o próximo número para cada jogador individualmente (1 a 10)
let nextNumberPlayer1 = 1;
let nextNumberPlayer2 = 1;

// Modo de Jogo
let gameMode = 'pvp'; // 'pvp' ou 'pvc'
let difficulty = 'easy'; // 'easy' | 'medium' | 'hard'
let aiThinking = false;
let aiTimeout = null;

// Mapa de adjacências (índices 0 a 20) - Essencial para a regra do Buraco Negro
const ADJACENCY_MAP = {
    // Linha 1 (1 círculo, índice 0)
    0: [1, 2],
    // Linha 2 (2 círculos, índices 1-2)
    1: [0, 2, 3, 4], 2: [0, 1, 4, 5],
    // Linha 3 (3 círculos, índices 3-5)
    3: [1, 4, 6, 7], 4: [1, 2, 3, 5, 7, 8], 5: [2, 4, 8, 9],
    // Linha 4 (4 círculos, índices 6-9)
    6: [3, 7, 10, 11], 7: [3, 4, 6, 8, 11, 12], 8: [4, 5, 7, 9, 12, 13], 9: [5, 8, 13, 14],
    // Linha 5 (5 círculos, índices 10-14)
    10: [6, 11, 15, 16], 11: [6, 7, 10, 12, 16, 17], 12: [7, 8, 11, 13, 17, 18],
    13: [8, 9, 12, 14, 18, 19], 14: [9, 13, 19, 20],
    // Linha 6 (6 círculos, índices 15-20)
    15: [10, 16], 16: [10, 11, 15, 17], 17: [11, 12, 16, 18],
    18: [12, 13, 17, 19], 19: [13, 14, 18, 20], 20: [14, 19]
};


/**
 * Inicializa o estado do jogo e o DOM.
 */
function initGame() {
    if (aiTimeout) {
        clearTimeout(aiTimeout);
        aiTimeout = null;
    }
    aiThinking = false;

    gameCircles = Array.from({ length: TOTAL_CIRCLES }, (_, index) => ({
        id: index,
        row: getRow(index),
        player: 0, // 0: vazio
        value: null,
        isBlackHole: false,
        element: null
    }));

    currentPlayer = 1;
    circlesFilled = 0;
    gameOver = false;

    nextNumberPlayer1 = 1;
    nextNumberPlayer2 = 1;

    RESULTS_DIV.classList.add('hidden');
    NUMBER_DISPLAY.parentElement.style.display = '';

    generatePyramidDOM();
    updateStatusDisplay();
}

/**
 * Determina a linha de um círculo dado seu índice.
 */
function getRow(index) {
    let count = 0;
    for (let i = 0; i < PYRAMID_ROWS.length; i++) {
        count += PYRAMID_ROWS[i];
        if (index < count) return i + 1;
    }
}

/**
 * Cria a estrutura da pirâmide no DOM e anexa os event listeners.
 */
function generatePyramidDOM() {
    CONTAINER.innerHTML = '';
    let circleIndex = 0;

    PYRAMID_ROWS.forEach((count) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'pyramid-row';

        for (let i = 0; i < count; i++) {
            const circle = document.createElement('div');
            circle.className = 'circle';
            circle.dataset.index = circleIndex;
            circle.addEventListener('click', handleCircleClick);

            gameCircles[circleIndex].element = circle;
            rowDiv.appendChild(circle);
            circleIndex++;
        }
        CONTAINER.appendChild(rowDiv);
    });
}

/**
 * Atualiza o display do jogador atual e do próximo número.
 */
function updateStatusDisplay() {
    const nextNumber = currentPlayer === 1 ? nextNumberPlayer1 : nextNumberPlayer2;

    if (gameMode === 'pvc' && currentPlayer === 2) {
        STATUS_DISPLAY.textContent = 'Computador (Azul)';
        STATUS_DISPLAY.classList.toggle('thinking', aiThinking);
    } else {
        STATUS_DISPLAY.textContent = `Jogador ${currentPlayer} (${currentPlayer === 1 ? 'Vermelho' : 'Azul'})`;
        STATUS_DISPLAY.classList.remove('thinking');
    }

    NUMBER_DISPLAY.textContent = nextNumber;
}

/**
 * Registra uma jogada no índice especificado (humano ou IA).
 */
function playAt(index) {
    if (gameOver || gameCircles[index].player !== 0) return;

    const numberToPlay = currentPlayer === 1 ? nextNumberPlayer1 : nextNumberPlayer2;

    gameCircles[index].player = currentPlayer;
    gameCircles[index].value = numberToPlay;

    const circleElement = gameCircles[index].element;
    circleElement.textContent = numberToPlay;
    circleElement.classList.add('filled', `player-${currentPlayer}`);

    nextTurn();
}

/**
 * Lida com o clique em um círculo (apenas para jogadores humanos).
 */
function handleCircleClick(event) {
    if (gameOver || aiThinking) return;
    if (gameMode === 'pvc' && currentPlayer === 2) return;

    const index = parseInt(event.target.dataset.index);
    playAt(index);
}

/**
 * Avança para o próximo turno.
 */
function nextTurn() {
    circlesFilled++;

    if (currentPlayer === 1 && nextNumberPlayer1 < MAX_NUMBER) {
        nextNumberPlayer1++;
    } else if (currentPlayer === 2 && nextNumberPlayer2 < MAX_NUMBER) {
        nextNumberPlayer2++;
    }

    if (circlesFilled >= 20) {
        endGame();
        return;
    }

    currentPlayer = currentPlayer === 1 ? 2 : 1;
    updateStatusDisplay();

    if (gameMode === 'pvc' && currentPlayer === 2) {
        triggerAI();
    }
}


// --- IA ---

/**
 * Aciona a IA com um pequeno delay para dar feedback visual ao jogador.
 */
function triggerAI() {
    aiThinking = true;
    updateStatusDisplay();

    aiTimeout = setTimeout(() => {
        aiThinking = false;
        if (difficulty === 'easy')        aiMoveEasy();
        else if (difficulty === 'medium') aiMoveMedium();
    }, 500);
}

/**
 * IA Fácil: escolhe um círculo vazio aleatório.
 */
function aiMoveEasy() {
    const emptyCircles = gameCircles.filter(c => c.player === 0);
    if (emptyCircles.length === 0) return;
    const chosen = emptyCircles[Math.floor(Math.random() * emptyCircles.length)];
    playAt(chosen.id);
}

/**
 * IA Médio: heurística baseada em exposição ao Buraco Negro.
 *
 * Risco de jogar em X = quantidade de vizinhos vazios de X.
 * Cada vizinho vazio é um candidato a Buraco Negro que exporia X.
 * Para números altos, o AI é mais seletivo na escolha da posição.
 */
function aiMoveMedium() {
    const emptyCircles = gameCircles.filter(c => c.player === 0);
    if (emptyCircles.length === 0) return;

    const numberToPlay = nextNumberPlayer2;

    const scored = emptyCircles.map(circle => {
        const emptyNeighbors = (ADJACENCY_MAP[circle.id] || [])
            .filter(ni => gameCircles[ni].player === 0)
            .length;
        return { circle, risk: emptyNeighbors };
    });

    scored.sort((a, b) => a.risk - b.risk);

    // Quanto maior o número a jogar, mais restrito é o pool de candidatos
    let topFraction;
    if (numberToPlay >= 7)      topFraction = 0.20;
    else if (numberToPlay >= 5) topFraction = 0.35;
    else                        topFraction = 0.55;

    const topCount = Math.max(1, Math.ceil(scored.length * topFraction));
    const candidates = scored.slice(0, topCount);
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];

    playAt(chosen.circle.id);
}


// --- Fim de Jogo ---

/**
 * Executa a lógica de pontuação no final do jogo.
 */
function endGame() {
    gameOver = true;
    STATUS_DISPLAY.textContent = 'Fim de Jogo!';
    STATUS_DISPLAY.classList.remove('thinking');
    NUMBER_DISPLAY.parentElement.style.display = 'none';

    // 1. Encontrar o Buraco Negro (o único círculo não preenchido)
    const blackHole = gameCircles.find(c => c.player === 0);

    if (!blackHole) {
        console.error("Erro: Nenhum Buraco Negro encontrado.");
        return;
    }

    // 2. Aplicar estilo do Buraco Negro
    blackHole.isBlackHole = true;
    blackHole.element.classList.add('black-hole');
    blackHole.element.textContent = 'BH';

    // 3. Calcular a pontuação
    const blackHoleIndex = blackHole.id;
    const adjacentIndices = ADJACENCY_MAP[blackHoleIndex] || [];

    let scorePlayer1 = 0;
    let scorePlayer2 = 0;

    adjacentIndices.forEach(index => {
        const adjacentCircle = gameCircles[index];
        if (adjacentCircle.value !== null) {
            if (adjacentCircle.player === 1) {
                scorePlayer1 += adjacentCircle.value;
            } else if (adjacentCircle.player === 2) {
                scorePlayer2 += adjacentCircle.value;
            }
        }
        adjacentCircle.element.style.border = '5px dashed black';
    });

    // 4. Exibir Resultados
    document.getElementById('black-hole-id').textContent = `ID ${blackHoleIndex + 1}`;
    document.getElementById('score-1').textContent = scorePlayer1;
    document.getElementById('score-2').textContent = scorePlayer2;

    // Atualiza labels conforme o modo de jogo
    document.querySelector('.player-label-2').textContent =
        gameMode === 'pvc' ? 'Computador (Azul):' : 'Jogador 2 (Azul):';

    let winnerMessage;
    if (scorePlayer1 < scorePlayer2) {
        winnerMessage = gameMode === 'pvc' ? '🏆 Você VENCEU!' : '🏆 Jogador 1 (Vermelho) VENCEU!';
    } else if (scorePlayer2 < scorePlayer1) {
        winnerMessage = gameMode === 'pvc' ? '🏆 Computador VENCEU!' : '🏆 Jogador 2 (Azul) VENCEU!';
    } else {
        winnerMessage = 'EMPATE!';
    }
    document.getElementById('winner-message').textContent = winnerMessage;

    RESULTS_DIV.classList.remove('hidden');
}


// --- Seleção de Modo e Dificuldade ---

function setMode(mode) {
    gameMode = mode;
    document.getElementById('btn-pvp').classList.toggle('active', mode === 'pvp');
    document.getElementById('btn-pvc').classList.toggle('active', mode === 'pvc');
    document.getElementById('difficulty-selector').classList.toggle('hidden', mode === 'pvp');
    initGame();
}

function setDifficulty(diff) {
    difficulty = diff;
    document.getElementById('btn-easy').classList.toggle('active', diff === 'easy');
    document.getElementById('btn-medium').classList.toggle('active', diff === 'medium');
    initGame();
}


// Listeners
document.getElementById('btn-pvp').addEventListener('click', () => setMode('pvp'));
document.getElementById('btn-pvc').addEventListener('click', () => setMode('pvc'));
document.getElementById('btn-easy').addEventListener('click', () => setDifficulty('easy'));
document.getElementById('btn-medium').addEventListener('click', () => setDifficulty('medium'));
RESET_BUTTON.addEventListener('click', initGame);

// Inicia o jogo quando a página carrega
document.addEventListener('DOMContentLoaded', initGame);
