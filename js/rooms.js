// -------------------------------------------------------------------
//   ___  ___   ___  __  __ ___   ___   __  
//  | _ \/ _ \ / _ \|  \/  / __| |_  ) /  \ 
//  |   / (_) | (_) | |\/| \__ \  / / | () |
//  |_|_\\___/ \___/|_|  |_|___/ /___(_)__/ 
//                                          
// -------------------------------------------------------------------

Number.prototype.mx = function() {
  return this * 16;
}

window.onload = function() {
    newRooms = new Rooms2( "canvas", (40).mx(), (25).mx() ); 

    document.getElementById("start-button").onclick = function() {
        if( newRooms.started === false ) {
            document.getElementById("btn-txt").innerText = "reset game";
            newRooms.startGame();
        } else {
            document.getElementById("btn-txt").innerText = "start game";           
            newRooms.stopGame(); 
        }
    };
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
        this.started = false;
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
        this.id = "rect";
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

    isCollidedWith(obstacle, atOriginal) {
        //since the player is also a gameObject we have to make sure that it doesn't "collide" with itself
        if (this === obstacle) return false;

        if( atOriginal === false ) {
            this.x += this.speedX;
            this.y += this.speedY;
        }

        let isCollided = !(
            this.bottom() <= obstacle.top() ||
            this.top() >= obstacle.bottom() ||
            this.right() <= obstacle.left() ||
            this.left() >= obstacle.right()
            );
            
        if( atOriginal === false ) {
            this.x -= this.speedX;
            this.y -= this.speedY;
        }        
        return isCollided;
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
        this.id = "moving-rect";
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        super.update();

        //this.ctx.fillStyle = this.color;
        //this.ctx.fillRect(this.x, this.y, this.width, this.height);
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
        super(x, y, width, height, "#25E525", ctx);
        this.id = "wall";
    }
}

// -------------------------------------------------------------------
// CLASS | thing object
// -------------------------------------------------------------------
class Thing extends Rectangle{
    constructor(x, y, ctx, img){
        super(x, y, (1).mx(), (1).mx(), "#25E52555", ctx);
        this.id = "thing";

        this.thingImage = img;
    }
    update(){
        this.ctx.drawImage(this.thingImage,0,0,this.thingImage.width, this.thingImage.height, this.x, this.y, this.width, this.height);
    }

}

// -------------------------------------------------------------------
// CLASS | player object
// -------------------------------------------------------------------
class Player extends MovingRectangle{
    constructor(x, y, ctx, img){
        super(x, y, (1).mx(), (1).mx(), "#25E52555", ctx);
        this.id = "player";
        
        this.playerImage = img;

        document.onkeyup = e => {
            switch (e.keyCode) {
                case 37:
                    this.speedY = 0;
                    this.speedX = (-1).mx();
                break;

                case 39:
                    this.speedY = 0;
                    this.speedX = (1).mx();
                break;

                case 38:
                    this.speedX = 0;
                    this.speedY = (-1).mx();
                break;

                case 40:
                    this.speedX = 0;
                    this.speedY = (1).mx();
                break;

                default:
            }
        };
    }

    update(){
        this.x += this.speedX;
        this.y += this.speedY;
        this.ctx.drawImage(this.playerImage,0,0,this.playerImage.width, this.playerImage.height, this.x, this.y, this.width, this.height);
    }

    setNewDirection(){
        this.speedX = 0;
        this.speedY = 0;
        let dir = Math.floor( Math.random() * 4 );
        if( dir === 0 ) this.speedY = (-1).mx();
        if( dir === 1 ) this.speedY = (1).mx();
        if( dir === 2 ) this.speedX = (-1).mx();
        if( dir === 3 ) this.speedX = (1).mx();
    }
}

// -------------------------------------------------------------------
// CLASS | ROOMS 2.0 canvas game
// -------------------------------------------------------------------
class Rooms2 extends CanvasGame{
    constructor(container, width, height){
        super(container, width, height);
        this.wallObjects = [];
        this.thingObjects = [];

        this.playerImage = new Image();
        this.playerImage.src = "./images/player.png";
        this.playerLoaded = false;
        this.playerImage.onload = () => { this.playerLoaded = true; };

        this.thingImage = new Image();
        this.thingImage.src = "./images/thing.png";
        this.thingLoaded = false;
        this.thingImage.onload = () => { this.thingLoaded = true; };
        
        this.createRooms();
        this.drawRooms();
    }

    startGame(){
        this.started = true;
        this.createThings(20);

        this.player = new Player((1).mx(), (1).mx(), this.ctx, this.playerImage);
        this.player.setNewDirection();
        this.insertXYIntoObject( this.player );        

        // bind func 'updateIslandRacerState' to be available in 'setInterval()'
        this.updateRooms = this.updateRooms.bind(this);
        this.interval = setInterval(this.updateRooms, 150);
    }

    stopGame(){
        this.started = false;
        clearInterval(this.interval);

        this.thingObjects = [];
        delete this.player;

        this.drawRooms();
    }

