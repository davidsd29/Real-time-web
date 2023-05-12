// import { assignControls } from './draw.js';

let socket = io();
let hostName = '';
let time = 30;
let currentSeconds = 0;

const welcome_frame = document.querySelector('[data-welcome]');
const drawWord = document.querySelector('[data-draw-word]');

const chat = {
	send: document.querySelector('#chat button'),
	section: document.querySelector('.chat_session'),
	form: document.querySelector('#chat'),
	messages: document.querySelector('.chat_session ul'),
	input: document.querySelector('#chat input'),
	participants: document.querySelector('.chat_session [data-participants]'),
	leave: document.querySelector('[data-leave]'),
	toggle: document.querySelector('[data-chat-toggle]'),
	indicator: document.querySelector('[data-message-indicator]'),
};

const host = {
	form: document.querySelector('#host_form'),
	name: document.querySelector('#host_form input[type="text"]'),
	team: document.querySelector('#host_form input[type="radio"]'),
	submit: document.querySelector('#host_form button[type="submit"]'),
};

const guest = {
	form: document.querySelector('#join_form'),
	name: document.querySelector('#join_form input[type="text"]'),
	room: document.querySelector('#join_form input[type="number"]'),
};

const settings = {
	form: document.querySelector('[data-settings-form]'),
	button: document.querySelector('[data-settings-btn]'),
	frame: document.querySelector('[data-settings]'),
	close: document.querySelector('[data-settings-close]'),
};

const join = {
	button: document.querySelector('[data-join]'),
	cancel: document.querySelector('[data-join-cancel]'),
};

const points = {
	teamRed: document.querySelector('[data-red-points]'),
	teamBlue: document.querySelector('[data-blue-points]'),
	redPoints: 0,
	bluePoints: 0,
};

const popUp = {
	join: document.querySelector('[data-popup-join]'),
	correct: document.querySelector('[data-popup-correct]'),
	timeUp: document.querySelector('[data-popup-timeUp]'),
	notValid: document.querySelector('[data-notValid]'),
};

const timer = document.querySelector('[data-timer]');
const startBtn = document.querySelector('[data-start-game]');
const startPlaceholder = document.querySelector('[data-start-placeholder]');

setTimeout(() => {
	if (welcome_frame !== null) welcome_frame.classList.remove('visible');
}, 3000);

const updateParticipantsAmount = (data) => {
	if (data.participants_amount === 1) {
		chat.participants.textContent = '1 friend online';
	} else {
		chat.participants.textContent = `${data.participants_amount} friends online`;
	}
};

const checkAwnser = (message, roomNumber, team, socket) => {
	if (message.text.toLowerCase() == drawWord.textContent.toLowerCase()) {
		// celebrate the winner
		console.log(`winner is ${message.username} from team ${team}`);
		popUp.correct.querySelector('span:first-of-type').textContent =
			message.username;
		popUp.correct.querySelector('span:last-of-type').textContent = team;
		popUp.correct.classList.add('open');

		setTimeout(() => {
			popUp.correct.classList.remove('open');
		}, 4000);

		if (team === 'red') {
			socket.emit(
				'correctAnswer',
				roomNumber,
				'red',
				(points.redPoints += 1)
			);
		} else {
			socket.emit(
				'correctAnswer',
				roomNumber,
				'blue',
				(points.bluePoints += 1)
			);
		}
	}
};

const log = (message) => {
	const bot_message = document.createElement('li');
	bot_message.textContent = message;
	bot_message.classList.add('log');

	if (chat.messages) chat.messages.appendChild(bot_message);
};

function addMessageElement(message, roomNumber, team, socket) {
	const chat_message = document.createElement('li');
	chat_message.innerHTML = `<p class=${team} >${message.username} <span>${message.time}</span> <p>
		<p class='test'>${message.text}</p>`;

	checkAwnser(message, roomNumber, team, socket);

	if (message.username === hostName) {
		chat_message.classList.add('host');
	} else {
		chat_message.classList.add('guest');
	}

	chat.messages.appendChild(chat_message);

	if (chat.toggle.checked) {
		if (!chat.indicator.classList.contains('hidden'))
			chat.indicator.classList.add('hidden');
		chat.indicator.textContent = 0;
	} else {
		chat.indicator.classList.remove('hidden');
		chat.indicator.textContent = Number(chat.indicator.textContent) + 1;
	}
}

