document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    let squares = Array.from(document.querySelectorAll('.grid div'));
    const scoreDisplay = document.querySelector('#score');
    scoreDisplay.style.color = 'red';
    const startBtn = document.querySelector('#start-btn');
    const width = 10;
    let nextRandom = 0;
    let timerId 
    let score = 0
    const colors = [
        'red',
        'yellow',
        'orange',
        'green',
        'purple'
    ]

    function updateTetrominoStyles(colors) {
        // Remove any existing style element
        const existingStyle = document.getElementById('tetromino-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        // Create a new style element
        const styleElement = document.createElement('style');
        styleElement.id = 'tetromino-styles';
        
        // Create CSS rules for each color
        let cssRules = '';
        colors.forEach((color, index) => {
            cssRules += `
            .tetromino[data-color="${index}"]::after,
            .tetromino[data-color="${index}"]::before {
                background: ${color};
            }
            `;
        });
        
        styleElement.textContent = cssRules;
        document.head.appendChild(styleElement);
    }

    updateTetrominoStyles(colors);

    const lTetromino = [
        [1, width + 1, width * 2 + 1, width * 2], 
        [width, width + 1, width + 2, width * 2 + 2],
        [1, width + 1, width * 2 + 1, 2], 
        [width, width * 2, width * 2 +1, width * 2 + 2],
    ];

    const zTetromino = [
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1],
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1]
    ];

    const tTetromino = [
        [1, width, width + 1, width + 2],
        [1, width + 1, width + 2, width * 2 +1],
        [width, width + 1, width + 2, width * 2 +1],
        [1, width, width +1, width * 2 + 1]
    ];

    const oTetromino = [
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1]
    ];

    const iTetromino = [
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width+ 3],
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3]
    ]

    const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];

    let currentPosition = 4;
    let currentRotation = 0;

    // segli un tatromino in modo randomico
    let random = Math.floor(Math.random()*theTetrominoes.length)
    console.log(random);
    
    let current = theTetrominoes[random][currentRotation];
    
    function draw() {
        current.forEach(index => {
            //squares [currentPosition + index].classList.add('tetromino');
            //squares[currentPosition + index].style.background = colors[random];
            //squares[currentPosition + index].style.backgroundColor = colors[random]

            squares[currentPosition + index].classList.add('tetromino');
            squares[currentPosition + index].setAttribute('data-color', random);
        })
    }
    
    function undraw () {
        current.forEach( index => {
            squares[currentPosition + index].classList.remove('tetromino');
            squares[currentPosition + index].removeAttribute('data-color');
        })
    }


    // assegna funzioni ai tasti
    function control(e) {
        if(e.keyCode === 37) {
            moveLeft()
        } else if (e.keyCode === 38) {
            rotate()
        } else if (e.keyCode === 39) {
            moveRight()
        }
        else if (e.keyCode === 40) {
            moveDown()
        }
    }
    document.addEventListener('keyup', control);

    // funzione per muovere verso il basso
    function moveDown() {
        undraw()
        currentPosition += width
        draw()
        freeze()
    }

    // freeze function
    function freeze() {
        if(current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            current.forEach(index => squares[currentPosition + index].classList.add('taken'))
            // start a new tetromino falling
            random = nextRandom
            nextRandom =  Math.floor(Math.random() * theTetrominoes.length)
            current = theTetrominoes[random][currentRotation]
            currentPosition = 4
            draw()
            displayShape()
            addScore()
            gameOver()
    }
}

    // muovi il tetromino a sinistra, a meno che non sia al bordo o ci sia un blocco
    function moveLeft() {
        undraw()
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)

        if(!isAtLeftEdge) currentPosition -=1

        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition +=1
        }

        draw()
    }

    // muovi il tetromino a destra, a meno che non sia al bordo o ci sia un blocco
    function moveRight() {
        undraw()
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width -1)

        if(!isAtRightEdge) currentPosition +=1

        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -=1
        }

        draw()
    }

    // ruouta il tetromino
    function rotate() {
        undraw()
        const originalRotation = currentRotation
        currentRotation++ 
        if(currentRotation === theTetrominoes[random].length) {
            currentRotation = 0
        }
        current = theTetrominoes[random][currentRotation]
        
        // Controlla se la rotazione è valida (non esce dai bordi e non sovrappone blocchi)
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1)
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)
        const hasConflict = current.some(index => squares[currentPosition + index].classList.contains('taken'))
        
        // Se c'è un problema, ripristina la rotazione originale
        if ((isAtRightEdge && isAtLeftEdge) || hasConflict) {
            currentRotation = originalRotation
            current = theTetrominoes[random][currentRotation]
        }
        
        draw()
    }

    // Mostra il prossimo tetromino nel mini-grid
    const displaySquares = document.querySelectorAll('.mini-grid div')
    const displayWidth = 4
    const displayIndex = 0

    // Tetromino senza rotazione
    const upNextTetrominoes = [
        [1, displayWidth + 1, displayWidth * 2 + 1, 2], // lTetromino
        [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1], // zTetromino
        [1, displayWidth, displayWidth + 1, displayWidth + 2], // tTetromino
        [0, 1, displayWidth, displayWidth + 1], // oTetromino
        [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1] // iTetromino
    ]

    // Mostra il prossimo tetromino nel mini-grid
