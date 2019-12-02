// -------------------------------------------------------------------
//   ___  ___   ___  __  __ ___   ___   __  
//  | _ \/ _ \ / _ \|  \/  / __| |_  ) /  \ 
//  |   / (_) | (_) | |\/| \__ \  / / | () |
//  |_|_\\___/ \___/|_|  |_|___/ /___(_)__/ 
//                                          
// -------------------------------------------------------------------

window.onload = function() {
    let newRooms;

    newRooms = new Rooms2( "canvas", 640, 400 ); 
};

// -------------------------------------------------------------------
// CLASS | generic canvas game
// -------------------------------------------------------------------
class CanvasGame {
    constructor(container, width, height) {
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext("2d");

        document.getElementById(container).appendChild(this.canvas);
        this.ctx.rect(0, 0, width, height);
    }
}

// -------------------------------------------------------------------
// CLASS | generic object 'rectangle'
// -------------------------------------------------------------------
class Rectangle{
    constructor(x, y, width, height, color, ctx){
        this.width = width;
        this.height = height;
        this.color = color;
        this.x = x;
        this.y = y;
        this.ctx = ctx;
    }

    update() {
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    left() { 
        return this.x;
    }
    right() {
        return this.x + this.width;
    }
    top() {
        return this.y;
    }
    bottom() {
        return this.y + this.height;
    }

}

// -------------------------------------------------------------------
// CLASS | generic object 'moving rectangle'
// -------------------------------------------------------------------
class MovingRectangle extends Rectangle{
    constructor(x, y, width, height, color, ctx){
        super(x, y, width, height, color, ctx);
        this.speedX = 0;
        this.speedY = 0;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    left() { 
        return this.x;
    }
    right() {
        return this.x + this.width;
    }
    top() {
        return this.y;
    }
    bottom() {
        return this.y + this.height;
    }

    isCollidedWith(obstacle) {
        //since the player is also a gameObject we have to make sure that it doesn't "collide" with itself
        if (this === obstacle) return false;
        
        return !(
        this.bottom() < obstacle.top() ||
        this.top() > obstacle.bottom() ||
        this.right() < obstacle.left() ||
        this.left() > obstacle.right()
        );

    }
}

// -------------------------------------------------------------------
// -------------------------------------------------------------------
// -------------------------------------------------------------------


// -------------------------------------------------------------------
// CLASS | wall object
// -------------------------------------------------------------------
class Wall extends Rectangle{
    constructor(x, y, width, height, ctx){
        super(x, y, width, height, "#00FF00", ctx);
    }
}

// -------------------------------------------------------------------
// CLASS | thing object
// -------------------------------------------------------------------
class Thing extends Rectangle{
    constructor(x, y, width, height, ctx){
        super(x, y, width, height, "#FF0000", ctx);
    }
}

// -------------------------------------------------------------------
// CLASS | player object
// -------------------------------------------------------------------
class Player extends MovingRectangle{
    constructor(x, y, ctx){
        super(x, y, 16, 16, "#FF000055", ctx);

        this.playerImage = new Image();
        this.playerImage.src = "./images/player.png";
        this.imageLoaded = false;
        this.playerImage.onload = () => { this.imageLoaded = true; };

        document.onkeyup = e => {
            switch (e.keyCode) {
                case 37:
                    this.speedX = -16;
                break;

                case 39:
                    this.speedX = 16;
                break;

                case 38:
                    this.speedY = -16;
                break;

                case 40:
                    this.speedX = 16;
                break;

                default:
                    console.log("UPD");
            }
        };

        document.onkeyup = e => {
            this.speedY = 0;
            this.speedX = 0;
        };
    }

    update(){
        while( this.imageLoaded === false){};

        this.y += this.speedY;
        //console.log(this.playerImage,0,0,this.playerImage.width, this.playerImage.height, this.x, this.y, 16, 16);

        this.ctx.drawImage(this.playerImage,0,0,this.playerImage.width, this.playerImage.height, this.x, this.y, 16, 16);
    }
}

// -------------------------------------------------------------------
// CLASS | ROOMS 2.0 canvas game
// -------------------------------------------------------------------
class Rooms2 extends CanvasGame{
    constructor(container, width, height){
        super(container, width, height);
        this.gameObjects = [];
        this.things = [];
        this.player = new Player(24, 24, this.ctx);
        
        this.gameObjects.push( this.player );

        this.createRooms();

        // bind func 'updateIslandRacerState' to be available in 'setInterval()'
        this.updateRooms = this.updateRooms.bind(this);
        this.interval = setInterval(this.updateRooms, 100);
    }

    createRooms(){
        this.gameObjects.push( new Wall(0,0,640,16,this.ctx))
        this.gameObjects.push( new Wall(624,0,640,400,this.ctx))
        this.gameObjects.push( new Wall(0,384,640,400,this.ctx))
        this.gameObjects.push( new Wall(0,0,16,384,this.ctx))
    }

    updateRooms() {
        this.clearCanvas();
        this.gameObjects.map( (gameObject) => { gameObject.update(); } );

        if( this.checkWallCollision() ){
            console.log( "Collision" );
            clearInterval(this.interval);

        } else {
            console.log( "OK" );
        }
        this.drawGrid();
    }

    clearCanvas(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid() {
        this.ctx.strokeStyle = "#00000033";
        this.lineWidth = 0.5;

        this.ctx.beginPath();
        for( let row=1; row<25; row++) {
            this.ctx.moveTo(0,row*16);
            this.ctx.lineTo(640,row*16);
        }
        for( let col=1; col<40; col++) {
            this.ctx.moveTo(col*16,0);
            this.ctx.lineTo(col*16,400);
        }
        this.ctx.stroke();
    }

    checkWallCollision(){
        let wallCollision = Boolean(this.gameObjects.some( gameObject => { return this.player.isCollidedWith(gameObject); }));
        return wallCollision;
    }

}

// --------------------
