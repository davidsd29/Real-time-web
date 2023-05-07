const brush = {
	pallet: document.querySelector('.drawspace aside'),
	color: document.querySelectorAll('[data-brush-color]'),
	slider: document.querySelector('[data-brush-slider]'),
	value: document.querySelector('[data-brush-value]'),
};

const canvas = document.querySelector('canvas');

const canvasContex = canvas.getContext('2d');
const drawWord = document.querySelector('[data-draw-word]');

let currntColor = 'black';
let isDrawing = false;
let mayDraw = false;
let word = '';
let lineWidth = 2;
let mouseVector = { x: 0, y: 0 };

const mouseCanvasLocation = (e, axis) => {
	const rect = canvas.getBoundingClientRect();
	if (axis == 'x') {
		return Math.floor(e.clientX - rect.left);
	} else return Math.floor(e.clientY - rect.top);
};

socket.on('drawing', onDrawingEvent);

function drawLine(
	startX,
	startY,
	mouseMoveX,
	mouseMoveY,
	color,
	brushSize,
	emit
) {
	// Create a new path
	canvasContex.beginPath();

	canvasContex.strokeStyle = color;
	canvasContex.lineWidth = brushSize;

	// Set the line cordinates
	canvasContex.moveTo(startX, startY);
	canvasContex.lineTo(mouseMoveX, mouseMoveY);

	// Draw the line
	canvasContex.stroke();
	canvasContex.closePath();

	if (!emit) return;

	socket.emit('drawing', {
		x0: startX / canvas.width,
		y0: startY / canvas.height,
		x1: mouseMoveX / canvas.width,
		y1: mouseMoveY / canvas.height,
		color: currntColor,
		lineWidth: lineWidth,
	});
}

function onDrawingEvent(data) {
	drawLine(
		data.x0 * canvas.width,
		data.y0 * canvas.height,
		data.x1 * canvas.width,
		data.y1 * canvas.height,
		data.color,
		data.brushSize
	);
}

function getMousePos(e) {
	isDrawing = true;
	var rect = canvas.getBoundingClientRect();

	console.log(rect);
	// Store the mouse cordinates
	mouseVector.x = mouseCanvasLocation(e, 'x');
	mouseVector.y = mouseCanvasLocation(e, 'y');

	console.log('mouse start: x: ' + mouseVector.x, ' y: ' + mouseVector.y);
}

function onMouseMove(e) {
	qqq;
	// Check if user is drawing
	if (!isDrawing) return;
	console.log(
		'mouse is moving:  x:' + mouseCanvasLocation(e, 'x'),
		' y: ' + mouseCanvasLocation(e, 'y')
	);
	// console.log("brush color: " + currntColor)
	// console.log("brush size: " + lineWidth)

	// Send the mouse movement data and event cordinates to the server and draw the line
	// Starts drawring from mouse position
	drawLine(
		mouseVector.x,
		mouseVector.y,
		mouseCanvasLocation(e, 'x'),
		mouseCanvasLocation(e, 'y'),
		currntColor,
		lineWidth,
		true
	);
}

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

function stopDrawing(e) {
	if (!isDrawing) return; // if the user is not drawing, then return
	isDrawing = false;

	// Send last coordinates for drawing
	drawLine(
		mouseVector.x,
		mouseVector.y,
		mouseCanvasLocation(e, 'x'),
		mouseCanvasLocation(e, 'y'),
		currntColor,
		lineWidth,
		true
	);
}

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
	console.log('active player: ' + player.active);
	console.log('your id: ' + player.random);
	if (player.active == player.random) {
		//if you are the player
		console.log('you are the player');
		mayDraw = true;
		// Show the drawing options and answer
		brush.pallet.classList.remove('hidden');
		console.log('word: ' + word);
		drawWord.textContent = `${word}`.toUpperCase();

		// Add the option to draw
		canvas.addEventListener('mousedown', getMousePos);
		canvas.addEventListener('mousemove', throttle(onMouseMove, 1));
		canvas.addEventListener('mouseup', stopDrawing);
		canvas.addEventListener('mouseout', stopDrawing);

	} else {
		mayDraw = false;
		drawWord.textContent = 'Can you guess the word?';
		// Remove the option to draw
		canvas.removeEventListener('mousedown', getMousePos);
		canvas.removeEventListener('mousemove', throttle(onMouseMove, 1));
		canvas.removeEventListener('mouseup', stopDrawing);
		canvas.removeEventListener('mouseout', stopDrawing);

		// Hide the drawing options and answer
		if (brush.pallet.classList.contains('hidden')) return;
		brush.pallet.classList.add('hidden');
	}
});
