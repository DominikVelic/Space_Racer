console.log("loaded");

var playerSpeed = 30;
function startGame() {
    GameArea.start();
    Player = new Component("rocket",0,0,240,240);
}

var GameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 3940;
        this.canvas.height = 2160;
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
        if (this.keys && this.keys[37]) {moveleft();}
        if (this.keys && this.keys[39]) {moveright(); }
        if (this.keys && this.keys[38]) {moveup(); }
        if (this.keys && this.keys[40]) {movedown();}
    }
}

var Player;

function Component(objectType, x, y, width, height) {
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  this.speedX = 0;
  this.speedY = 0;
  this.imgSrc = findObjectSrc(objectType);
  this.update = function(){
    ctx = GameArea.context;
    let img = new Image();
    ctx.strokeStyle = "white";
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    img.onload = () => {
        ctx.drawImage(img, this.x, this.y, this.width, this.height);
    };
    img.src = this.imgSrc;
  }
  this.move = function() {
    this.x += this.speedX;
    this.y += this.speedY;
  }
  this.resetSpeed = function(){
    this.speedX = 0
    this.speedY = 0;
  }
}

function updateGameArea(){
    GameArea.clear();
    Player.resetSpeed();
    GameArea.pressedKey();
    Player.move();
    Player.update();    
}

function moveup() {
    Player.speedY -= playerSpeed;
}
  
function movedown() {
    Player.speedY += playerSpeed;
}

function moveleft() {
    Player.speedX -= playerSpeed;
}

function moveright() {
    Player.speedX += playerSpeed;
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
