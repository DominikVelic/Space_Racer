console.log("loaded");

function startGame() {
    myGameArea.start();
    myGamePiece = new component(30, 30, "rocket", 10, 120);
}

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 480;
        this.canvas.height = 270;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    }
}

var myGamePiece;

function component(width, height, objectType, x, y) {
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  ctx = myGameArea.context;
  let img = new Image();
  img.src = findObjectSrc(objectType);
  image.onload = function() {
    ctx.drawImage(image, x, y, width, height);
  };
}

function findObjectSrc(objectType){
    switch(objectType){
        case 'rocket':
            return '/img/rocket.png';
            break;
        case 'meteor':
            return '/img/meteor.png';
            return;
    }
}
