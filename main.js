console.log("loaded");
// tu mozu byt data z jsonu
let levelData = [];

// precita json a vlozi data do arrayov levelData a rocketData
function loadGame(){
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
            result.levels.forEach(level => {
                levelData.push(level);
            })
            game = new Game(4000,4000);
            game.start();
        }
    
    })
    .catch(error => console.error(error));
    
}

class Game {
    constructor(canvasWidth,canvasHeight) {
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");
        this.player = null;
        this.keys = [];
        this.interval = null;
        this.background = null;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.objects = [];
        this.levelIndex = 0;
    }

    start() {
        this.player = new Player(1850, 1900, 400, 600, this);
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(() => this.updateGame(), 10);
        this.background = new Background(0, -4000, 4000, 8000);
        window.addEventListener('keydown', (e) => {
            this.keys[e.keyCode] = true;
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.keyCode] = false;
        });
        this.fillObjects();
    }

    fillObjects() {
        for (let i = 0; i < levelData.length; i++) {
            this.objects[i] = [];
            for (let j = 0; j < levelData[i].meteors; j++) {
                this.objects[i][j] = new Meteor(0, 0, 600, 600, levelData[i].meteor_speed, this);
            }
        }
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBackground() {
        this.background.moveUp();
        this.background.draw();
    }

    pressedKey() {
        if (this.keys && this.keys[65]) { this.player.moveLeft(); }
        if (this.keys && this.keys[68]) { this.player.moveRight(); }
        if (this.keys && this.keys[87]) { this.player.moveUp(); }
        if (this.keys && this.keys[83]) { this.player.moveDown(); }
    }

    checkCollision() {
        for (let i = 0; i < this.objects[this.levelIndex].length; i++) {
            if (this.player.isCollidingWith(this.objects[this.levelIndex][i])) {
                this.stop();
                break;
            }
        }
    }

    stop() {
        clearInterval(this.interval);
    }

    drawObjects() {
        for (let i = 0; i < this.objects[this.levelIndex].length; i++) {
            this.objects[this.levelIndex][i].checkVisibility();
            this.objects[this.levelIndex][i].moveDown();
            this.objects[this.levelIndex][i].draw();
        }
    }

    updateGame() {
        this.clear();
        this.drawBackground();
        this.drawObjects();
        this.player.resetSpeed();
        this.pressedKey();
        this.checkCollision();
        this.player.move();
        this.player.draw();
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
        this.transitionSpeed = 30;
        this.imgSrc = "./img/space3.png"
    }

    draw() {
        let ctx = game.context;
        let img = new Image();
        img.onload = () => {
            ctx.drawImage(img, this.x, this.y, this.width, this.height);
            ctx.drawImage(img, this.x, this.y + this.height, this.width, this.height);
        };
        img.src = this.imgSrc;
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
        this.visible = false;
        this.imgSrc = "./img/meteor_pixel2.png";
        this.hitbox = null;//todo: vypln hitbox
    }

    checkVisibility(){
        if(this.y >= 0)
            this.visible = true;
        if(this.y <= this.game.canvas.height)
            this.visible = false;
    }

    draw() {
        if(!this.visible){
            let ctx = game.context;
            let img = new Image();
            ctx.strokeStyle = "white";
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            img.onload = () => {
                ctx.drawImage(img, this.x, this.y, this.width, this.height);
            };
            img.src = this.imgSrc;
        }
    }
    
    setSpeed(){
        this.moveSpeed = levelData[levelIndex].meteor_speed;
    }
    moveDown() {
        this.speedY += this.moveSpeed;
        this.move();
    }
}

class Player extends Component{

    constructor(x, y, width, height,game){
        super(x, y, width, height,game);
        this.moveSpeed = 40;
        this.imgSrc = "./img/rocket_pixel.png";
        this.hitbox = null;//todo: vypln hitbox
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
    }

    draw() {
        let ctx = game.context;
        let img = new Image();
        ctx.strokeStyle = "white";
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        img.onload = () => {
            ctx.drawImage(img, this.x, this.y, this.width, this.height);
        };
        img.src = this.imgSrc;
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
        //todo: naprav logiku pre hitbox
        return !(this.x > component.x + component.width ||
                    this.x + this.width < component.x ||
                    this.y > component.y + component.height ||
                    this.y + this.height < component.y);
    }

};




