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
    document.getElementById("chg-sound").onclick = function() {
        changeSoundBtnSelection("chg-sound", 1);
        newRooms.toggleSound();
    };
    document.getElementById("chg-color-g").onclick = function() {
        changeCSSColor(0);
        changeColorBtnSelection("chg-color", 2);
        newRooms.chgColor(0);
    };
    document.getElementById("chg-color-a").onclick = function() {
        changeCSSColor(1);
        changeColorBtnSelection("chg-color", 3);
        newRooms.chgColor(1);
    };
    document.getElementById("chg-color-w").onclick = function() {
        changeCSSColor(2);
        changeColorBtnSelection("chg-color", 4);
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

        this.KEY = { BACKSPACE: 8, TAB:       9, RETURN:   13, ESC:      27, SPACE:    32, 
                     PAGEUP:   33, PAGEDOWN: 34, END:      35, HOME:     36, 
                     LEFT:     37, UP:       38, RIGHT:    39, DOWN:     40, 
                     INSERT:   45, DELETE:   46, ZERO:     48, 
                     ONE: 49, TWO: 50, THREE: 51, FOUR: 52, FIVE: 53, SIX: 54, SEVEN: 55, EIGHT: 56, NINE: 57,
                     A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, 
                     M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, 
                     Y: 89, Z: 90,
                     TILDA: 192 };
        
        //this.onkey = this.onkey.bind(this);

        document.addEventListener('keydown', ev => { return this.onKey(ev, ev.keyCode, true);  }, false );
        document.addEventListener('keyup',  ev => { return this.onKey(ev, ev.keyCode, false); }, false );
    }

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
        this.currentLevel = 1;
        this.maxTime = 90 * 1000; // 1.5 min
        this.numberOfCollectedItems = 0;
        this.timeFrame = 100;
        this.totalScore = 0;
        this.numberThings = 25;

        this.checkResults = 0;
        this.playSound = true;
        this.activateSound = 0;

        this.font = "bigblue_terminalplusregular";

        this.createRooms();
        this.drawRooms();
        this.drawGrid();
        this.drawScoreAndTime();
    }
    
    toggleSound(){
        this.activateSound = 1 - this.activateSound;
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

        this.createThings(this.numberThings);

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
        this.totalScore = 0;
        this.currentLevel = 1;

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

            this.drawResult( this.checkResults === 1, true );
            this.drawGrid();
            this.stopGame();

            if( this.checkResults === 1 ){
                this.thingObjects = [];
                delete this.player;
                this.currentLevel++;
                this.maxTime = ( 100 - ( this.currentLevel * 10 ) ) * 1000;
                this.startGame();
            } else {
                // loose
            }
        };
    }

    checkGameOver(){
        if( this.leftTime <= 0 && this.thingObjects.length > 0 ){ return -1; }
        if( this.thingObjects.length === 0 ){ return 1; }
        return 0;
    }

    drawScoreAndTime(){
        if( this.started === true ){
            this.ctx.fillStyle = "black";
            this.ctx.textAlign = "left";

            let items = this.numberThings - this.numberOfCollectedItems.padDigits(2);
            let time = Math.floor(this.leftTime/1000).padDigits(2);

            this.ctx.font = "20px " + this.font;
            this.ctx.fillText ( `Level ${this.currentLevel}`, (15).mx(), (11.5).mx());                  
            this.ctx.font = "16px " + this.font;
            this.ctx.fillText ( `items left: ${items}`, (15).mx(), (13).mx());                  
            this.ctx.fillText ( `time left: ${time} s`, (15).mx(), (14).mx());  
        }       
    }

    drawResult( win, sound ){
        let txt = [ 
            [ "G A M E   O V E R", "L E V E L   E N D" ],
            [ "YOU LOST", "YOU WIN "],
            [ "level #1 with #2 pts !", "level #1 with #2 pts in #3 sec !"],
            [ "total: #1 pts !", "total: #1 pts !"]
        ]
        let outTxt = "";

        let txtId = win === true ? 1 : 0;

        this.ctx.fillStyle = this.color[this.curColor];
        this.ctx.fillRect( (5).mx(), (5).mx(), (30).mx(), (15).mx() );

        this.ctx.strokeStyle  = "black";
        this.ctx.lineWidth = 2.5;
        this.ctx.strokeRect( (6).mx(), (6).mx(), (28).mx(), (13).mx() );

        this.ctx.font = "36px " + this.font;
        this.ctx.fillStyle = "black";
        this.ctx.textAlign = "center";

        this.ctx.fillText ( txt[0][txtId], (20).mx(), (9).mx());                  
        this.ctx.font = "50px " + this.font;
        this.ctx.fillText ( txt[1][txtId], (20).mx(), (12.5).mx());                  

        let levelScore = this.calcPoint();
        let usedTime = Math.floor((this.maxTime - this.leftTime)/1000);
        outTxt = txt[2][txtId];
        outTxt = outTxt.replace( "#1", this.currentLevel );
        outTxt = outTxt.replace( "#2", levelScore );
        outTxt = outTxt.replace( "#3", usedTime );

        this.ctx.font = "18px " + this.font;
        this.ctx.fillText ( outTxt, (20).mx(), (15).mx());

        this.totalScore += levelScore;
        outTxt = txt[3][txtId];
        outTxt = outTxt.replace( "#1", this.totalScore );
        this.ctx.fillText ( outTxt, (20).mx(), (17).mx());

        if( sound === true && this.activateSound === 1) {
            if( win === true ){        
                this.sounds.map( sound => { if( sound[0] === "win" ) sound[1].play(); } );     
            } else {
                // loosing sound --- this.sounds.map( sound => { if( sound[0] === "loose" ) sound[1].play(); } );     
            }    
        }
    }

    drawRooms() {
        this.clearCanvas();
        this.wallObjects.map( (wallObject) => {wallObject.update(); } );
        this.thingObjects.map( (thingObject) => {thingObject.update(); } );
        if( this.player !== undefined && this.checkResults === 0) this.player.update();
    }

    calcPoint(){
        return (Math.floor(this.leftTime/1000) * this.currentLevel * 10) + 
               (this.numberOfCollectedItems * this.currentLevel * 2);
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
