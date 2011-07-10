$(document).ready(function(){
    main();
});

var context;
var cardWidth = 64, cardHeight = 100;
var canvas;

var naipes = ['spades', 'clubs', 'hearts', 'diamonds'];

var cards = Array();
var ncards = 0;

var pack = Array();

var decks = Array();

var indc = 0;
for (i = 0; i < 4; i++) {
    cards[i] = Array();
    for (j = 1; j < 14; j++) {
        cards[i][j] = new Image();
        cards[i][j].src = 'cards/' + j + naipes[i] + '.png';
    }
}
var back = new Image();
back.src = 'cards/back.png'

var nnipes = 1;

var px, py;



function main(){
    canvas = document.getElementById('spidercanvas');
    canvas.width = 800
    canvas.height = 500
    context = canvas.getContext('2d');
    
	cardWidth = canvas.width/11;
	cardHeight = cardWidth*1.52;
	
    for (i = 0; i < 10; i++) {
        decks[i] = Array();
    }    
    tpack = Array();
    count = 0;
    for (i = 0; i < 8; i++) {
        for (j = 1; j < 14; j++) {
            tpack.push(cards[0][j]);
            count++;
        }
    }
    pack = Array();
	var nc = count;
    for (i = 0; i < nc; i++) {
        pos = Math.floor(Math.random() * count);
		
        pack.push(tpack[pos]);
        tpack.splice(pos, 1);
        count--;
    }
	i = 0;
	deck = 0;
    while (i < nc){
		decks[deck].push(pack[i]);
		i++;
		if (deck < 9){
			deck++;
		} else {
			deck = 0;
		}
	}
	redraw();
    canvas.addEventListener('mousedown', mouse_down, false);
}
function mouse_down(ev){
	var mx,my;
	if (ev.layerX || ev.layerX == 0) { // Firefox
      	mx = ev.layerX;
      	my = ev.layerY;
    } else if (ev.offsetX || ev.offsetX == 0) { // Opera
      	mx = ev.offsetX;
      	my = ev.offsetY;
    }
	context.strokeRect(mx-canvas.offsetLeft,my-canvas.offsetTop,2,2);
}
function redraw(){
	for (i = 0; i < 10; i++){
		for (j = 0; j < decks[i].length; j++){
			drawCard(decks[i][j],i*cardWidth+cardWidth*0.1*i+cardWidth*0.05 ,j*20);
		}
	}
}
function drawCard(card, x, y){
    context.drawImage(card, x, y, cardWidth, cardHeight);
}
function Card(_number, _naipe){
    this.number = _number;
    this.naipe = _naipe;
    this.flipped = false;
	
}