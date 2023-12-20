console.log("loaded");

function startGame() {
    myGameArea.start();
    myGamePiece = new component("rocket",0,0,100,100);
}
var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 1000;
        this.canvas.height = 800;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 50);
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

var myGamePiece;

function component(objectType, x, y, width, height) {
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  this.imgSrc = findObjectSrc(objectType);
  ctx = myGameArea.context;
  this.update = function(){
      let img = new Image();
      img.src = this.imgSrc;
      img.onload = function() {
        ctx.drawImage(img, this.x, this.y, this.width, this.height);
      };
  }
}

function updateGameArea(){
    myGameArea.clear();
    myGamePiece.x += 1;
    myGamePiece.update();
}


function findObjectSrc(objectType){
    switch(objectType){
        case 'rocket':
            return './img/rocket.png';
            break;
        case 'meteor':
            return './img/meteor.png';
            break;
    }
}
