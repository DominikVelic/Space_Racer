console.log("loaded");

let RocketPlayer;
let objects=[];
let levelIndex=0;
let numOfLevels=1;
let canvasWidth = 3940;
let canvasHeight = 2160;

function fillObjects(){
    //načitanie jsonu/jsonov že každy prvok bude level ktory bude obsahovať objekty svojho levelu
    for(let i = 0; i<numOfLevels; i++){
        objects[i]=[];
        //for number of objects in level abo daco take
        objects[i][0]=new Meteor("meteor",1850,0,400,400);
    }
}

function startGame() {
    GameArea.start();
    RocketPlayer = new Player("rocket",1850,1900,240,240);
    fillObjects();
}

let GameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 10);
        window.addEventListener('keydown', function (e) {
            GameArea.keys = (GameArea.keys || []);
            GameArea.keys[e.keyCode] = true;
          })
        window.addEventListener('keyup', function (e) {
            GameArea.keys[e.keyCode] = false;
        })
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    pressedKey : function(){
        if (this.keys && this.keys[65]) {RocketPlayer.moveLeft();}
        if (this.keys && this.keys[68]) {RocketPlayer.moveRight(); }
        if (this.keys && this.keys[87]) {RocketPlayer.moveUp(); }
        if (this.keys && this.keys[83]) {RocketPlayer.moveDown();}
    }
}

class Component {
    
    constructor(objectType, x, y, width, height) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.speedX = 0;
        this.speedY = 0;
        this.imgSrc = findObjectSrc(objectType);
    }
    
    update() {
        let ctx = GameArea.context;
        let img = new Image();
        ctx.strokeStyle = "white";
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        img.onload = () => {
            ctx.drawImage(img, this.x, this.y, this.width, this.height);
        };
        img.src = this.imgSrc;
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

// keby chceme pouzit tuto logiku znova tak som ju vlozil do tejto funkcie aby sa dala lahko pouzit znovu pre vsetky objekty
function isInCanvasX(Component){
    if(Component.x + Component.speedX >= 0 && Component.x + Component.speedX <= canvasWidth - Component.width){
        return true;
    }
    return false;
}

function isInCanvasY(Component){
    if(Component.y + Component.speedY >= 0 && Component.y + Component.speedY <= canvasHeight - Component.height){
        return true;
    }
    return false;
}

class Meteor extends Component{
    constructor(objectType, x, y, width, height){
        super(objectType, x, y, width, height);
        this.moveSpeed = 0.05;
    }
    moveDown() {
        this.speedY += this.moveSpeed;
    }
}

class Player extends Component{

    constructor(objectType, x, y, width, height){
        super(objectType, x, y, width, height);
        this.moveSpeed = 30;
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
};

function updateGameArea(){
    GameArea.clear();
    for(let i = 0; i<objects[levelIndex].length; i++){
        objects[levelIndex][i].moveDown();
        objects[levelIndex][i].move();
        objects[levelIndex][i].update(); //do cyklu
    }
    RocketPlayer.resetSpeed();
    GameArea.pressedKey();
    RocketPlayer.move();
    RocketPlayer.update();   
}

function findObjectSrc(objectType){
    switch(objectType){
        case 'rocket':
        return './img/rocket_pixel.png';
        break;
        case 'meteor':
            return './img/meteor.png';
            break;
    }
}
