import { settings } from './script.js';

let socket = io();
const chat = {
	section: document.querySelector('.chat_session'),
	form: document.querySelector('#chat'),
	messages: document.querySelector('.chat_session ul'),
	input: document.querySelector('#chat input'),
};


settings.button.addEventListener('click', () => {
	settings.frame.classList.add('visible');
});

settings.close.addEventListener('click', () => {
	settings.frame.classList.remove('visible');
});


chat.form.addEventListener('submit', (event) => {
	event.preventDefault();
	let user_name = event.target.querySelector('button').getAttribute('data-host');
	if (chat.input.value) {
		const chat_bolb = {
		    user: user_name,
		    message: chat.input.value
		}
		socket.emit('message', chat_bolb);
		chat.input.value = '';
	}
});

socket.on('message', (item) => {
	chat.messages.appendChild(
		Object.assign(document.createElement('li'), {
			textContent: `${item.user}: ${item.message}`,
		})
	);
	chat.messages.scrollTop = chat.messages.scrollHeight;
});
