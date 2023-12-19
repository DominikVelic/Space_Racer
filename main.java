console.log("loaded");

let player = document.getElementById("rocket");
let obstacles = [];
const FPS = 60; // Set your frames per second
const frameDuration = 1000 / FPS;
let lastTime = Date.now();
let playerSpeed = 5;

function gameLoop() {
    const currentTime = Date.now();
    const deltaTime = currentTime - lastTime;

    if (deltaTime > frameDuration) {
        // Update game state here
        update();
        // Render game state here
        render();
        lastTime = currentTime;
    }

    window.requestAnimationFrame(gameLoop);
}

function update(){
    // todo: aktualizovat poziciu rackety a obstacles[]
    
}

function render(){
    // todo: nakreslime img na pozicii kde su obstacles[]
}


function startGame(){
    menuScreen();
    // Start the game loop
    window.requestAnimationFrame(gameLoop);
}


function menuScreen(){

}

function generateMeteors(){
    
}


menuScreen()