//$(document).ready(function() {
//	main();
//});

var context;
var cardWidth = 64, cardHeight = 100;
var canvas;
var tcanvas, tcontext;

var naipes = [ 'spades', 'hearts', 'clubs', 'diamonds' ];

var cards = Array();

var decks = Array(), edecks = Array(), cdecks = Array();

var indc = 0;
for (i = 0; i < 4; i++) {
	cards[i] = Array();
	for (j = 1; j < 14; j++) {
		cards[i][j] = new Image();
		cards[i][j].src = 'cards/' + j + naipes[i] + '.png';
	}
}
var faceDownImage;

var nnipes = 1;

var px, py;// mouse position on mousedown

var dragging = false;

var Status = {
	faceDown : 0,
	faceUp : 1,
	selected : 2
};

var selectedCard = 0, selectedDeck = 0;

function main() {
	canvas = document.getElementById('spiderCanvas');
	context = canvas.getContext('2d');

	// var container = canvas.parentNode;
    // tcanvas = document.createElement('canvas');
// if (!tcanvas) {
// alert('Error: I cannot create a new canvas element!');
// return;
// }

// tcanvas = document.getElementById('spidertemp');
// tcontext = tcanvas.getContext('2d');
// alert(tcanvas.width);
    
    // tcanvas.style.left = canvas.offsetLeft;
// tcanvas.id = 'spiderCanvasTemp';
// tcanvas.width = canvas.width;
// tcanvas.height = canvas.height;
    
    
// container.appendChild(tcanvas);
    
// tcanvas.style.position = "absolute";
    // tcanvas.offsetLeft = 100;//parseInt(canvas.offsetLeft);
    // tcanvas.offsetTop = 50;parseInt(canvas.offsetTop);

// alert(canvas.offsetLeft);
// alert(tcanvas.offsetLeft);

    
    
	
	faceDownImage = new Image();
	faceDownImage.onload = function() {
		// context.drawImage(faceDownImage, 0, 0);
	};
	faceDownImage.src = 'cards/back.png';

	cardWidth = canvas.width / 11;
	cardHeight = cardWidth * 1.52;
	for (i = 0; i < 10; i++) {
		decks[i] = Array();
	}
	for (i = 0; i < 5; i++) {
		edecks[i] = Array();
	}
	/*
	 * 1 = 8 2 = 4 8 4 = 2 4 6 8
	 */
	tpack = Array();
	count = 0;
	naipe = -1;
	for (i = 0; i < 8; i++) {
		if (i % (8 / nnipes) == 0) {
			naipe++;
		}
		for (j = 1; j < 14; j++) {
			tpack.push(new Card(naipe, j));
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
	while (i < 54) {
		decks[deck].push(pack.pop());
		i++;
		if (deck < 9) {
			deck++;
		} else {
			deck = 0;
		}
	}
	for (i = 0; i < 10; i++) {
		decks[i][decks[i].length - 1].status = Status.faceUp;
	}
	i = 0;
	ed = 0;
	while (i < 50) {
		card = pack.pop();
		card.status = Status.faceUp;
		edecks[ed].push(card);
		i++;
		if (i % 10 == 0) {
			ed++;
		}
	}
	cards[3][13].onload = function(){  
         redraw();
    }
	redraw();
	// tredraw();
	canvas.addEventListener('mousedown', mouse_down, false);
	canvas.addEventListener('mousemove', mouse_move, false);
	canvas.addEventListener('mouseup', mouse_up, false);
	
}
function mouse_move(ev) {
	var mx, my;
	if (ev.layerX || ev.layerX == 0) { // Firefox
		mx = ev.layerX - canvas.offsetLeft;
		my = ev.layerY - canvas.offsetTop;
	} else if (ev.offsetX || ev.offsetX == 0) { // Opera
		mx = ev.offsetX - canvas.offsetLeft;
		my = ev.offsetY - canvas.offsetTop;
	}
	if (dragging) {
		dx = px - mx;
		dy = py - my;
		redraw();
		for (i = selectedCard; i < decks[selectedDeck].length; i++) {
			decks[selectedDeck][i].drawp(decks[selectedDeck][i].x - dx,
					decks[selectedDeck][i].y - dy);
		}
	}
}
function mouse_down(ev) {
	var mx, my;
// mx = ev.offsetX - canvas.offsetLeft;
// tmx = ev.offsetX - tcanvas.offsetLeft;
// alert(ev.offsetX +" - "+canvas.offsetLeft+" = "+mx);
// alert(ev.offsetX +" - "+tcanvas.offsetLeft+" = "+tmx);
	
	if (ev.layerX || ev.layerX == 0) { // Firefox
		mx = ev.layerX - canvas.offsetLeft;
		my = ev.layerY - canvas.offsetTop;
	} else if (ev.offsetX || ev.offsetX == 0) { // Opera
		mx = ev.offsetX - canvas.offsetLeft;
		my = ev.offsetY - canvas.offsetTop;
	}
	px = mx;
	py = my;
	if (py <= cardHeight && edecks[0] && px <= (edecks[edecks.length - 1].x + cardWidth)) {
		possible = true;
		for(i = 0; i < 10; i++){
			if (decks[i].length == 0){
				possible = false;
			}
		}
		if (possible) {
			edeck = edecks.pop();
			for (i = 0; i < 10; i++) {
				decks[i].push(edeck.pop());
			}
			redraw();
		}
	} else {
		for (i = 9; i >= 0; i--) {
			if (mx >= decks[i].x && mx <= decks[i].x + cardWidth) {
				if (decks[i].length > 0) {
					for (j = decks[i].length - 1; j >= 0; j--) {
						if (decks[i][j].status == Status.faceUp) {
							if (my >= decks[i][j].y
									&& my <= decks[i][j].y + cardHeight) {
								dragging = true;
								if (decks[i][j + 1]) {
									for (k = j + 1; k < decks[i].length; k++) {
										if (!(decks[i][k].naipe == decks[i][k - 1].naipe)
												|| !(decks[i][k].number == decks[i][k - 1].number - 1)) {
											dragging = false;
											break;
										}
									}
								}
								if (dragging) {
									for (k = j; k < decks[i].length; k++) {
										decks[i][k].status = Status.selected;
									}
									selectedDeck = i;
									selectedCard = j;
								}
								break;
							}
						}
					}
				}
			}
		}
	}
}
function mouse_up(ev) {
	var mx, my;
	if (ev.layerX || ev.layerX == 0) { // Firefox
		mx = ev.layerX - canvas.offsetLeft;
		my = ev.layerY - canvas.offsetTop;
	} else if (ev.offsetX || ev.offsetX == 0) { // Opera
		mx = ev.offsetX - canvas.offsetLeft;
		my = ev.offsetY - canvas.offsetTop;
	}
	dx = px - mx;
	dy = py - my;
	if (dragging) {
		cposx = decks[selectedDeck][selectedCard].x - dx + cardWidth / 2;
		cposy = decks[selectedDeck][selectedCard].y - dy + cardHeight / 2;
		for (j = selectedCard; j < decks[selectedDeck].length; j++) {
			decks[selectedDeck][j].status = Status.faceUp;
		}
		for (i = 0; i < 10; i++) {
			dposx2 = canvas.width;
			dposx1 = decks[i].x;
			if (decks[i + 1]) {
				// dposx2 = (decks[i].x + cardWidth + decks[i + 1].x) / 2;
				dposx2 = decks[i].x + cardWidth + cardWidth * 0.05;
			}
			if (cposx < dposx2 && cposx > dposx1) {
				if (decks[i].length == 0
						|| decks[selectedDeck][selectedCard].number == decks[i][decks[i].length - 1].number - 1) {
					seq = decks[selectedDeck].splice(selectedCard,
							decks[selectedDeck].length - selectedCard);
					for (j = 0; j < seq.length; j++) {
						decks[i].push(seq[j]);
					}
					ddd = i;
					if (check_sequence(i)){						
						cdecks.push(decks[ddd][decks[ddd].length-13]);
						decks[ddd].splice(decks[ddd].length-13,13);
						if (decks[ddd].length >= 1){
							decks[ddd][decks[ddd].length -1].status = Status.faceUp;
						}
					}
					if (decks[selectedDeck][selectedCard - 1]) {
						decks[selectedDeck][selectedCard - 1].status = Status.faceUp;
					}
					break;
				}

			}
		}
	}
	dragging = false;
	redraw();
}
function check_sequence(deck) {
	if (decks[deck].length >= 13 && decks[deck][decks[deck].length-13].status==Status.faceUp) {
		pos = decks[deck].length - 1;
		for (k = pos; k > pos - 12; k--) {
			// document.write(decks[deck][k].number);
			if (!(decks[deck][k].naipe == decks[deck][k - 1].naipe)
					|| !(decks[deck][k].number == decks[deck][k - 1].number - 1)) {
				return false;
			}
		}
		return true;
	}
	return false;
}
function tredraw() {
	tcontext.fillStyle = "rgba(0, 0, 200, 0.5)";  
	tcontext.fillRect(0, 0, canvas.width, canvas.height);
	/*
	 * for (i = selectedCard; i < decks[selectedDeck].length; i++) {
	 * decks[selectedDeck][i].drawp(decks[selectedDeck][i].x - dx,
	 * decks[selectedDeck][i].y - dy); }
	 */
}
function redraw() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	posx = cardWidth * 0.05;
	for (i = 0; i < edecks.length; i++) {
		edecks[i].x = posx;
		edecks[i].y = 0;
		drawCard(faceDownImage, posx, 0);
		// edecks[i][0].drawp(posx, 0);
		posx += cardWidth * 0.3;
	}
	posx = canvas.width-cardWidth;
	for (i = 0; i < cdecks.length; i++) {
		cdecks[i].drawp(posx,0);
		// edecks[i][0].drawp(posx, 0);
		posx -= cardWidth * 0.3;
	}
	posx = cardWidth * 0.05;
	for (i = 0; i < 10; i++) {
		posy = cardHeight + cardHeight * 0.05;
		decks[i].x = posx;
		for (j = 0; j < decks[i].length; j++) {
			if (decks[i][j - 1] && decks[i][j - 1].status != Status.faceDown) {
				posy += cardHeight * 0.09;
			}
			decks[i][j].x = posx;
			decks[i][j].y = posy;
			if (decks[i][j].status != Status.selected) {
				decks[i][j].draw();
			}
			posy += cardHeight * 0.09;
		}
		posx += cardWidth + cardWidth * 0.1;
	}
}
function tdrawCard(card, x, y) {
	tcontext.drawImage(card, x, y, cardWidth, cardHeight);
}
function drawCard(card, x, y) {
	context.drawImage(card, x, y, cardWidth, cardHeight);
}
function Card(_naipe, _number) {
	this.number = _number;
	this.naipe = _naipe;
	this.status = Status.faceDown;
	this.x = 0;
	this.y = 0;
	this.draw = function() {
		if (this.status == Status.faceDown) {
			drawCard(faceDownImage, this.x, this.y);
		} else {
			drawCard(cards[this.naipe][this.number], this.x, this.y);
		}
	};
	this.drawp = function(_px, _py) {
		if (this.status == Status.faceDown) {
			drawCard(faceDownImage, _px, _py);
		} else {
			drawCard(cards[this.naipe][this.number], _px, _py);
		}
	};
}

main();