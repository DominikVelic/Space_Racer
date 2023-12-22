console.log("loaded");

let RocketPlayer;
let objects=[];



function startGame() {
    GameArea.start();
    RocketPlayer = new Player("rocket",0,0,240,240);
}

let GameArea = {
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
        if (this.keys && this.keys[37]) {RocketPlayer.moveLeft();}
        if (this.keys && this.keys[39]) {RocketPlayer.moveRight(); }
        if (this.keys && this.keys[38]) {RocketPlayer.moveUp(); }
        if (this.keys && this.keys[40]) {RocketPlayer.moveDown();}
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
        if(this.x+this.speedX>=0 && this.x+this.speedX<=3940-this.width){
            this.x += this.speedX;
        }
        if(this.y+this.speedY>=0&& this.y+this.speedY<=2160-this.height){
            this.y += this.speedY;
        }
    }
    
    resetSpeed() {
        this.speedX = 0;
        this.speedY = 0;
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
};

function updateGameArea(){
    GameArea.clear();
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
