// Express Setup
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import formatMessage from './utils/message.js';
import pickRandomWord from './controllers/generateWord.js';
import {
	userJoin,
	getRoomUsers,
	getCurrentUser,
	getRoomNumbers,
	chooseActivePlayer,
} from './utils/users.js';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server);

// BodyParser
const urlencodedParser = express.urlencoded({ extended: true });
app.use(urlencodedParser);
app.use(express.json());

// Routes
import routes from './routes/index.js';
import game from './routes/game.js';

// HBS Setup
import { engine } from 'express-handlebars';

app.engine(
	'hbs',
	engine({
		extname: 'hbs',
		defaultLayout: 'main',
		layoutsDir: __dirname + '/views/layouts/',
		partialsDir: __dirname + '/views/partials/',
	})
);

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

// Use Routes
app.use('/', routes);
app.use('/game', game);

const botName = 'Scribble Bot';
let settingsSeconds = 0;

// io.on sets connection event listener on
io.on('connection', (socket) => {
	console.log('a user connected');

	socket.on('joinRoom', (player) => {
		console.log('player join', player);

		const rooms = getRoomNumbers();
		console.log(rooms);
		if (player.type === 'host') {
			if (rooms.includes(player.roomID)) {
				console.log('room already exists, new room number generated');
				player.roomID = (Math.floor(Math.random() * 10000) + 10000)
					.toString()
					.substring(1);
			}
		} else {
			if (!rooms.includes(player.roomID)) {
				console.log('room does not exist');
				socket.emit('roomExists', false, player);
				return;
			}
		}

		const user = userJoin(socket.id, player.name, player.roomID, player.team);
		socket.join(user.room);

		io.in(user.room).emit('opa', 'opa');

		// Welcome current user
		socket.emit(
			'message',
			formatMessage(botName, 'Welcome to Scribble Tittle Tattle!')
		);

		// broadcast globally (all clients) that a person has connected to a specific room
		socket.broadcast
			.to(user.room)
			.emit(
				'message',
				formatMessage(botName, `${user.username} has joined the chat`)
			);

		// Send users and room info
		// io.to(user.room).emit('roomUsers', {
		// 	room: user.room,
		// 	users: getRoomUsers(user.room),
		// });
	});

	socket.on('checkRoom', (number) => {
		const rooms = getRoomNumbers();

		if (rooms.includes(number)) {
			socket.emit('roomExists', true);
		} else {
			console.log('room does not exist');
			socket.emit('roomExists', false);
		}
	});

	socket.on('correctAnswer', (room, team, points) => {
		// socket.broadcast.emit('sendPoints', team, points);
		io.to(room).emit('sendPoints',room, team, points);
	});

	socket.on('drawing', (drawLine) => {
		io.emit('draw', drawLine);
	});

	socket.on('startDrawing', (coordinations) => {
		io.emit('startDrawing', coordinations);
	});

	socket.on('stopDrawing', (coordinations) => {
		io.emit('stopDrawing', coordinations);
	});

	socket.on('move', (coordinations) => {
		io.emit('move', coordinations);
	});

	socket.on('chatMessage', (message) => {
		// while (history.length > historySize) {
		//   history.shift()
		// }
		// history.push(message)
		console.log('dit is room' + message.room);

		io.in(message.room).emit(
			'message',
			formatMessage(message.user, message.text),
			message.room,
			message.team
		);
	});

	socket.on('startGame', (room) => {
		newRound(socket, room);
	});

	socket.on('startTimer', (room, started) => {
		io.in(room).emit('startTimer', started);
		// io.emit('startTimer', started);
	});

	socket.on('changeTimer', (time) => {
		settingsSeconds = time;
	});

	socket.on('newRound', (roomNumber) => {
		newRound(socket, roomNumber);
	});

	// Runs when client disconnects
	socket.on('leaving', (leaving) => {
		const user = getCurrentUser(socket.id, leaving);
		if (user.length > 0) {
			console.log('user disconnected ' + socket.id);
			// socket.broadcast.emit(
			io.to(user.room).emit(
				'message',
				formatMessage(botName, `${user[0].username} has left the chat`)
			);
		}
	});
});

function newRound(socket, room) {
	if (getRoomUsers(room).length > 1) {
		let activePlayer = chooseActivePlayer(room); // Make a new active player randomly
		const randomWord = pickRandomWord();
		console.log(settingsSeconds);
		// socket.broadcast.emit('startTimer', room, settingsSeconds, true);
		io.to(room).emit('startTimer', room, settingsSeconds, true);
		console.log('De actieve speler is: ', activePlayer);
		io.to(room).emit('startGame', activePlayer, randomWord);
	} else {
		socket.emit('playerAmount');
		console.log('Not enough players');
	}
}

server.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}`);
});
