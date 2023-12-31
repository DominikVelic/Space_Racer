console.log("loaded");

if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
    .then(function() { console.log("Service Worker Registered"); });
}
class Game {
    constructor(canvasWidth,canvasHeight) {
        this.initGyroscope();
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");
        this.player = null;
        this.interval = null;
        this.background = null;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.objects = [];
        this.levelIndex = 1;
    }

    handleReading(){
        if (this.gyroscope.x > 0) {
            this.player.moveRight();
        }
        if (this.gyroscope.y > 0) {
            this.player.moveUp();
        }
        if(this.gyroscope.x < 0){
            this.player.moveLeft();
        }
        if(this.gyroscope.y < 0){
            this.player.moveDown();
        }
    }
    
    initGyroscope(){
        if (window.DeviceOrientationEvent) {
            window.addEventListener("deviceorientation", function(event) {
                // beta: front back motion
                const frontToBack = event.beta;
                // gamma: left to right
                const leftToRight = event.gamma;
        
                if (frontToBack > 0) { this.player.moveUp(); }
                if (leftToRight > 0) { this.player.moveRight(); }
                if (frontToBack < 0) { this.player.moveDown(); }
                if (leftToRight < 0) { this.player.moveLeft(); }
                
            }, true);
        }
        
    }

    start() {
        this.player = new Player(1850, 1900, 500, 600, this);
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(() => this.updateGame(), 20);
        this.background = new Background(0, -4000, 4000, 8000,this);
        this.fillObjects();
    }

    fillObjects() {
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

    drawBackground() {
        this.background.moveUp();
        this.background.draw();
    }

    
    checkCollision() {
        for (let i = 0; i < this.objects[this.levelIndex].length; i++) {
            if (this.player.isCollidingWith(this.objects[this.levelIndex][i])) {
                this.stop();
                //todo: Game Over screen
                break;
            }
        }
    }

    stop() {
        clearInterval(this.interval);
    }

    //todo: MenuScreen
    menuScreen(){
        if(this.interval)
            this.stop();
        drawMenuScreen();
    }

    drawMenuScreen(){
        this.drawBackground();
        this.context.drawImage();

    }

    updateObjects() {
        for (let i = 0; i < this.objects[this.levelIndex].length; i++) {
            this.objects[this.levelIndex][i].update();
        }
    }

    updateGame() {
        this.clear();
        this.drawBackground();
        this.updateObjects();
        this.checkCollision();
        this.player.update();
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
            this.keys[e.keyCode] = true;
            
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.keyCode] = false;
            
        });
        this.img = new Image();
        this.img.src = this.imgSrc;
        this.img.onload = () => this.loaded = true;
        this.loaded = false;
        this.keys = [];
    }

    pressedKey() {
        if (this.keys && this.keys[65]) { this.moveLeft(); }
        if (this.keys && this.keys[68]) { this.moveRight(); }
        if (this.keys && this.keys[87]) { this.moveUp(); }
        if (this.keys && this.keys[83]) { this.moveDown(); }
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

    // keby chceme pouzit tuto logiku znova tak som ju vlozil do tejto funkcie aby sa dala lahko pouzit znovu pre vsetky objekty
    isInCanvasX(){
        if(this.x + this.speedX >= 0 && this.x + this.speedX <= this.game.canvas.width - this.width){
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
        this.resetSpeed();
        this.pressedKey();
        this.move();
        this.draw();
    }
};

function startGame(){
    let game = new Game(4000,4000);
    game.start();
}




