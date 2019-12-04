// -------------------------------------------------------------------
//   ___  ___   ___  __  __ ___   ___   __  
//  | _ \/ _ \ / _ \|  \/  / __| |_  ) /  \ 
//  |   / (_) | (_) | |\/| \__ \  / / | () |
//  |_|_\\___/ \___/|_|  |_|___/ /___(_)__/ 
//                                          
// -------------------------------------------------------------------

// -------------------------------------
// prototypes
// -------------------------------------

Number.prototype.mx = function() {
  return this * 16;
}

Number.prototype.padDigits = function(digits) {
    return Array(Math.max(digits - String(this).length + 1, 0)).join(0) + this;
}

// -------------------------------------
// inital function
// -------------------------------------
window.onload = function() {
    let newRooms = new Rooms2( "canvas", (40).mx(), (25).mx(), 0 ); 

    // add sounds
    newRooms.addSound( "bounce", "./sound/bounce.wav" );
    newRooms.addSound( "collect", "./sound/collect.wav" );
    newRooms.addSound( "win", "./sound/win.wav" );

    // add button onclick events
    document.getElementById("start-button").onclick = function() {
        if( newRooms.started === false ) {
            document.getElementById("btn-txt").innerText = "reset game";
            newRooms.startGame();
        } else {
            document.getElementById("btn-txt").innerText = "start game";           
            newRooms.resetGame(); 
        }
    };
    document.getElementById("chg-color-g").onclick = function() {
        changeCSSColor(0);
        changeBtnSelection(0);
        newRooms.chgColor(0);
    };
    document.getElementById("chg-color-a").onclick = function() {
        changeCSSColor(1);
        changeBtnSelection(1);
        newRooms.chgColor(1);
    };
    document.getElementById("chg-color-w").onclick = function() {
        changeCSSColor(2);
        changeBtnSelection(2);
        newRooms.chgColor(2);
    };

};

// -------------------------------------------------------------------
// CLASS | sound
// -------------------------------------------------------------------
class Sound{
    constructor(src) {
        this.sound = document.createElement("audio");
        this.sound.src = src;
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.style.display = "none";
        document.body.appendChild(this.sound);
    }

