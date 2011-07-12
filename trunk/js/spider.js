// --  VARS DECLARATIONS
var context;
var canvas;
var tcanvas, tcontext;

var cardWidth;
var cardHeight;
var __naipes = [ 'spades', 'hearts', 'clubs', 'diamonds' ];

//for undo plays
var gameState = Array();

//card Status
var Status = {
	faceDown : 0,
	faceUp : 1,
	selected : 2
};

var decks = Array();
var topDecks = Array();
var completedDecks = Array();

//cards images
var cards = Array();
var faceDownImage;

var unusedCards = Array();

//1 or 2 or 4
var __numNaipes = 1;

var px, py;// mouse position on mousedown

var dragging = false;

var selectedCard = 0, selectedDeck = 0;
// --  END VARS DECLARATIONS

window.onload = initAll;

function initAll() {
	document.getElementById('btNewGame').onclick = newGame;
	document.getElementById('btUndo').onclick = undo;

	canvas = document.getElementById('spiderCanvas');
	context = canvas.getContext('2d');

	//LOAD IMAGES
	faceDownImage = new Image();
	faceDownImage.src = 'media/cards/back.png';

	for (i = 0; i < 4; i++) {
		cards[i] = Array();
		for (j = 1; j < 14; j++) {
			cards[i][j] = new Image();
			cards[i][j].src = 'media/cards/' + j + __naipes[i] + '.png';
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
	decks = new Array();
	topDecks = new Array();
	completedDecks = new Array();

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

	gameState = new Array();
	saveState();
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

function mouse_down(ev) {
	mousePos = getMousePos(ev);
	px = mousePos[0];
	py = mousePos[1];

	//testing if clicked on the extra top decks
	if (py <= cardHeight && topDecks[0] && px <= (topDecks[topDecks.length - 1].x + cardWidth)) {
		//testing if there is no empty column
		possible = true;
		for(i = 0; i < 10; i++) {
			if (decks[i].length == 0) {
				possible = false;
			}
		}
		if (possible) {
			//deals one top deck
			saveState();
			edeck = topDecks.pop();
			for (i = 0; i < 10; i++) {
				decks[i].push(edeck.pop());
			}
			redraw();
		}
	} else {
		for (i = 9; i >= 0; i--) {
			//check witch column was clicked
			if (px >= decks[i].x && px <= decks[i].x + cardWidth) {
				if (decks[i].length > 0) {
					for (j = decks[i].length - 1; j >= 0; j--) {
						//check for each card in column
						if (decks[i][j].status == Status.faceUp) {
							if (py >= decks[i][j].y
							&& py <= decks[i][j].y + cardHeight) {
								//found card in px,py
								dragging = checkSequence(i,j);
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

function mouse_move(ev) {
	mousePos = getMousePos(ev);
	var	dx = px - mousePos[0];
	var	dy = py - mousePos[1];

	if (dragging) {
		redraw();
		for (i = selectedCard; i < decks[selectedDeck].length; i++) {
			decks[selectedDeck][i].drawMove(dx,dy);
		}
	}
}

function mouse_up(ev) {
	//only does something if dragging...
	if (dragging) {
		mousePos = getMousePos(ev);
		var	dx = px - mousePos[0];

		xTarget = decks[selectedDeck][selectedCard].x - dx + cardWidth / 2;

		//??????
		for (j = selectedCard; j < decks[selectedDeck].length; j++) {
			decks[selectedDeck][j].status = Status.faceUp;
		}

		for (i = 0; i < 10; i++) {
			xMinColumn = decks[i].x;

			if (decks[i + 1]) {
				xMaxColumn = decks[i].x + cardWidth + (cardWidth * 0.05);
			} else {
				xMaxColumn = canvas.width;
			}

			if (xTarget < xMaxColumn && xTarget > xMinColumn) {
				if (decks[i].length == 0
				|| decks[selectedDeck][selectedCard].number == decks[i][decks[i].length - 1].number - 1) {
					//save state
					saveState();
					//remove sequence from selected deck
					seq = decks[selectedDeck].splice(selectedCard,decks[selectedDeck].length - selectedCard);

					//and puts on the target deck
					for (j = 0; j < seq.length; j++) {
						decks[i].push(seq[j]);
					}

					//check if completed K-A
					if (checkFullSequence(i)) {
						completedDecks.push(decks[i][decks[i].length-13]);
						decks[i].splice(decks[i].length-13,13);

						if (decks[i].length >= 1) {
							decks[i][decks[i].length -1].status = Status.faceUp;
						}
					}

					//if there is any card below the selected card's old deck, put it face up
					if (decks[selectedDeck][selectedCard - 1]) {
						decks[selectedDeck][selectedCard - 1].status = Status.faceUp;
					}
					break;
				}

			}
		}
		dragging = false;
		redraw();
	}
}

function getMousePos(ev) {
	var mx, my;

	if (ev.layerX || ev.layerX == 0) { // Firefox
		mx = ev.layerX - canvas.offsetLeft;
		my = ev.layerY - canvas.offsetTop;
	} else if (ev.offsetX || ev.offsetX == 0) { // Opera
		mx = ev.offsetX - canvas.offsetLeft;
		my = ev.offsetY - canvas.offsetTop;
	}

	return new Array(mx,my);
}

function checkSequence(deckNum, cardPos) {
	//check if a card have sequence cards above itself
	deck = decks[deckNum];
	isSequence = true;
	if (deck[cardPos + 1]) {
		for (k = cardPos + 1; k < deck.length; k++) {
			if (!(deck[k].naipe == deck[k - 1].naipe) || !(deck[k].number == deck[k - 1].number - 1)) {
				isSequence = false;
			}
		}
	}
	return isSequence;
}

function checkFullSequence(deckNum) {
	//checks if a column have a A-K sequence;
	deck = decks[deckNum];
	if (deck.length >= 13 && deck[deck.length-13].status==Status.faceUp) {
		pos = deck.length - 1;
		for (k = pos; k > pos - 12; k--) {
			if (!(deck[k].naipe == deck[k - 1].naipe) || !(deck[k].number == deck[k - 1].number - 1)) {
				return false;
			}
		}
		return true;
	}
	return false;
}

function saveState() {
	stateDeck = new Array(10);
	for(var i =0; i< 10; i++){
		stateDeck[i] = new Array();
		for(var j=0; j < decks[i].length; j++){
			var c = decks[i][j];
			var newC = new Card(c.naipe,c.number);
			newC.status = c.status;
			newC.x = c.x;
			newC.y = c.y;
						
			stateDeck[i].push(newC);
		}
	}
	
	stateTopDeck = new Array();
	for(var i = 0; i < topDecks.length; i++){
		stateTopDeck.push(topDecks[i].slice(0));
	}
	
	stateCompletedDecks = new Array()
	for(var i = 0; i < completedDecks.length; i++){
		stateCompletedDecks.push(completedDecks[i]);
	}
	
	gameState.push(new Array(stateDeck,stateTopDeck,stateCompletedDecks));
}

function undo() {
	if(gameState.length > 0) {
		states = gameState.pop();
		decks = states[0];
		topDecks = states[1];
		completedDecks = states[2];
		redraw();
	}
}

function redraw() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	posx = cardWidth * 0.05;
	//draw top decks
	for (i = 0; i < topDecks.length; i++) {
		topDecks[i].x = posx;
		topDecks[i].y = 0;
		drawCard(faceDownImage, posx, 0);
		posx += cardWidth * 0.3;
	}

	//draw completed decks
	posx = canvas.width-cardWidth;
	for (i = 0; i < completedDecks.length; i++) {
		completedDecks[i].drawAt(posx,0);
		posx -= cardWidth * 0.3;
	}

	//draw bottom decks
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

function drawCard(card, x, y) {
	context.drawImage(card, x, y, cardWidth, cardHeight);
}

function Card(_naipe, _number) {
	this.naipe = _naipe;
	this.number = _number;
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
	this.drawMove = function(_px, _py) {
		var xMv = this.x - _px;
		var yMv = this.y - _py;
		if (this.status == Status.faceDown) {
			drawCard(faceDownImage, xMv, yMv);
		} else {
			drawCard(cards[this.naipe][this.number], xMv, yMv);
		}
	};
	this.drawAt = function(_px, _py) {
		drawCard(cards[this.naipe][this.number], _px, _py);
	};
}