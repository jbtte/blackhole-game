// Constantes do Jogo
const TOTAL_CIRCLES = 21;
const MAX_NUMBER = 10;
const PYRAMID_ROWS = [1, 2, 3, 4, 5, 6]; // Círculos por linha
const CONTAINER = document.getElementById('pyramid-container');
const STATUS_DISPLAY = document.getElementById('current-player-display');
const NUMBER_DISPLAY = document.getElementById('next-number-display');
const RESULTS_DIV = document.getElementById('game-results');
const RESET_BUTTON = document.getElementById('reset-button');

// Estado do Jogo (State Management)
let gameCircles = []; // Array de objetos para armazenar o estado de cada círculo
let currentPlayer = 1; // 1 ou 2
let currentNumber = 1; // Número que será colocado no próximo turno
let circlesFilled = 0;
let gameOver = false;

// Mapa de adjacências (índices 0 a 20)
// Este mapa define quais círculos (índices) são adjacentes a cada outro círculo.
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
    gameCircles = Array.from({ length: TOTAL_CIRCLES }, (_, index) => ({
        id: index,
        row: getRow(index),
        player: 0, // 0: vazio, 1: Jogador 1, 2: Jogador 2
        value: null,
        isBlackHole: false,
        element: null // Referência ao elemento DOM
    }));

    currentPlayer = 1;
    currentNumber = 1;
    circlesFilled = 0;
    gameOver = false;
    RESULTS_DIV.classList.add('hidden');
    
    generatePyramidDOM();
    updateStatusDisplay();
}

/**
 * Determina a linha de um círculo dado seu índice.
 * @param {number} index - Índice do círculo (0 a 20).
 * @returns {number} O número da linha (1 a 6).
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
    CONTAINER.innerHTML = ''; // Limpa o container
    let circleIndex = 0;
    
    PYRAMID_ROWS.forEach((count, rowIndex) => {
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
 * Lida com o clique em um círculo.
 * @param {Event} event - O evento de clique.
 */
function handleCircleClick(event) {
    if (gameOver) return;

    const circleElement = event.target;
    const index = parseInt(circleElement.dataset.index);

    if (gameCircles[index].player === 0) { // Se o círculo estiver vazio
        // Atualiza o estado
        gameCircles[index].player = currentPlayer;
        gameCircles[index].value = currentNumber;
        circlesFilled++;

        // Atualiza o DOM
        circleElement.textContent = currentNumber;
        circleElement.classList.add('filled', `player-${currentPlayer}`);
        circleElement.classList.remove('circle'); // Remove o estilo de clique
        
        // Passa o turno
        nextTurn();
    }
}

/**
 * Avança para o próximo turno (próximo jogador e próximo número).
 */
function nextTurn() {
    if (circlesFilled < TOTAL_CIRCLES) {
        // Alterna o jogador
        currentPlayer = currentPlayer === 1 ? 2 : 1;

        // Avança o número (de 1 a 10)
        currentNumber = (currentNumber % MAX_NUMBER) + 1;
        
        updateStatusDisplay();
    } else {
        endGame();
    }
}

/**
 * Atualiza o display do jogador atual e do próximo número.
 */
function updateStatusDisplay() {
    STATUS_DISPLAY.textContent = `Jogador ${currentPlayer} (${currentPlayer === 1 ? 'Vermelho' : 'Azul'})`;
    NUMBER_DISPLAY.textContent = currentNumber;
}

/**
 * Executa a lógica de pontuação no final do jogo.
 */
function endGame() {
    gameOver = true;
    
    // 1. Encontrar o Buraco Negro (o único círculo não preenchido)
    const blackHole = gameCircles.find(c => c.player === 0);
    
    if (!blackHole) {
        // Isso só aconteceria se o TOTAL_CIRCLES estivesse errado.
        console.error("Erro: Nenhum Buraco Negro encontrado.");
        return;
    }

    blackHole.isBlackHole = true;
    blackHole.element.classList.add('black-hole');
    blackHole.element.textContent = 'BH'; // Símbolo para o Buraco Negro
    
    // 2. Calcular a pontuação
    const blackHoleIndex = blackHole.id;
    const adjacentIndices = ADJACENCY_MAP[blackHoleIndex] || [];
    
    let scorePlayer1 = 0;
    let scorePlayer2 = 0;
    
    adjacentIndices.forEach(index => {
        const adjacentCircle = gameCircles[index];
        // O valor é 0 para o Buraco Negro (que não tem valor de jogada)
        if (adjacentCircle.value !== null) { 
            if (adjacentCircle.player === 1) {
                scorePlayer1 += adjacentCircle.value;
            } else if (adjacentCircle.player === 2) {
                scorePlayer2 += adjacentCircle.value;
            }
        }
        // Opcional: Destacar os adjacentes
        adjacentCircle.element.style.border = '5px solid black';
    });

    // 3. Exibir Resultados
    document.getElementById('black-hole-id').textContent = `ID ${blackHoleIndex}`;
    document.getElementById('score-1').textContent = scorePlayer1;
    document.getElementById('score-2').textContent = scorePlayer2;

    let winnerMessage;
    if (scorePlayer1 < scorePlayer2) {
        winnerMessage = "🏆 Jogador 1 (Vermelho) VENCEU!";
    } else if (scorePlayer2 < scorePlayer1) {
        winnerMessage = "🏆 Jogador 2 (Azul) VENCEU!";
    } else {
        winnerMessage = "EMPATE!";
    }
    document.getElementById('winner-message').textContent = winnerMessage;

    RESULTS_DIV.classList.remove('hidden');
}


// Listeners
RESET_BUTTON.addEventListener('click', initGame);

// Inicia o jogo quando a página carrega
document.addEventListener('DOMContentLoaded', initGame);