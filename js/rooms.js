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
  return Math.round(this * 16);
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
    newRooms.addSound( "loose", "./sound/loose.wav" );

    // add button onclick events
    document.getElementById("start-button").onclick = function() {
        if( newRooms.started === false ) {
            document.getElementById("btn-txt").innerText = "RESET GAME";
            newRooms.initGameboard();
            newRooms.startGame();
        } else {
            document.getElementById("btn-txt").innerText = "START GAME";           
            newRooms.resetGameboard(); 
        }
    };
    document.getElementById("chg-sound").onclick = function() {
        changeSoundBtnSelection("chg-sound", 1);
        newRooms.toggleSound();
    };
    document.getElementById("chg-color-g").onclick = function() {
        if( newRooms.started === false ){
            changeCSSColor(0);
            changeColorBtnSelection("chg-color", 2);
            newRooms.chgColor(0);
        }
    };
    document.getElementById("chg-color-a").onclick = function() {
        if( newRooms.started === false ){
            changeCSSColor(1);
            changeColorBtnSelection("chg-color", 3);
            newRooms.chgColor(1);
        }
    };
    document.getElementById("chg-color-w").onclick = function() {
        if( newRooms.started === false ){
            changeCSSColor(2);
            changeColorBtnSelection("chg-color", 4);
            newRooms.chgColor(2);
        }
    };
    document.getElementById("chg-color-p").onclick = function() {
        if( newRooms.started === false ){
            changeCSSColor(3);
            changeColorBtnSelection("chg-color", 5);
            newRooms.chgColor(3);
        }
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

    play = function(){ this.sound.play(); }
    stop = function(){ this.sound.pause(); }    
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

    // update object
    update() {
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    // transform dimensions
    left() { return Math.round(this.x); }
    right() { return Math.round(this.x + this.width); }
    top() { return Math.round(this.y); }
    bottom() { return Math.round(this.y + this.height); }

    // check collision
    isCollidedWith(obstacle, inclSpeed) {

        // since the player is also a gameObject we have to 
        // make sure that it doesn't "collide" with itself
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

    // change object color
    chgColor( color ){ this.color = color; }
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

    // update object
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        super.update();
    }
    
    // change object color
    chgColor( color ){ super.chgColor(color); }
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

    // change object color
    chgColor( color ){ super.chgColor(color); }
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

    update(){
        this.ctx.drawImage(this.thingImage,(Number(this.color)).mx(),0,this.width, this.height, this.x, this.y, this.width, this.height);
    }

    // update object
    chgColor( color ){ this.color = color; }
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

        this.KEY = { BACKSPACE: 8, TAB:       9, RETURN:   13, ESC:      27, SPACE:    32, 
                     PAGEUP:   33, PAGEDOWN: 34, END:      35, HOME:     36, 
                     LEFT:     37, UP:       38, RIGHT:    39, DOWN:     40, 
                     INSERT:   45, DELETE:   46,
                     ZERO:     48, ONE: 49, TWO: 50, THREE: 51, FOUR: 52, FIVE: 53, SIX: 54, SEVEN: 55, EIGHT: 56, NINE: 57,
                     A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, 
                     M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, 
                     Y: 89, Z: 90,
                     TILDA: 192 };
        
        document.addEventListener('keydown', ev => { return this.onKey(ev, ev.keyCode, true);  }, false );
        document.addEventListener('keyup',  ev => { return this.onKey(ev, ev.keyCode, false); }, false );
    }

    // player key control
    onKey(ev, key, pressed) {
        if( !pressed ) return;
        switch(key) {
            case this.KEY.LEFT:
                this.speedY = 0;
                this.speedX = (-1).mx();
                ev.preventDefault();
            break;

            case this.KEY.RIGHT:
                this.speedY = 0;
                this.speedX = (1).mx();
                ev.preventDefault();
            break;

            case this.KEY.UP:
                this.speedX = 0;
                this.speedY = (-1).mx();
                ev.preventDefault();
            break;

            case this.KEY.DOWN:
                this.speedX = 0;
                this.speedY = (1).mx();
                ev.preventDefault();
            break;
        }
    }

    // update object
    update(){
        this.x += this.speedX;
        this.y += this.speedY;
        this.ctx.drawImage(this.playerImage,(this.color).mx(),0,this.width, this.height, this.x, this.y, this.width, this.height);
    }

    // randomly choose new direction after bouncing at walls
    setNewDirection(){
        let dir = Math.floor( Math.random() * 12 );
        switch(dir%4) {
            case 0:  this.speedY = (-1).mx(); this.speedX = 0; break;
            case 1:  this.speedY =  (1).mx(); this.speedX = 0; break;
            case 2:  this.speedX = (-1).mx(); this.speedY = 0; break;
            case 3:  this.speedX =  (1).mx(); this.speedY = 0; break;
        }
    }

    // change object color
    chgColor( color ){ this.color = color; }
}

