import { settings } from './script.js';

let socket = io();
let host = '';

const draw_word = document.querySelector('[data-draw_word]');

const chat = {
	section: document.querySelector('.chat_session'),
	form: document.querySelector('#chat'),
	messages: document.querySelector('.chat_session ul'),
	input: document.querySelector('#chat input'),
	participants: document.querySelector('.chat_session [data-participants]'),
	leave: document.querySelector('[data-leave]'),
};

const updateParticipantsAmount = (data) => {
	if (data.participants_amount === 1) {
		chat.participants.textContent = '1 friend online';
	} else {
		chat.participants.textContent = `${data.participants_amount} friends online`;
	}
};

const checkAwnser = (message) => {
	if (message.toLowerCase() === draw_word.textContent.toLowerCase()) {
		// celebrate the winner
		console.log('You guessed it!');
	}
};


const log = (message) => {
	const bot_message = document.createElement('li');
	bot_message.textContent = message;
	bot_message.classList.add('log');

	chat.messages.appendChild(bot_message);
};

settings.button.addEventListener('click', () => {
	settings.frame.classList.add('visible');
});

settings.close.addEventListener('click', () => {
	settings.frame.classList.remove('visible');
});

chat.leave.addEventListener('click', (event) => {
	socket.emit('player leave', event.target.getAttribute('data-host'));
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
			message: chat.input.value,
		};

		// Tell the server your username and message
		socket.emit('message', chat_bolb);
		chat.input.value = '';
	}
});

socket.on('message', (item) => {
	const chat_message = document.createElement('li');
	chat_message.textContent = `${item.user}: ${item.message}`;

	checkAwnser(item.message);

	if (item.user === host) {
		chat_message.classList.add('host');
	} else {
		chat_message.classList.add('guest');
	}

	chat.messages.appendChild(chat_message);
	chat.messages.scrollTop = chat.messages.scrollHeight;
});

// Whenever the server emits 'login', log the login message
socket.on('bot message', (data) => {
	// Display the welcome message
	log(`${data.username}- Joined the room`);
	updateParticipantsAmount(data);
});

// Whenever the server emits 'user left', log it in the chat body
socket.on('user left', (data) => {
	console.log(data);
	log(`${data.username} left the chat`);
	updateParticipantsAmount(data);
});
