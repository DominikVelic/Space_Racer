console.log("loaded");

let Player;
let objects=[];
let levelIndex=0;
let numOfLevels=1;
let canvasWidth = 3940;
let canvasHeight = 2160;

// tu mozu byt data z jsonu
let levelData = [];
let rocketData = [];


// precita json a vlozi data do arrayov levelData a rocketData
function loadLevels(){
    fetch('./levels.json').then(response => {
        if(response.ok){
            return response.json();
        }
        return null;
    }).then(result =>{
        if(result != null){
            result.levels.forEach(level => {
                levelData.push(level);
            })
            result.rockets.forEach(rocket =>{
                rocketData.push(rocket);
            })
        }
        else{
            console.error("response is empty");
        }
    })
    
}

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
    Player = new Rocket("rocket",1850,1900,240,240);
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
        if (this.keys && this.keys[65]) {Player.moveLeft();}
        if (this.keys && this.keys[68]) {Player.moveRight(); }
        if (this.keys && this.keys[87]) {Player.moveUp(); }
        if (this.keys && this.keys[83]) {Player.moveDown();}
    },
    checkCollision : function(){
        for(let i = 0; i < objects[levelIndex].length; i++){
            if(Player.isColliding(objects[levelIndex][i])){
                this.stop();
                break;
            }
        }
    },
    stop : function() {
        clearInterval(this.interval);
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
    constructor(objectType, x, y, width, height){
        super(objectType, x, y, width, height);
        this.moveSpeed = 0.05;
    }
    moveDown() {
        this.speedY += this.moveSpeed;
    }
}

class Rocket extends Component{

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

    isColliding(component){
        return !(this.x > component.x + component.width ||
                    this.x + this.width < component.x ||
                    this.y > component.y + component.height ||
                    this.y + this.height < component.y);
    }

};

function updateGameArea(){
    GameArea.clear();
    for(let i = 0; i<objects[levelIndex].length; i++){
        objects[levelIndex][i].moveDown();
        objects[levelIndex][i].move();
        objects[levelIndex][i].update(); //do cyklu
    }
    Player.resetSpeed();
    GameArea.pressedKey();
    GameArea.checkCollision();
    Player.move();
    Player.update();   
}

function findObjectSrc(objectType){
    switch(objectType){
        case 'rocket':
            return './img/rocket_pixel.png';
        case 'meteor':
            return './img/meteor.png';
    }
}

readJSON();
