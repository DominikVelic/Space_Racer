console.log("loaded");

let game;
let continueButton = document.getElementById("unpause");
let nextLevelButton = document.getElementById("next-level-button");
let menu = document.getElementById("menu");
let gameOverScreen = document.getElementById("gameOver");
let levelPassedScreen = document.getElementById("levelPassed");



if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
    .then(function() { console.log("Service Worker Registered"); });
}

if (window.DeviceOrientationEvent) {
    console.log("DeviceOrientationEvent supported");
} else {
    console.log("DeviceOrientationEvent not supported");
}

if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
        .then(permissionState => {
            if (permissionState === 'granted') {
                console.log("Permission granted");
            } else {
                console.log("Perminission not granted");
            }
        })
        .catch(console.error);
}

class Game {

    constructor(canvasWidth,canvasHeight) {
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");
        this.player = null;
        this.interval = null;
        this.background = null;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.objects = [];
        this.levelIndex = 0;
        this.startMenu = null;
        this.paused = null;
        this.gameOver = null;
        window.addEventListener('keydown', (e) => {
            if(this.paused && e.key == "p" && !this.startMenu && !this.gameOver){
                unpause();
            }
            else if(!this.paused && e.key == "p" && !this.startMenu && !this.gameOver){             
                pause();
            }
        });
        window.addEventListener("touchstart", () => {
            if(!this.paused && !this.startMenu && !this.gameOver){
                pause();
            }
        },false);
    }

    initialize() {
        continueButton.textContent = "Start";
        this.player = new Player(1750, 2000, 500, 600, this);
        this.background = new Background(0, -4000, 4000, 8000, this);
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.startMenuScreen();
        this.fillObjects();
        this.randomLevel();
        this.paused = false;
        this.startMenu = true;
        this.gameOver = false;
    }

    gameOverScreen(){
        this.gameOver = true
        gameOverScreen.style.display = "block";
        this.stop();
    }

    fillObjects() {
        this.objects = [];
        fetch('./levels.json')
        .then(response => {
            if(response.ok){
                return response.json();
            }
            else{
                throw new Error("Failed to fetch resource");
            }
        })
        .then(result =>{
            if(result != null){
                let levelData = result.levels;
                for (let i = 0; i < levelData.length; i++) {
                    this.objects[i] = [];
                    for (let j = 0; j < levelData[i].meteors; j++) {
                        this.objects[i][j] = new Meteor(levelData[i].meteor_x[j], levelData[i].meteor_y[j], 600, 600, levelData[i].meteor_speed, this);
                    }
                }
            }
    
        })
        .catch(error => {
            return caches.match('./levels.json').then(function(response) {
                if(response) {
                  return response.json();
                } else {
                  console.error("Resource not in cache");
                }
            });
        });

        
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    randomLevel(){
        this.levelIndex = getRandomNumFromTo(0,5);
    }

    checkLevelEnd(){
        let objectsPassed = 0;
        for (let i = 0; i < this.objects[this.levelIndex].length; i++) {
            if(!this.objects[this.levelIndex][i].inGame)
                objectsPassed++;
        }
        if(objectsPassed == this.objects[this.levelIndex].length){
            this.levelPassedScreen();
        }

    }

    startMenuScreen(){
        this.interval = setInterval(() => {
            this.clear();
            this.drawBackground();
            this.player.update();
        }, 20);
    }

    levelPassedScreen(){
        levelPassedScreen.style.display = "block";
        if(this.levelIndex==4){
            nextLevelButton.innerHTML="Play again";
        }
        else{
            nextLevelButton.innerHTML="Next level";
        }
    }
    
    drawCurrentLevel(){
        this.context.font = "200px SpaceMission";
        this.context.fillStyle = "white";
        this.context.fillText("Level: "+(this.levelIndex+1), 100, 3900);
    }

    drawBackground() {
        this.background.moveUp();
        this.background.draw();
    }

    
    checkCollision() {
        for (let i = 0; i < this.objects[this.levelIndex].length; i++) {
            if (this.player.isCollidingWith(this.objects[this.levelIndex][i])) {
                this.gameOverScreen();
                break;
            }
        }
    }

    start(){
        this.interval = setInterval(() => this.updateGame(), 20);
    }

    stop() {
        clearInterval(this.interval);
    }

    updateObjects() {
        for (let i = 0; i < this.objects[this.levelIndex].length; i++) {
            this.objects[this.levelIndex][i].update();
        }
    }

    nextLevel(){
        this.levelIndex++;
        if(this.levelIndex >= 5){
            this.levelIndex = 0;
        }
        this.stop();
        this.start();
        levelPassedScreen.style.display = "none";
    }

    updateGame() {
        this.clear();
        this.drawBackground();
        this.updateObjects();
        this.checkCollision();
        this.drawCurrentLevel();
        this.player.update();
        this.checkLevelEnd();
    }
}

class Component {
    
