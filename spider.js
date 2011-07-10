// --  VARS DECLARATIONS
var context;
var canvas;
var tcanvas, tcontext;

var cardWidth;
var cardHeight;
var __naipes = [ 'spades', 'hearts', 'clubs', 'diamonds' ];

//card Status
var Status = {
	faceDown : 0,
	faceUp : 1,
	selected : 2
};

var decks = Array(), topDecks = Array(), cdecks = Array();

//cards images
var cards = Array();
var faceDownImage;

var unusedCards = Array();

//1 or 2 or 4
var __numNaipes = 2;

var px, py;// mouse position on mousedown

var dragging = false;

var selectedCard = 0, selectedDeck = 0;
// --  END VARS DECLARATIONS

window.onload = initAll;

function initAll() {
	document.getElementById('btNewGame').onclick = newGame;

	canvas = document.getElementById('spiderCanvas');
	context = canvas.getContext('2d');

	//LOAD IMAGES
	faceDownImage = new Image();
	faceDownImage.src = 'cards/back.png';

	for (i = 0; i < 4; i++) {
		cards[i] = Array();
		for (j = 1; j < 14; j++) {
			cards[i][j] = new Image();
			cards[i][j].src = 'cards/' + j + __naipes[i] + '.png';
		}
	}

	//CARD SIZE
	cardWidth = canvas.width / 11;
	cardHeight = cardWidth * 1.52;

	//EVENTS
	canvas.addEventListener('mousedown', mouse_down, false);
	canvas.addEventListener('mousemove', mouse_move, false);
	canvas.addEventListener('mouseup', mouse_up, false);

	newGame();
}

function newGame() {

	//createCards(2 decks, number of naipes, random = true) -> return array of cards
	unusedCards = createCards(2,__numNaipes,true);
	setBottonDecks();
	setTopDecks();
	
	faceDownImage.onload = function() {
		redraw();
	}
	cards[3][13].onload = function() {
		redraw();
	}
	redraw();
}

function setBottonDecks() {
	//Create 10 collumns of cards
	for (i = 0; i < 10; i++) {
		decks[i] = Array();
	}
	
	i = 0;
	deck = 0;
	while (i < 54) {
		decks[deck].push(unusedCards.pop());
		i++;
		if (deck < 9) {
			deck++;
		} else {
			deck = 0;
		}
	}
	
	//Put the top card of each collumn face up
	for (i = 0; i < 10; i++) {
		decks[i][decks[i].length - 1].status = Status.faceUp;
	}
}

function setTopDecks() {
	//Create 5 decks of cards
	for (i = 0; i < 5; i++) {
		topDecks[i] = Array();
	}

	i = 0;
	ed = 0;
	while (i < 50) {
		card = unusedCards.pop();
		card.status = Status.faceUp;
		topDecks[ed].push(card);
		i++;
		if (i % 10 == 0) {
			ed++;
		}
	}
}

function createCards(numDecks,nNipes,random) {
	// RETURN A ARRAY OF numDecks * 54 cards of nNipes different nipes, randomize if random == True
	// OBJECT OF THE ARRAY = new Card(naipe,num) eg.: Card("Spades",3)

	orderedDeck = Array();
	naipe = -1;
	for (i = 0; i < 4*numDecks; i++) {

		if (i % (4*numDecks / nNipes) == 0) {
			naipe++;
		}

		for (j = 1; j < 14; j++) {
			orderedDeck.push(new Card(naipe, j));
		}
	}

	var finalDeck = orderedDeck;

	if(random) {
		randomDeck = Array();
		while(orderedDeck.length > 0) {
			pos = Math.floor(Math.random() * orderedDeck.length);
			randomDeck.push(orderedDeck.splice(pos, 1)[0]);
		}
		finalDeck = randomDeck;
	}

	return finalDeck;
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
	if (py <= cardHeight && topDecks[0] && px <= (topDecks[topDecks.length - 1].x + cardWidth)) {
		possible = true;
		for(i = 0; i < 10; i++) {
			if (decks[i].length == 0) {
				possible = false;
			}
		}
		if (possible) {
			edeck = topDecks.pop();
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
					if (check_sequence(i)) {
						cdecks.push(decks[ddd][decks[ddd].length-13]);
						decks[ddd].splice(decks[ddd].length-13,13);
						if (decks[ddd].length >= 1) {
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
	for (i = 0; i < topDecks.length; i++) {
		topDecks[i].x = posx;
		topDecks[i].y = 0;
		drawCard(faceDownImage, posx, 0);
		// topDecks[i][0].drawp(posx, 0);
		posx += cardWidth * 0.3;
	}
	posx = canvas.width-cardWidth;
	for (i = 0; i < cdecks.length; i++) {
		cdecks[i].drawp(posx,0);
		// topDecks[i][0].drawp(posx, 0);
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