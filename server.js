// Express Setup
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import { userJoin, userLeave } from './public/js/users.js';
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

// io.on sets connection event listener on
io.on('connection', (socket) => {
	let addedUser = false;
	console.log('a user connected');

	socket.on('player join', (user) => {
		if (addedUser) return;
		joinRoom(socket, user, addedUser);
	});

	socket.on('leaveRoom', (user) => {
		if (addedUser) leaveRoom(socket, user);
	});

	socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));

	// io.emit('history', history)

	socket.on('message', (message) => {
		// while (history.length > historySize) {
		//   history.shift()
		// }
		// history.push(message)

		io.emit('message', message);
	});

	socket.on('player leave', (user) => {
		console.log('left');
		leaveRoom(socket, user);
	});

	socket.on('disconnect', () => {
		console.log('user disconnected');
	});
});

function joinRoom(socket, user, addedUser) {
	// echo globally (all clients) that a person has connected
	numUsers++;
	addedUser = true;
	socket.username = user.name;
	socket.broadcast.emit('bot message', {
		participants_amount: numUsers,
		username: user.name,
	});
}

function leaveRoom(socket, name) {
	numUsers--;
	console.log('user left');

	if (numUsers < 0) numUsers = 0;

	// echo globally that this client has left
	socket.broadcast.emit('user left', {
		username: name,
		participants_amount: numUsers,
	});
}

server.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}`);
});