// -------------------------------------------------------------------
// CLASS | ROOMS 2.0 canvas game
// -------------------------------------------------------------------
class Rooms2 extends CanvasGame{
    constructor(container, width, height, color){
        super(container, width, height);

        this.wallObjects = [];
        this.thingObjects = [];

        this.colorList = [ "#25E525", "#EEBF00", "#B7B7B7", "#D926AC" ];
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
        
        this.leftTimeMSec = 0;
        this.currentLevel = 1;
        this.initTimeSec = 90;
        this.maxTimeSec = this.initTimeSec;
        this.numberOfCollectedItems = 0;
        this.timeFrameMSec = 100;
        this.totalScore = 0;
        this.numberThings = 25;

        this.checkResults = 0;
        this.playSound = true;
        this.activateSound = 0;

        this.font = "bigblue_terminalplusregular";

        this.createRooms();
        this.drawRooms();
        this.drawRoomsLogo()
        this.drawGrid();
    }
    
    // initialize game board
    initGameboard(){
        this.started = true;
        this.numberOfCollectedItems = 0;
        this.leftTimeMSec = this.maxTimeSec * 1000;

        this.createThings(this.numberThings);

        this.player = new Player((1).mx(), (1).mx(), this.curColor, this.ctx, this.playerImage);
        this.player.setNewDirection();
        this.placeObjectIntoGameboard( this.player );        
    }

    // start the GAME
    startGame(){
        // bind func 'updateIslandRacerState' to be available in 'setInterval()'
        this.updateRooms = this.updateRooms.bind(this);
        this.interval = setInterval(this.updateRooms, this.timeFrameMSec);
    }

    // stop the GAME
    stopGame(){
        clearInterval(this.interval);
    }

    // reset game board to start conditions
    resetGameboard(){
        this.stopGame();
        this.started = false;
        this.totalScore = 0;
        this.currentLevel = 1;
        this.maxTimeSec = this.initTimeSec;

        this.thingObjects = [];
        delete this.player;
        this.drawRooms();
        this.drawRoomsLogo();
        this.drawGrid();
    }