    createRooms(){
        // outer walls
        this.wallObjects.push( new Wall(0,0,(40).mx(),(1).mx(),this.ctx))
        this.wallObjects.push( new Wall((39).mx(),0,(40).mx(),(25).mx(),this.ctx))
        this.wallObjects.push( new Wall(0,(24).mx(),(40).mx(),(25).mx(),this.ctx))
        this.wallObjects.push( new Wall(0,0,(1).mx(),(24).mx(),this.ctx))

        // inner block
        this.wallObjects.push( new Wall((14).mx(),(10).mx(),(12).mx(),(5).mx(),this.ctx))
    
        // horizontal walls inkl.door
        this.wallObjects.push( new Wall((1).mx(),(12).mx(),(6).mx(),(1).mx(),this.ctx))
        this.wallObjects.push( new Wall((8).mx(),(12).mx(),(6).mx(),(1).mx(),this.ctx))

        this.wallObjects.push( new Wall((26).mx(),(12).mx(),(6).mx(),(1).mx(),this.ctx))
        this.wallObjects.push( new Wall((33).mx(),(12).mx(),(6).mx(),(1).mx(),this.ctx))

        // vertical walls inkl.door
        this.wallObjects.push( new Wall((14).mx(),(1).mx(),(1).mx(),(2).mx(),this.ctx))
        this.wallObjects.push( new Wall((14).mx(),(4).mx(),(1).mx(),(6).mx(),this.ctx))

        this.wallObjects.push( new Wall((25).mx(),(1).mx(),(1).mx(),(6).mx(),this.ctx))
        this.wallObjects.push( new Wall((25).mx(),(8).mx(),(1).mx(),(2).mx(),this.ctx))

        this.wallObjects.push( new Wall((14).mx(),(15).mx(),(1).mx(),(2).mx(),this.ctx))
        this.wallObjects.push( new Wall((14).mx(),(18).mx(),(1).mx(),(6).mx(),this.ctx))

        this.wallObjects.push( new Wall((25).mx(),(15).mx(),(1).mx(),(6).mx(),this.ctx))
        this.wallObjects.push( new Wall((25).mx(),(22).mx(),(1).mx(),(2).mx(),this.ctx))
    }

    createThings( numberThings ){
        for( let id=0; id < numberThings; id++ ){
            this.thingObjects.push( new Thing(0,0,this.ctx, this.thingImage) );
            this.insertXYIntoObject(this.thingObjects[id]);
        }
    }

    updateRooms() {
        let collision = this.checkObjectCollisionIndex(this.player, this.thingObjects, true);

        if( collision.isCollided === true ) {
            console.log( "collect", collision.index );
        }

        while( this.checkObjectCollisionBoolean(this.player, this.wallObjects, false) ){
            this.player.setNewDirection();
        };

        this.drawRooms();
    }

    drawRooms() {
        this.clearCanvas();

        this.wallObjects.map( (wallObject) => {wallObject.update(); } );
        this.thingObjects.map( (thingObject) => {thingObject.update(); } );
        if( this.player !== undefined ) this.player.update();

        this.drawGrid();
    }

    clearCanvas(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid() {
        this.ctx.strokeStyle = "#00000033";
        this.ctx.lineWidth = 0.5;
        this.ctx.setLineDash([2,2]);

        this.ctx.beginPath();
        for( let row=1; row<25; row++) {
            this.ctx.moveTo(0,(row).mx());
            this.ctx.lineTo((40).mx(),(row).mx());
        }
        for( let col=1; col<40; col++) {
            this.ctx.moveTo((col).mx(),0);
            this.ctx.lineTo((col).mx(),(25).mx());
        }
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    insertXYIntoObject( object ){
        let collisionThing = false;
        let collisionWall = false;

        do {
            object.x = (Math.floor( Math.random() * 40 )).mx();            
            object.y = (Math.floor( Math.random() * 25 )).mx();            

            collisionThing = this.checkObjectCollisionBoolean(object, this.thingObjects, true);
            collisionWall = this.checkObjectCollisionBoolean(object, this.wallObjects, true);
        } while( collisionThing || collisionWall )
    }
 
    checkObjectCollisionBoolean( objectToCheck, objectsToCheckWith, atOriginal ){
        let objectCollision = Boolean(objectsToCheckWith.some( (objectToCheckWith, index) => { 
                let collision = objectToCheck.isCollidedWith(objectToCheckWith, atOriginal); 
                return collision;
            }));
        return objectCollision;
    }

    checkObjectCollisionIndex( objectToCheck, objectsToCheckWith, atOriginal ){
        let indexFound = -1;
        let objectCollision = Boolean(objectsToCheckWith.some( (objectToCheckWith, index) => { 
                let collision = objectToCheck.isCollidedWith(objectToCheckWith, atOriginal); 
                if( collision === true ) { indexFound = index; } 
                return collision;
            }));
        return { isCollided: objectCollision, index : indexFound };
    }
}

// --------------------
