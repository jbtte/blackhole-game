# 🌑 Buraco Negro - O Jogo (Black Hole Game)

Um jogo de estratégia e sorte implementado em um front-end puro (HTML, CSS e JavaScript), ideal para ser hospedado no GitHub Pages.

O jogo segue a regra onde a pontuação não é determinada pelo que você coleta, mas sim pelo que fica **adjacente ao ponto que ninguém pôde escolher (o Buraco Negro)**.

## 🕹️ Como Jogar

O objetivo é simples: Garantir que os números altos que você escolher não fiquem adjacentes ao círculo final que se tornará o Buraco Negro. Quem tiver a **menor soma de números** nos círculos adjacentes ao Buraco Negro, ganha.

### Regras

1.  **Tabuleito:** 21 círculos organizados em uma pirâmide (linhas de 1, 2, 3, 4, 5 e 6 círculos).
2.  **Turnos:** Os dois jogadores (Vermelho e Azul) se alternam nos turnos.
3.  **Números:** Os jogadores inserem números sequenciais de **1 a 10**. Como há 20 círculos para preencher pelos jogadores, a sequência (1 a 10) será repetida duas vezes.
4.  **Colocação:** No seu turno, o jogador clica em qualquer círculo vazio e insere o próximo número sequencial, tomando aquele círculo para si (indicado pela cor).
5.  **Buraco Negro:** Ao final de 20 jogadas, 20 círculos estarão preenchidos e 1 círculo estará vazio. Este círculo não preenchido é o **Buraco Negro**.
6.  **Pontuação:** A pontuação é calculada somando os valores dos círculos **adjacentes** (horizontal, vertical e diagonal) ao Buraco Negro. Cada jogador soma apenas os valores que estão nos *seus* círculos adjacentes.
7.  **Vencedor:** O jogador com a **menor pontuação total** ganha o jogo.

## 🛠️ Tecnologia

Este projeto é uma implementação **Front-end Pura**, garantindo máxima portabilidade e facilidade de *deploy*.

* **HTML5:** Estrutura do tabuleiro e da interface.
* **CSS3:** Estilização da pirâmide e cores dos jogadores.
* **JavaScript (ES6+):** Lógica do jogo, gerenciamento de estado e cálculo da pontuação final, incluindo um **Mapa de Adjacências** pré-calculado para eficiência.

## 🚀 Como Executar

Este projeto não requer *build* ou dependências de *backend*.

### Opção 1: Clonar e Abrir (Localmente)

1.  Clone o repositório:
    ```bash
    git clone [URL_DO_SEU_REPOSITORIO]
    cd buraco-negro-jogo
    ```
2.  Abra o arquivo `index.html` diretamente em seu navegador.

### Opção 2: GitHub Pages (Online)

O projeto está configurado para rodar perfeitamente no GitHub Pages:

1.  Faça o *push* dos arquivos (`index.html`, `style.css`, `script.js`) para o branch principal do seu repositório.
2.  Nas configurações do seu repositório, ative o **GitHub Pages** para o *branch* `main` (ou `master`) e a pasta raiz (`/`).
3.  O jogo estará acessível em: `https://[SEU_USUARIO].github.io/[NOME_DO_REPOSITORIO]`.

## ⚙️ Estrutura do Código (Para Desenvolvedores)

O código JavaScript (`script.js`) é organizado para clareza e manutenção:

| Arquivo/Variável | Descrição |
| :--- | :--- |
| `gameCircles` | Array de objetos que armazena o estado completo de cada círculo (jogador, valor, etc.). |
| `ADJACENCY_MAP` | Objeto crucial que define as conexões entre os 21 círculos (índices 0 a 20), eliminando a necessidade de cálculos de geometria complexos em tempo de execução. |
| `initGame()` | Função de inicialização, reseta o estado e constrói o DOM da pirâmide. |
| `handleCircleClick(event)` | Função principal para manipulação de cliques e aplicação da jogada. |
| `nextTurn()` | Lógica para alternar jogadores e avançar a contagem de 1 a 10. |
| `endGame()` | Função que localiza o Buraco Negro, utiliza o `ADJACENCY_MAP` para calcular as pontuações e exibe o resultado. |

---

### 👤 Autor

Implementado por um Analista Judiciário (e entusiasta de programação) em 2025.

*(Fique à vontade para contribuir com melhorias de UI/UX ou otimizações de código!)*
