console.log("loaded");

let rocket = document.getElementById("rocket");

let fps = 60;
let frameTime = 1000 / fps; // Time for each frame in milliseconds
let lastTime = performance.now();

let lastTime = 0;

function gameLoop(currentTime) {
    let deltaTime = currentTime - lastTime;

    if (deltaTime < frameTime) {
        // If not enough time has passed for the next frame, wait
        requestAnimationFrame(gameLoop);
        return;
    }

    lastTime = currentTime;

    // Your game logic goes here

    requestAnimationFrame(gameLoop);
}


function startGame(){

    menuScreen();
    // Start the game loop
    requestAnimationFrame(gameLoop);
    
}


function menuScreen(){

    while(true){

    }

}

startGame();