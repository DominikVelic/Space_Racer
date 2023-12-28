console.log("loaded");

let Player;
let objects=[];
let levelIndex=0;
let canvasWidth = 4000;
let canvasHeight = 4000;
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
            Game.start();
        }
    
    })
    .catch(error => console.error(error));
    
}


function fillObjects(){
    //načitanie jsonu/jsonov že každy prvok bude level ktory bude obsahovať objekty svojho levelu
    for(let i = 0; i<levelData.length; i++){
        objects[i]=[];
        //for number of objects in level abo daco take
        for (let j = 0; j < levelData[i].meteors; j++) {
            objects[i][j]=new Meteor(0,0,600,600,levelData[i].meteor_speed);   
        }
    }
}

let Game = {
    canvas : document.createElement("canvas"),
    start : function() {
        Player = new Rocket(1850,1900,400,600);
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGame, 10);
        this.background = new Background(0,-4000,4000,8000);
        window.addEventListener('keydown', function (e) {
            Game.keys = (Game.keys || []);
            Game.keys[e.keyCode] = true;
          })
        window.addEventListener('keyup', function (e) {
            Game.keys[e.keyCode] = false;
        })
        fillObjects();
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    drawBackground : function(){
        this.background.moveUp();
        this.background.draw();
    },
    pressedKey : function(){
        if (this.keys && this.keys[65]) {Player.moveLeft();}
        if (this.keys && this.keys[68]) {Player.moveRight(); }
        if (this.keys && this.keys[87]) {Player.moveUp(); }
        if (this.keys && this.keys[83]) {Player.moveDown();}
    },
    checkCollision : function(){
        for(let i = 0; i < objects[levelIndex].length; i++){
            if(Player.isCollidingWith(objects[levelIndex][i])){
                this.stop();
                break;
            }
        }
    },
    stop : function() {
        clearInterval(this.interval);
    },
    drawObjects : function(){
        //musi sa objavit len tolko meteorov aky je meteor_count v levelData, ak x,y meteoru je za canvasom, nastavi sa meteor.gone = true a nebude sa vykreslovat a moze zacat vykreslovat dalsi meteor v objects
        for(let i = 0; i<objects[levelIndex].length; i++){
            objects[levelIndex][i].checkVisibility();
            objects[levelIndex][i].moveDown();
            objects[levelIndex][i].draw();
        }
    },

}

class Component {
    
    constructor(x, y, width, height) {
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

    constructor(x,y,width,height){
        super(x,y,width,height);
        this.transitionSpeed = 30;
        this.imgSrc = "./img/space3.png"
    }

    draw() {
        let ctx = Game.context;
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

// keby chceme pouzit tuto logiku znova tak som ju vlozil do tejto funkcie aby sa dala lahko pouzit znovu pre vsetky objekty
function isInCanvasX(component){
    if(component.x + component.speedX >= 0 && component.x + component.speedX <= canvasWidth - component.width){
        return true;
    }
    return false;
}

function isInCanvasY(component){
    if(component.y + component.speedY >= 0 && component.y + component.speedY <= canvasHeight - component.height){
        return true;
    }
    return false;
}

class Meteor extends Component{
    constructor(x, y, width, height, moveSpeed){
        super(x, y, width, height);
        this.moveSpeed = moveSpeed;
        this.visible = false;
        this.imgSrc = "./img/meteor_pixel2.png";
        this.hitbox = null;//todo: vypln hitbox
    }

    checkVisibility(){
        if(this.y >= 0)
            this.visible = true;
        if(this.y <= canvasHeight)
            this.visible = false;
    }

    draw() {
        if(!this.visible){
            let ctx = Game.context;
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

class Rocket extends Component{

    constructor(x, y, width, height){
        super(x, y, width, height);
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
        if(isInCanvasX(this)){
            this.x += this.speedX;
        }
        if(isInCanvasY(this)){
            this.y += this.speedY;
        }
    }

    draw() {
        let ctx = Game.context;
        let img = new Image();
        ctx.strokeStyle = "white";
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        img.onload = () => {
            ctx.drawImage(img, this.x, this.y, this.width, this.height);
        };
        img.src = this.imgSrc;
    }

    isCollidingWith(component){
        //todo: naprav logiku pre hitbox
        return !(this.x > component.x + component.width ||
                    this.x + this.width < component.x ||
                    this.y > component.y + component.height ||
                    this.y + this.height < component.y);
    }

};

function updateGame(){
    Game.clear();
    Game.drawBackground();
    Game.drawObjects();
    Player.resetSpeed();
    Game.pressedKey();
    Game.checkCollision();
    Player.move();
    Player.draw();   
}