// Mostra il prossimo tetromino nel mini-grid
function displayShape() {
    // Pulisci il mini-grid
    displaySquares.forEach(square => {
        square.classList.remove('tetromino');
        square.removeAttribute('data-color');
    })
    
    // Offset di posizione per centrare ciascun tetromino
    const displayOffsets = [
        0,  // lTetromino
        1,  // zTetromino
        0,  // tTetromino
        1,  // oTetromino
        1   // iTetromino
    ]
    
    // Offset verticale per centrare i tetromini più corti
    const verticalOffsets = [
        0,  // lTetromino
        1,  // zTetromino
        0,  // tTetromino
        1,  // oTetromino 
        0   // iTetromino 
    ]
    
    // Applica gli offset e disegna il tetromino
    const displayIndexWithOffset = displayIndex + displayOffsets[nextRandom] + (verticalOffsets[nextRandom] * displayWidth)
    
    upNextTetrominoes[nextRandom].forEach(index => {
        displaySquares[displayIndexWithOffset + index].classList.add('tetromino');
        displaySquares[displayIndexWithOffset + index].setAttribute('data-color', nextRandom);
    })
}

    // Aggiungi funzionalità al pulsante di start
    startBtn.addEventListener('click', () => {
        if (timerId) {
            clearInterval(timerId)
            timerId = null
            startBtn.textContent = 'Start'
        } else {
            draw()
            timerId = setInterval(moveDown, 1000)
            nextRandom = Math.floor(Math.random()*theTetrominoes.length)
            displayShape()
            startBtn.textContent = 'Pause'
        }
    });

    // aggiungi punteggio
    function addScore() {
        for(let i = 0; i < 199; i +=width) {
            const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]

            if(row.every(index => squares[index].classList.contains('taken'))) {
                if (scoreDisplay.innerHTML === 0) {
                    scoreDisplay.style.color = 'red'
                } else {
                    scoreDisplay.style.color = 'Yellow'
                }
              score += 10
              scoreDisplay.innerHTML = score
              row.forEach(index => {
                squares[index].classList.remove('taken');
                squares[index].classList.remove('tetromino');
                squares[index].removeAttribute('data-color');
              })
              const squaresRemoved = squares.splice(i, width)  
              squares = squaresRemoved.concat(squares)
              squares.forEach(cell => grid.appendChild(cell))
              
            }
        }
    };

    //game over
    function gameOver() {
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            scoreDisplay.innerHTML = 'end'
            clearInterval(timerId)
        }
    }

});