    constructor(x, y, width, height,game) {
        this.game = game;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.speedX = 0;
        this.speedY = 0;

    }
    
    move(){
        this.x += this.speedX;
        this.y += this.speedY;
    }

    resetSpeed() {
        this.speedX = 0;
        this.speedY = 0;
    }
    
}

class Background extends Component{

    constructor(x,y,width,height,game){
        super(x,y,width,height,game);
        this.transitionSpeed = 100;
        this.imgSrc = "./img/space3.png";
        this.img = new Image();
        this.img.src = this.imgSrc;
        this.img.onload = () => this.loaded = true;
        this.loaded = false;
    }

    draw() {
        if (!this.loaded) return;
        let ctx = this.game.context;
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        ctx.drawImage(this.img, this.x, this.y + this.height, this.width, this.height);
    }

    moveUp(){
        this.y += this.transitionSpeed;
        if(this.y >= 0){
            this.y = -this.height;
        }
        this.move();
    }
}



class Meteor extends Component{

    constructor(x, y, width, height, moveSpeed,game){
        super(x, y, width, height,game);
        this.moveSpeed = moveSpeed;
        this.imgSrc = "./img/meteor.png";
        this.hitbox = [
            {x: this.x, y: this.y},
            {x: this.y+this.width, y: this.y},
            {x: this.x+this.width, y: this.y+this.height},
            {x: this.x, y: this.y+this.height}
        ];
        this.img = new Image();
        this.img.src = this.imgSrc;
        this.img.onload = () => this.loaded = true;
        this.loaded = false;
        this.inGame = true;
    }

    checkVisibility(){
        if(this.y <= this.game.canvas.height)
            this.inGame = true;
        else{
            this.inGame = false;
        }

    }

    draw() {
        if (!this.loaded || this.y < -this.height) return;
        let ctx = this.game.context;
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        
    }

    moveDown() {
        this.speedY += this.moveSpeed;
        this.hitbox = [
            {x: this.x, y: this.y},
            {x: this.y+this.width, y: this.y},
            {x: this.x+this.width, y: this.y+this.height},
            {x: this.x, y: this.y+this.height}
        ];
        this.move();

    }

    update(){
        this.checkVisibility();
        if(this.inGame){
            this.resetSpeed();
            this.moveDown();
            this.draw();
        }

    }
}

class Player extends Component{

    constructor(x, y, width, height,game){
        super(x, y, width, height, game);
        this.moveSpeed = 40;
        this.imgSrc = "./img/rocket.png";
        this.hitbox = [
            {x: this.x+(this.width/2), y: (this.y+20)},
            {x: (this.x+140), y: (this.y+90)},
            {x: (this.x+110), y: (this.y+330)},
            {x: (this.x+30), y: (this.y+410)},
            {x: (this.x+140), y: (this.y+440)},
            {x: (this.x+260), y: (this.y+90)},
            {x: (this.x+290), y: (this.y+330)},
            {x: (this.x+370), y: (this.y+410)},
            {x: (this.x+260), y: (this.y+440)},
        ];
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        this.img = new Image();
        this.img.src = this.imgSrc;
        this.img.onload = () => this.loaded = true;
        this.loaded = false;
        this.keys = [];
        this.handleOrientation = this.handleOrientation.bind(this);
        window.addEventListener('deviceorientation', this.handleOrientation, true);
        this.up = false;
        this.left = false;
        this.right = false;
        this.down = false;
    }

