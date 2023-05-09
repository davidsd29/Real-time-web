let socket = io();

const brush = {
	pallet: document.querySelector('.drawspace aside'),
	color: document.querySelectorAll('[data-brush-color]'),
	slider: document.querySelector('[data-brush-slider]'),
	value: document.querySelector('[data-brush-value]'),
	button: document.querySelector('[data-brush-btn]'),
	option: document.querySelector('[data-brush-option]'),
	frame: document.querySelector('[data-brush]'),
};

const clientBtn = document.querySelector('[data-host]');
const canvas = document.querySelector('canvas');

const canvasContex = canvas.getContext('2d');
const drawWord = document.querySelector('[data-draw-word]');

let currntColor = 'black';
let isDrawing = false;
let mayDraw = false;
let word = '';
let lineWidth = 2;
let mouseVector = { x: 0, y: 0 };

let startDrawing;
let stopDrawing;
let onMouseMove;

const mouseCanvasLocation = (e, axis) => {
	const rect = canvas.getBoundingClientRect();
	if (axis == 'x') {
		return Math.floor(e.clientX - rect.left);
	} else return Math.floor(e.clientY - rect.top);
};


// if user starts drawing
socket.on('startDrawing', (coordinates) => {
	console.log('start drawing')
	isDrawing = true;
	mouseVector = { x: coordinates[0], y: coordinates[1] };
});

// if user is drawing
socket.on('move', (coordinates) => {
	if (!isDrawing) return;
	drawLine(coordinates, currntColor, lineWidth);
});

// if user stops drawing
socket.on('stopDrawing', (coordinates) => {
	if (!isDrawing) return;
	isDrawing = false;
	mouseVector = { x: coordinates[0], y: coordinates[1] };
	drawLine(coordinates, currntColor, lineWidth);
});

function drawLine(coordinates, currentColor, brushSize) {
	if (isDrawing) {
		canvasContex.beginPath();
		canvasContex.strokeStyle = currentColor;
		canvasContex.lineWidth = brushSize;

		canvasContex.moveTo(mouseVector.x, mouseVector.y);
		canvasContex.lineTo(coordinates[0], coordinates[1]);
		canvasContex.stroke();

		mouseVector = { x: coordinates[0], y: coordinates[1] };

		socket.emit('drawing', {
			x: coordinates[0],
			y: coordinates[1],
			color: currentColor,
			brushSize: brushSize,
		});

		socket.on('drawing', drawEvent);
	}
};


function drawEvent(draw) {
	const { x, y, color, stroke } = draw;

	canvasContex.beginPath();
	canvasContex.moveTo(x, y);
	canvasContex.lineTo(x, y);
	canvasContex.strokeStyle = color;
	canvasContex.lineWidth = stroke;
	canvasContex.stroke();
	canvasContex.closePath();
}

// function getMousePos(e) {
// 	isDrawing = true;
// 	var rect = canvas.getBoundingClientRect();

// 	console.log(rect);
// 	// Store the mouse cordinates
// 	// mouseVector.x = mouseCanvasLocation(e, 'x');
// 	// mouseVector.y = mouseCanvasLocation(e, 'y');
// 	mouseVector.x = e.clientX;
// 	mouseVector.y = e.clientY;

// 	console.log('mouse start: x: ' + mouseVector.x, ' y: ' + mouseVector.y);
// }


// limit the number of events per second
function throttle(callback, delay) {
	var previousCall = new Date().getTime();
	return function () {
		var time = new Date().getTime();

		if (time - previousCall >= delay) {
			previousCall = time;
			callback.apply(null, arguments);
		}
	};
}

brush.button.addEventListener('click', () => {
	brush.option.classList.toggle('hidden');
});


brush.slider.addEventListener('input', () => {
	brush.value.textContent = brush.slider.value;
	lineWidth = brush.slider.value;
});

brush.color.forEach((pallet) => {
	pallet.addEventListener('click', () => {
		brush.color.forEach((c) => c.classList.remove('active'));
		pallet.classList.add('active');

		// Set the current color
		currntColor = getComputedStyle(pallet)['background-color'];

		console.log(getComputedStyle(pallet)['background-color']);
	});
});

socket.on('drawWord', (answer) => {
	word = answer;
});

socket.on('activePlayer', (player) => {
	canvasContex.clearRect(0, 0, canvas.width, canvas.height);

	// let clients = io.sockets.adapter.rooms[player.room];
	// console.log(clients);
	console.log('Client name' + clientBtn.getAttribute('data-host'));
	console.log('player id: ' + player.username);
	const clientName = clientBtn.getAttribute('data-host');

	if (clientName === player.username) {
		//if you are the player
		console.log('you are the player');
		mayDraw = true;
		// Show the drawing options and answer
		brush.pallet.classList.remove('hidden');
		brush.frame.classList.remove('hidden');
		console.log('word: ' + word);
		drawWord.textContent = `${word}`.toUpperCase();

		startDrawing = (event) => {
			console.log(
				'mouse starts at:  x:' + event.clientX,
				' y: ' + event.clientY
			);

			// socket.emit('startDrawing', [event.offsetX, event.offsetY]);
			socket.emit('startDrawing', [mouseCanvasLocation(event, 'x'), mouseCanvasLocation(event, 'y')]);
		};

		stopDrawing = (event) => {
			// socket.emit('stopDrawing', [event.offsetX, event.offsetY]);
			socket.emit('stopDrawing', [mouseCanvasLocation(event, 'x'), mouseCanvasLocation(event, 'y')]);

		};

		onMouseMove = (event) => {
			if(!isDrawing) return;
			// socket.emit('move', [event.offsetX, event.offsetY]);
			socket.emit('move', [mouseCanvasLocation(event, 'x'), mouseCanvasLocation(event, 'y')]);
			
		};

		// Add the option to draw
		// canvas.addEventListener('mousedown', getMousePos);
		canvas.addEventListener('mousedown', startDrawing, false);
		canvas.addEventListener('mousemove', throttle(onMouseMove, 1), false);
		canvas.addEventListener('mouseup', stopDrawing, false);
		canvas.addEventListener('mouseout', stopDrawing, false);
	} else {
		mayDraw = false;
		drawWord.textContent = 'Can you guess the word?';
		// Remove the option to draw
		canvas.removeEventListener('mousedown', startDrawing);
		canvas.removeEventListener('mousemove', throttle(onMouseMove, 1));
		canvas.removeEventListener('mouseup', stopDrawing);
		canvas.removeEventListener('mouseout', stopDrawing);

		// Hide the drawing options and answer
		if (brush.pallet.classList.contains('hidden')) return;
		brush.frame.classList.add('hidden');
		brush.pallet.classList.add('hidden');
	}
});
