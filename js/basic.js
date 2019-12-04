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

