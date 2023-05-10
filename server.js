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

let numUsers = 0;
const botName = 'Scribble Bot';
// io.on sets connection event listener on
io.on('connection', (socket) => {
	console.log('a user connected');

	socket.on('joinRoom', (player) => {
		console.log('player join', player);
		const user = userJoin(socket.id, player.name, player.room, player.team);

		socket.join(user.room);

		// Welcome current user
		socket.emit(
			'message',
			formatMessage(botName, 'Welcome to Scribble Tittle Tattle!')
		);

		//when player connects, send the team to the client
		socket.emit('playerTeam', user.team);
		console.log('player team: ' + user.team);

		// broadcast globally (all clients) that a person has connected to a specific room
		socket.broadcast.emit(
			'message',
			formatMessage(botName, `${user.username} has joined the chat`)
		);

		// Send users and room info
		socket.to(user.room).emit('roomUsers', {
			room: user.room,
			users: getRoomUsers(user.room),
		});
	});

	socket.on('checkRoom', (player) => {
		const rooms = getRoomNumbers();

		if (rooms.includes(player.room)) {
			socket.emit('roomExists', true, player);
		} else {
			socket.emit('roomExists', false, player);
		}
	});

	socket.on('correctAnswer', (room, team, points) => {

		io.emit('sendPoints', team, points);
		// io.to(room).emit('sendPoints',room, team, points);
		io.emit('startTimer', false);
	});

	socket.on('drawing', (draw) => {
		io.emit('draw', draw);
	});

	socket.on('startDrawing', (coord) => {
		io.emit('startDrawing', coord);
	});

	socket.on('stopDrawing', (coord) => {
		io.emit('stopDrawing', coord);
	});

	socket.on('move', (coord) => {
		io.emit('move', coord);
	});

	socket.on('chatMessage', (message) => {
		// while (history.length > historySize) {
		//   history.shift()
		// }
		// history.push(message)
		console.log('dit is room' + message.room)

		io.emit(
			'message',
			formatMessage(message.user, message.text),
			message.room,
			message.team
		);
	});

	socket.on('newRound', (roomNumber) => {
		newRound(socket, roomNumber);
	});

	// Runs when client disconnects
	socket.on('leaving', (leaving) => {
		const user = getCurrentUser(socket.id, leaving);
		if (user.length > 0) {
			console.log('user disconnected ' + socket.id);
			socket.broadcast.emit(
				// io.to(user.room).emit(
				'message',
				formatMessage(botName, `${user[0].username} has left the chat`)
			);
		}
	});
});

function newRound(socket, room) {

	console.log('newRound in room: ', room)
	if (getRoomUsers(room).length > 2) {
		// socket.nickname = chooseActivePlayer(room);
		let activePlayer = chooseActivePlayer(room); // Make a new active player randomly
		const randomWord = pickRandomWord();

		io.emit('drawWord', randomWord); // Give the word to all the sockets

		// const players = {
		// 	active: socket.nickname,
		// 	random: activePlayer,
		// };
		socket.broadcast.emit('activePlayer', activePlayer); // Give the active player to all the sockets
		console.log('De actieve speler is: ', activePlayer);
		socket.broadcast.emit('startTimer', true)
	} else {
		console.log('Not enough players');
	}
}

server.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}`);
});
