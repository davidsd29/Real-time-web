let socket = io();
let host = '';

const welcome_frame = document.querySelector('[data-welcome]');
const drawWord = document.querySelector('[data-draw-word]');

const chat = {
	section: document.querySelector('.chat_session'),
	form: document.querySelector('#chat'),
	messages: document.querySelector('.chat_session ul'),
	input: document.querySelector('#chat input'),
	participants: document.querySelector('.chat_session [data-participants]'),
	leave: document.querySelector('[data-leave]'),
};

const start = {
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

const checkAwnser = (message, roomNumber) => {
	if (message.text.toLowerCase() == drawWord.textContent.toLowerCase()) {
		// celebrate the winner
		console.log(`winner is ${message.username} from team ${message.team}`);
		
		socket.emit('newRound', roomNumber);
	}
};

function addMessageElement(message, roomNumber, team) {
	const chat_message = document.createElement('li');
	chat_message.innerHTML = `<p>${message.username} <span>${message.time}</span> <p>
		<p class='test'>${message.text}</p>`;

	checkAwnser(message, roomNumber, team);

	if (message.username === host) {
		chat_message.classList.add('host');
	} else {
		chat_message.classList.add('guest');
	}

	chat.messages.appendChild(chat_message);
}

const log = (message) => {
	const bot_message = document.createElement('li');
	bot_message.textContent = message;
	bot_message.classList.add('log');

	if(chat.messages) chat.messages.appendChild(bot_message);
};

// settings.button.addEventListener('click', () => {
// 	settings.frame.classList.add('visible');
// });

// settings.close.addEventListener('click', () => {
// 	settings.frame.classList.remove('visible');
// });

socket.on('message', (message, roomNumber, team) => {
	let botMessage = message.username.includes('Bot');
	if (botMessage) {
		log(message.text);
		return;
	} else {
		addMessageElement(message, roomNumber, team);
	}

	chat.messages.scrollTop = chat.messages.scrollHeight;
});


if (start.form) {
	start.submit.addEventListener('click', (event) => {
		// Whenever the server emits 'user joined', log it in the chat body
		if (start.name.value) {
			const player = {
				name: start.name.value,
				team: start.team.value,
				room: event.target.getAttribute('data-room'),
			};

			console.log('joinRoom', player);
			socket.emit('joinRoom', player);
			socket.emit('newRound', player.room);
		}
	});

	guest.form.addEventListener('submit', (event) => {
		// Whenever the server emits 'user joined', log it in the chat body
		if (guest.name.value && guest.room.value) {
			const player = {
				name: guest.name.value,
				room: guest.room.value,
			};

			socket.emit('joinRoom', player);
			socket.emit('newRound', player.room);
		}
	});
}

if (chat.leave) {
	chat.leave.addEventListener('click', (event) => {
		const player = {
			name: event.target.getAttribute('data-host'),
			room: event.target.getAttribute('data-room'),
			canLeave: true,
		};
		socket.emit('leaving', true);
		window.location.href = '/';
	});

	chat.form.addEventListener('submit', (event) => {
		event.preventDefault();
		let user_name = event.target
			.querySelector('button')
			.getAttribute('data-host');

			host = user_name;
		 
		if (chat.input.value) {
			const chat_bolb = {
				user: user_name,
				text: chat.input.value,
				room: event.target.querySelector('button').getAttribute('data-room-number'),
				team: event.target.querySelector('button').getAttribute('data-team'),
			};

			// Tell the server your username and message
			socket.emit('chatMessage', chat_bolb);
			chat.input.value = '';
			chat.input.focus();
		}
	});
}