function updateTimer(time, id, room, socket) {
	if (time <= 0) {
		time = currentSeconds;
		timer.classList.remove('contdown');
		popUp.timeUp.classList.add('open');

		setTimeout(() => {
			clearInterval(id);
			popUp.timeUp.classList.remove('open');
			socket.emit('newRound', room);
			io.in(room).emit('newRound', room);
		}, 4000);
	}

	timer.textContent = time;
	if (time < 10) {
		timer.classList.add('contdown');
	}
}

socket
	.on('message', (message, roomNumber, team) => {
		let botMessage = message.username.includes(' Bot');
		if (botMessage) {
			log(message.text);
			return;
		} else {
			addMessageElement(message, roomNumber, team, socket);
		}

		chat.messages.scrollTop = chat.messages.scrollHeight;
	})

	.on('sendPoints', (room, team, points) => {
		if (team === 'red') {
			points.teamRed.textContent = points;
		} else {
			points.teamBlue.textContent = points;
		}

		socket.emit('newRound', room);
	})

	.on('startGame', () => {
		// currentSeconds = time;
		startBtn.classList.add('hidden');
		startPlaceholder.classList.add('hidden');

		// socket.on('changeTimer', (time) => {
		// 	currentSeconds = time;
		// 	timer.textContent = time;
		// });
	})

	.on('startTimer', (room, settingSecondes, start) => {
		chat.leave.classList.remove('hidden');
		if (start) {
			
			if (settingSecondes !== 0) time = settingSecondes;

			let id = setInterval(() => {
				//Update view every 1s
				time -= 1;
				updateTimer(time, id, room, socket);
			}, 1000);
		}
	})

	.on('roomUsers', (data) => {
		console.log('roomUsers');
		console.log(data);
		updateParticipantsAmount(data.users);

		// ROOM USERS NOT WORKING
	})

	.on('roomExists', (exist, player) => {
		if (exist) {
			socket.emit('joinRoom', player, 'guest');
			if (chat.send) chat.send.setAttribute('data-team', player.team);
			guest.form.submit();
		} else {
			popUp.notValid.classList.remove('hidden');
			setTimeout(() => {
				popUp.notValid.classList.add('hidden');
			}, 4000);
		}
	});

if (host.form) {
	host.form.addEventListener('submit', (event) => {
		// event.preventDefault();
		
		// Whenever the server emits 'user joined', log it in the chat body
		if (host.name.value) {
			let number = event.target
				.querySelector('button')
				.getAttribute('data-room');
			const player = {
				name: host.name.value,
				team: host.team.value,
				room: number,
			};

			console.log('joinRoom', player);
			// socket.emit('newRound', player.room);
			socket.emit('joinRoom', player, 'host');
		}
	});

	guest.form.addEventListener('submit', (event) => {
		event.preventDefault();
		// Whenever the server emits 'user joined', log it in the chat body
		if (guest.name.value && guest.room.value) {
			const player = {
				name: guest.name.value,
				room: guest.room.value,
			};

			socket.emit('checkRoom', player, 'guest');
			// socket.emit('newRound', player.room);
		}
	});

	join.button.addEventListener('click', () => {
		popUp.join.classList.toggle('open');
	});

	join.cancel.addEventListener('click', () => {
		popUp.join.classList.remove('open');
	});
}

if (chat.leave) {
	chat.leave.addEventListener('click', (event) => {

		socket.emit('leaving', true);
		window.location.href = '/';
	});

	chat.form.addEventListener('submit', (event) => {
		event.preventDefault();
		let user_name = event.target
			.querySelector('button')
			.getAttribute('data-host');

		hostName = user_name;

		if (chat.input.value) {
			const chat_bolb = {
				user: user_name,
				text: chat.input.value,
				room: event.target
					.querySelector('button')
					.getAttribute('data-room-number'),
				team: event.target
					.querySelector('button')
					.getAttribute('data-team'),
			};

			// Tell the server your username and message
			socket.emit('chatMessage', chat_bolb);
			chat.input.value = '';
			chat.input.focus();
		}
	});

	if (startBtn) {
		startBtn.addEventListener('click', () => {
			startBtn.classList.add('hidden');
			let roomNumber = startBtn.getAttribute('data-room');
			socket.emit('startGame', roomNumber);
		});
	}
}

settings.form.addEventListener('submit', (event) => {
	event.preventDefault();

	const timerSeconnds = event.target.querySelector('input[type=number]').value;
	socket.emit('changeTimer', timerSeconnds);

	// FEEDBACK GEVEN DAT HET IS AANGEPAST
});

settings.button.addEventListener('click', () => {
	settings.frame.classList.add('visible');
});

settings.close.addEventListener('click', () => {
	settings.frame.classList.remove('visible');
});