    // create walls of rooms
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
                                            (wallData[2]).mx(),(wallData[3]).mx(),this.colorList[this.curColor],this.ctx));
            } );
    }

    // create randomly thing inside the rooms
    createThings( numberThings ){
        for( let id=0; id < numberThings; id++ ){
            this.thingObjects.push( new Thing(0,0,this.curColor,this.ctx, this.thingImage) );
            this.placeObjectIntoGameboard(this.thingObjects[id]);
        }
    }

    // update all game objects, incl. text output
    updateRooms() {
        this.checkResults = this.checkGameOver();
        if ( this.checkResults === 0 ) {
            this.leftTimeMSec -= this.timeFrameMSec;

            let collision = this.checkObjectCollisionIndex(this.player, this.thingObjects, false);
            if( collision.isCollided === true ) {
                if(this.activateSound === 1){
                    this.sounds.map( sound => { if( sound[0] === "collect" ) sound[1].play(); } );
                }
                this.thingObjects.splice( collision.index, 1 );
                this.numberOfCollectedItems++;
            }

            this.playSound = true;
            while( this.checkObjectCollisionBoolean(this.player, this.wallObjects, true) ){
                if( this.playSound === true && this.activateSound === 1){
                    this.sounds.map( sound => { if( sound[0] === "bounce" ) sound[1].play(); } );
                    this.playSound = false;
                }
                this.player.setNewDirection();
            };
            this.playSound = false;

            this.drawRooms();
            this.drawGrid();
            this.drawScoreAndTime();
        } else {
            this.player.speedX = 0;
            this.player.speedY = 0;
            this.drawRooms();

            this.drawEndResult( this.checkResults === 1, true );
            this.drawGrid();

            this.stopGame();

            if( this.checkResults === 1 ){
                this.thingObjects = [];
                delete this.player;
                this.currentLevel++;
                this.maxTimeSec = this.initTimeSec - ( (this.currentLevel-1) * 10 );
                this.drawStartLevel(5,5);

            } else {
                // loose - do nothing
            }
        };
    }
    
    // sleep for x milli-seconds
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // check run out of time or collect all things
    checkGameOver(){
        if( this.leftTimeMSec <= 0 && this.thingObjects.length > 0 ){ return -1; }
        if( this.thingObjects.length === 0 ){ return 1; }
        return 0;
    }

    // draw score and left time
    drawScoreAndTime(){
        if( this.started === true ){
            this.ctx.fillStyle = "black";

            let items = this.numberThings - this.numberOfCollectedItems.padDigits(2);
            let time = Math.round(this.leftTimeMSec/1000).padDigits(2);

            this.ctx.lineWidth = 2.5;
            this.ctx.strokeRect( (14.5).mx(), (10.5).mx(), (11).mx(), (4).mx() );

            this.ctx.textAlign = "center";
            this.ctx.font = "20px " + this.font;
            this.ctx.fillText ( `LEVEL ${this.currentLevel}`, (20).mx(), (11.9).mx());                  
            this.ctx.font = "14px " + this.font;
            this.ctx.fillText ( `items ${items}`, (20).mx(), (13).mx());                  
            this.ctx.fillText ( ` time ${time} s`, (20).mx(), (14).mx());  
        }       
    }

    // draw rooms logo in case of no score will be shown
    drawRoomsLogo(){
        this.ctx.fillStyle = "black";
        this.ctx.textAlign = "center";

        this.ctx.lineWidth = 2.5;
        this.ctx.strokeRect( (14.5).mx(), (10.5).mx(), (11).mx(), (4).mx() );

        this.ctx.font = "26px " + this.font;
        this.ctx.fillText ( `ROOMS 2.0`, (20).mx(), (13).mx());                  
    }

    // draw waiting info after finishing level successfully
    drawStartLevel(max, cnt){
        this.ctx.textAlign = "left";

        if( cnt > 0 ){
            this.ctx.fillText ( `next level in ${max} sec !   .${".".repeat(max-cnt)}`, (9).mx(), (18).mx());
            this.sleep(1000).then( () => { this.drawStartLevel(max, cnt-1);  } );
        } else {
            this.initGameboard();
            this.startGame();
        }
    }

    // draw end result in case of LOOSE and WIN of level
    drawEndResult( win, sound ){
        let txt = [ 
            [ "T I M E   O V E R", "L E V E L   E N D" ],
            [ "YOU LOST", "YOU WIN "],
            [ "level #1 with #2 pts !", "level #1 with #2 pts in #3 sec !"],
            [ "total: #1 pts !", "total: #1 pts !"]
        ]
        let outTxt = "";

        let txtId = win === true ? 1 : 0;

        this.ctx.fillStyle = this.colorList[this.curColor];
        this.ctx.fillRect( (5).mx(), (5).mx(), (30).mx(), (15).mx() );

        this.ctx.strokeStyle  = "black";
        this.ctx.lineWidth = 2.5;
        this.ctx.strokeRect( (6).mx(), (6).mx(), (28).mx(), (13).mx() );

        // --- LEVEL OVER ---
        this.ctx.font = "36px " + this.font;
        this.ctx.fillStyle = "black";
        this.ctx.textAlign = "center";

        this.ctx.fillText ( txt[0][txtId], (20).mx(), (9).mx());                  

        // --- LOST / WIN ---
        this.ctx.font = "50px " + this.font;
        this.ctx.fillText ( txt[1][txtId], (20).mx(), (12.5).mx());                  

        // --- LEVEL / POINTS ---
        let levelScore = this.calcPoint();
        let usedTime = Math.round((this.maxTimeSec - Math.round(this.leftTimeMSec)/1000));
        outTxt = txt[2][txtId];
        outTxt = outTxt.replace( "#1", this.currentLevel );
        outTxt = outTxt.replace( "#2", levelScore );
        outTxt = outTxt.replace( "#3", usedTime );

        this.ctx.font = "18px " + this.font;
        this.ctx.fillText ( outTxt, (20).mx(), (15).mx());

        // --- TOTAL ---
        this.totalScore += levelScore;
        outTxt = txt[3][txtId];
        outTxt = outTxt.replace( "#1", this.totalScore );
        this.ctx.fillText ( outTxt, (20).mx(), (16.5).mx());

        if( this.activateSound === 1) {
            if( win === true ){
                this.sounds.map( sound => { if( sound[0] === "win" ) sound[1].play(); } );     
            } else {
                this.sounds.map( sound => { if( sound[0] === "loose" ) sound[1].play(); } );     
            }    
        }
    }

    // clear canvas for redrawing
    clearCanvas(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // draw all roomes (walls)
    drawRooms() {
        this.clearCanvas();
        this.wallObjects.map( (wallObject) => {wallObject.update(); } );
        this.thingObjects.map( (thingObject) => {thingObject.update(); } );
        if( this.player !== undefined && this.checkResults === 0) this.player.update();
    }

    // draw screen grid
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

    // insert new object into game board, incl. check collision with existing ones 
    placeObjectIntoGameboard( object ){
        let collisionThing = false;
        let collisionWall = false;

        do {
            object.x = (Math.floor( Math.random() * 40 )).mx();            
            object.y = (Math.floor( Math.random() * 25 )).mx();            

            collisionThing = this.checkObjectCollisionBoolean(object, this.thingObjects, false);
            collisionWall = this.checkObjectCollisionBoolean(object, this.wallObjects, false);
        } while( collisionThing || collisionWall )
    }
    
    // check collision of object with list of objects
    checkObjectCollisionBoolean( objectToCheck, objectsToCheckWith, atOriginal ){
        let objectCollision = Boolean(objectsToCheckWith.some( (objectToCheckWith, index) => { 
                let collision = objectToCheck.isCollidedWith(objectToCheckWith, atOriginal); 
                return collision;
            }));
        return objectCollision;
    }

    // check collision of object with list of objects
    checkObjectCollisionIndex( objectToCheck, objectsToCheckWith, atOriginal ){
        let indexFound = -1;
        let objectCollision = Boolean(objectsToCheckWith.some( (objectToCheckWith, index) => { 
                let collision = objectToCheck.isCollidedWith(objectToCheckWith, atOriginal); 
                if( collision === true ) { indexFound = index; } 
                return collision;
            }));
        return { isCollided: objectCollision, index : indexFound };
    }

    // calculate score points for level
    calcPoint(){
        return (Math.round(this.leftTimeMSec/1000) * this.currentLevel * 10) + 
            (this.numberOfCollectedItems * this.currentLevel * 2);
    }

    // toggles sound on/off
    toggleSound(){
        this.activateSound = 1 - this.activateSound;
    }

    // add sound object to rooms
    addSound( name, sound ){
        this.sounds.push( [name, new Sound( sound )] );
    }

    // change object color - here for whole rooms
    chgColor( id ){
        this.curColor = id;

        if( this.player !== undefined ) { this.player.chgColor( id ); }
        this.wallObjects.map( (wallObject) => {wallObject.chgColor( this.colorList[id] ); } );
        this.thingObjects.map( (thingObject) => {thingObject.chgColor( id ); } );

        this.drawRooms();
        this.drawGrid();
        this.drawRoomsLogo()
        this.drawScoreAndTime();
        //if( this.checkResults !== 0 ) this.drawEndResult( this.checkResults === 1 );
    }
}