    handleOrientation(event) {
        left=false; 
        right=false;
        up=false; 
        down=false;

        const beta = event.beta;   // X-axis rotation (-180 to 180 degrees)
        const gamma = event.gamma; // Y-axis rotation (-90 to 90 degrees)

        this.left = false;
        this.right = false;
        this.down = false;
        this.up = false;

        if(beta > 5) {this.down = true;}
        if(beta < -5) {this.up = true;}
        if(gamma > 5) {this.right= true;}
        if(gamma < -5) {this.left = true;}
    }

    pressedKey() {
        if ((this.keys && this.keys["a"]) || this.left==true) { 
            this.moveLeft();
        }
        if ((this.keys && this.keys["d"]) || this.right==true) {
            this.moveRight(); 
        }
        if ((this.keys && this.keys["w"]) || this.up==true) { 
            this.moveUp();
        }
        if ((this.keys && this.keys["s"]) || this.down==true) { 
            this.moveDown();
        }
    }

    moveUp(){
        this.speedY -= this.moveSpeed;
    }   
    moveDown() {
        this.speedY += this.moveSpeed;
    }
    moveLeft() {
        this.speedX -= this.moveSpeed;
    }
    moveRight() {
        this.speedX += this.moveSpeed;
    }
    //Overridol som move() metodu aby musel zostat hrac na hracej ploche
    move(){
        if(this.isInCanvasX()){
            this.x += this.speedX;
        }
        if(this.isInCanvasY()){
            this.y += this.speedY;
        }
        this.hitbox = [
            {x: this.x+(this.width/2), y: (this.y+20)},
            {x: (this.x+168), y: (this.y+90)},
            {x: (this.x+132), y: (this.y+330)},
            {x: (this.x+50), y: (this.y+410)},
            {x: (this.x+168), y: (this.y+460)},
            {x: (this.x+312), y: (this.y+90)},
            {x: (this.x+348), y: (this.y+330)},
            {x: (this.x+450), y: (this.y+410)},
            {x: (this.x+312), y: (this.y+460)},
        ];;
    }

    draw() {
        if (!this.loaded) return;
        let ctx = this.game.context;
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        
    }

    resetPosition(){
        this.x = 1750;
        this.y = 2000;
    }

    // keby chceme pouzit tuto logiku znova tak som ju vlozil do tejto funkcie aby sa dala lahko pouzit znovu pre vsetky objekty
    isInCanvasX(){
        if(this.x + this.speedX >= -50 && this.x + this.speedX <= this.game.canvas.width - this.width + 50){
            return true;
        }
        return false;
    }

    isInCanvasY(){
        if(this.y + this.speedY >= 0 && this.y + this.speedY <= this.game.canvas.height - this.height){
            return true;
        }
        return false;
    }

    isCollidingWith(component){
        var centerX=component.x+(component.width/2);
        var centerY=component.y+(component.height/2);
        for(var i=0;i<this.hitbox.length; i++){
            var distance = Math.sqrt((this.hitbox[i].x - centerX) ** 2 + (this.hitbox[i].y - centerY) ** 2);
            if(distance < (component.width/2)){
                return true;
            }
        }
        return false;
    }  

    update(){
        if(!this.game.startMenu){
            this.resetSpeed();
            this.pressedKey();
            this.move();
        }
        this.draw();
    }
};

function startGame(){
    game = new Game(4000,4000);
    game.initialize();
}

function unpause(){
    if(game.startMenu){
        game.startMenu = false;
        continueButton.textContent = "Continue";
        game.stop();
    }
    game.paused = false;
    game.start();
    menu.style.display = "none";
}

function pause(){
    game.paused = true;
    game.stop();
    menu.style.display = "block";
}

function restart(){
    game.gameOver = false;
    gameOverScreen.style.display = "none";
    game.clear();
    game.fillObjects();
    game.player.resetPosition();
    game.start();
}

function nextLevel(){
    game.nextLevel();
}

function getRandomNumFromTo(min,max){
    return Math.floor(Math.random() * (max - min) + min);
}




