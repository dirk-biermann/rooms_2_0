function changeCSSColor(id) {
    let head = document.getElementsByTagName("head").item(0);
    let links = head.getElementsByTagName("link");

    for( let i=0; i<3; i++ ){
        if( i === id ) {
            links[i].media = 'screen';
        } else {
            links[i].media = 'none';
        }
    }
}

function changeColorBtnSelection(type, id){
    let control_btn = document.getElementById("control-btn");
    let btn_list = control_btn.getElementsByClassName("btn");

    [...btn_list].forEach( (btn, ind) => {
            if( btn.id.startsWith(type) ) {
                btn.classList.toggle("selected", ind === id );
            }
        });
}

function changeSoundBtnSelection(type, id){
    let control_btn = document.getElementById("control-btn");
    let btn_list = control_btn.getElementsByClassName("btn");

    [...btn_list].forEach( (btn, ind) => {
            if( btn.id.startsWith(type) ) {
                btn.classList.toggle("selected");
            }
        });
}

/*

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }    
}

*/