    play = function(){
        this.sound.play();
    }
    stop = function(){
        this.sound.pause();
    }    
}

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

    chgColor( color ){ this.color = color; }

    update() {
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    left() { return this.x; }
    right() { return this.x + this.width; }
    top() { return this.y; }
    bottom() { return this.y + this.height; }

    isCollidedWith(obstacle, inclSpeed) {
        //since the player is also a gameObject we have to make sure that it doesn't "collide" with itself
        if (this === obstacle) return false;

        if( inclSpeed === true ) {
            this.x += this.speedX;
            this.y += this.speedY;
        }

        let isCollided = !(
            this.bottom() <= obstacle.top() ||
            this.top() >= obstacle.bottom() ||
            this.right() <= obstacle.left() ||
            this.left() >= obstacle.right()
            );
            
        if( inclSpeed === true ) {
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

    chgColor( color ){
        super.chgColor(color);
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        super.update();
    }
}

// -------------------------------------------------------------------
// -------------------------------------------------------------------
// -------------------------------------------------------------------


// -------------------------------------------------------------------
// CLASS | wall object
// -------------------------------------------------------------------
class Wall extends Rectangle{
    constructor(x, y, width, height, color, ctx){
        super(x, y, width, height, color, ctx);
        this.id = "wall";
    }

    chgColor( color ){
        super.chgColor(color);
    }

}

// -------------------------------------------------------------------
// CLASS | thing object
// -------------------------------------------------------------------
class Thing extends Rectangle{
    constructor(x, y, color, ctx, img){
        super(x, y, (1).mx(), (1).mx(), "#000", ctx);
        this.id = "thing";
        this.color = color;
        this.thingImage = img;
    }

    chgColor( color ){
        this.color = color;
    }

    update(){
        this.ctx.drawImage(this.thingImage,(Number(this.color)).mx(),0,this.width, this.height, this.x, this.y, this.width, this.height);
    }
}

// -------------------------------------------------------------------
// CLASS | player object
// -------------------------------------------------------------------
class Player extends MovingRectangle{
    constructor(x, y, color, ctx, img){
        super(x, y, (1).mx(), (1).mx(), "#000", ctx);
        this.id = "player";
        
        this.playerImage = img;
        this.color = color;

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

    chgColor( color ){
        this.color = color;
    }

    update(){
        this.x += this.speedX;
        this.y += this.speedY;
        this.ctx.drawImage(this.playerImage,(this.color).mx(),0,this.width, this.height, this.x, this.y, this.width, this.height);
    }

    setNewDirection(){
        this.speedX = 0;
        this.speedY = 0;
        let dir = Math.floor( Math.random() * 12 );
        if( dir%4 === 0 ) this.speedY = (-1).mx();
        if( dir%4 === 1 ) this.speedY = (1).mx();
        if( dir%4 === 2 ) this.speedX = (-1).mx();
        if( dir%4 === 3 ) this.speedX = (1).mx();
    }
}

// -------------------------------------------------------------------
// CLASS | ROOMS 2.0 canvas game
// -------------------------------------------------------------------
class Rooms2 extends CanvasGame{
    constructor(container, width, height, color){
        super(container, width, height);
        this.wallObjects = [];
        this.thingObjects = [];

        this.color = [ "#25E525", "#EEBF00", "#B7B7B7" ];
        this.curColor = color;

        this.sounds = [];

        this.playerImage = new Image();
        this.playerImage.src = "./images/player.png";
        this.playerLoaded = false;
        this.playerImage.onload = () => { this.playerLoaded = true; };

        this.thingImage = new Image();
        this.thingImage.src = "./images/thing.png";
        this.thingLoaded = false;
        this.thingImage.onload = () => { this.thingLoaded = true; };
        
        this.leftTime = 0;
        this.maxTime = 1.5 * 60 * 1000;
        this.numberOfCollectedItems = 0;
        this.timeFrame = 100;

        this.checkResults = 0;

        this.createRooms();
        this.drawRooms();
        this.drawGrid();
        this.drawScoreAndTime();
    }
    
    addSound( name, sound ){
        this.sounds.push( [name, new Sound( sound )] );
    }

    chgColor( id ){
        this.curColor = id;

        if( this.player !== undefined ) { this.player.chgColor( id ); }
        this.wallObjects.map( (wallObject) => {wallObject.chgColor( this.color[id] ); } );
        this.thingObjects.map( (thingObject) => {thingObject.chgColor( id ); } );

        this.drawRooms();
        this.drawGrid();
        this.drawScoreAndTime();
        if( this.checkResults !== 0 ) this.drawResult( this.checkResults === 1 );
    }

    startGame(){
        this.started = true;
        this.numberOfCollectedItems = 0;
        this.leftTime = this.maxTime;

        this.createThings(25);

        this.player = new Player((1).mx(), (1).mx(), this.curColor, this.ctx, this.playerImage);
        this.player.setNewDirection();
        this.insertXYIntoObject( this.player );        

        // bind func 'updateIslandRacerState' to be available in 'setInterval()'
        this.updateRooms = this.updateRooms.bind(this);
        this.interval = setInterval(this.updateRooms, this.timeFrame);
    }

    stopGame(){
        clearInterval(this.interval);
    }

    resetGame(){
        this.stopGame();
        this.started = false;

        this.thingObjects = [];
        delete this.player;
        this.drawRooms();
        this.drawGrid();
    }

    createRooms(){
        let walls = [
                        [ 0, 0,40, 1], [39, 0,40,25], [ 0,24,40,25], [ 0, 0, 1,24], // outer walls
                        [14,10,12, 5], // inner block
                        [ 1,12, 6, 1], [ 8,12, 6, 1], [26,12, 6, 1], [33,12, 6, 1], // horizontal walls
                        [14, 1, 1, 2], [14, 4, 1, 6], [25, 1, 1, 6], [25, 8, 1, 2], // vertical walls inkl.door
                        [14,15, 1, 2], [14,18, 1, 6], [25,15, 1, 6], [25,22, 1, 2]  // vertical walls inkl.door
                    ];
        walls.map( (wallData) => {
            this.wallObjects.push( new Wall((wallData[0]).mx(),(wallData[1]).mx(),
                                            (wallData[2]).mx(),(wallData[3]).mx(),this.color[this.curColor],this.ctx));
            } );
    }

    createThings( numberThings ){
        for( let id=0; id < numberThings; id++ ){
            this.thingObjects.push( new Thing(0,0,this.curColor,this.ctx, this.thingImage) );
            this.insertXYIntoObject(this.thingObjects[id]);
        }
    }

    updateRooms() {
        this.checkResults = this.checkGameOver();
        if ( this.checkResults === 0 ) {
            this.leftTime -= this.timeFrame;

            let collision = this.checkObjectCollisionIndex(this.player, this.thingObjects, false);
            if( collision.isCollided === true ) {
                this.sounds.map( sound => { if( sound[0] === "collect" ) sound[1].play(); } );
                this.thingObjects.splice( collision.index, 1 );
                this.numberOfCollectedItems++;
            }

            let play = false;
            while( this.checkObjectCollisionBoolean(this.player, this.wallObjects, true) ){
                if( play === false ){
                    this.sounds.map( sound => { if( sound[0] === "bounce" ) sound[1].play(); } );
                    play = true;
                }
                this.player.setNewDirection();
            };

            this.drawRooms();
            this.drawGrid();
            this.drawScoreAndTime();
        } else {
            this.player.speedX = 0;
            this.player.speedY = 0;
            this.drawRooms();
            this.drawResult( this.checkResults === 1 );
            this.drawGrid();
            this.stopGame();
        };
    }

    checkGameOver(){
        if( this.leftTime <= 0 && this.thingObjects.length > 0 ){ return -1; }
        if( this.thingObjects.length === 0 ){ return 1; }
        return 0;
    }

    drawScoreAndTime(){
        if( this.started === true ){
            this.ctx.font = "18px pxplus_ibm_vga9regular";
            this.ctx.fillStyle = "black";
            this.ctx.textAlign = "left";

            let score = this.numberOfCollectedItems.padDigits(3);
            let time = `${Math.floor(this.leftTime/1000).padDigits(3)} sec`;

            this.ctx.fillText ( `Score: ${score}`, (15).mx(), (11).mx());                  
            this.ctx.fillText ( `Time:  ${time}`, (15).mx(), (12).mx());  
        }       
    }

    drawResult( win ){
        this.ctx.fillStyle = this.color[this.curColor];
        this.ctx.fillRect( (5).mx(), (5).mx(), (30).mx(), (15).mx() );

        this.ctx.strokeStyle  = "black";
        this.ctx.lineWidth = 2.5;
        this.ctx.strokeRect( (6).mx(), (6).mx(), (28).mx(), (13).mx() );

        this.ctx.font = "40px pxplus_ibm_vga9regular";
        this.ctx.fillStyle = "black";
        
        this.ctx.textAlign = "center";
        this.ctx.fillText ( `G A M E   O V E R`, (20).mx(), (9).mx());                  
        
        if( win === true ){
            this.ctx.font = "70px pxplus_ibm_vga9regular";
            this.ctx.fillText ( `YOU WIN`, (20).mx(), (14).mx());                  
            this.ctx.font = "20px pxplus_ibm_vga9regular";
            let usedTime = Math.floor((this.maxTime - this.leftTime)/1000);
            this.ctx.fillText ( `in ${usedTime} seconds !`, (20).mx(), (17).mx()); 
            this.sounds.map( sound => { if( sound[0] === "win" ) sound[1].play(); } );     
        } else {
            this.ctx.font = "70px pxplus_ibm_vga9regular";
            this.ctx.fillText ( `YOU LOOSE`, (20).mx(), (14).mx());                  
            this.ctx.font = "20px pxplus_ibm_vga9regular";
            this.ctx.fillText ( `Sorry, try again!`, (20).mx(), (17).mx());                  
        }
    }

    drawRooms() {
        this.clearCanvas();

        this.wallObjects.map( (wallObject) => {wallObject.update(); } );
        this.thingObjects.map( (thingObject) => {thingObject.update(); } );
        if( this.player !== undefined && this.checkResults === 0) this.player.update();
    }

    clearCanvas(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid() {
        this.ctx.strokeStyle = "#00000066";
        this.ctx.lineWidth = 0.5;
        this.ctx.setLineDash([]);

        this.ctx.beginPath();
        for( let y=0; y<(25).mx(); y+=3) {
            this.ctx.moveTo(0,y);
            this.ctx.lineTo((40).mx(),y);
        }
        this.ctx.stroke();

        this.ctx.strokeStyle = "#000000";
        this.ctx.setLineDash([]);
    }

    insertXYIntoObject( object ){
        let collisionThing = false;
        let collisionWall = false;

        do {
            object.x = (Math.floor( Math.random() * 40 )).mx();            
            object.y = (Math.floor( Math.random() * 25 )).mx();            

            collisionThing = this.checkObjectCollisionBoolean(object, this.thingObjects, false);
            collisionWall = this.checkObjectCollisionBoolean(object, this.wallObjects, false);
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
