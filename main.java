console.log("loaded");

function startGame() {
    GameArea.start();
    Player = new component("rocket",0,0,240,240);
}

var GameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 3940;
        this.canvas.height = 2160;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 60);
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

var Player;

function component(objectType, x, y, width, height) {
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
}

function updateGameArea(){
    GameArea.clear();
    Player.update();
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
