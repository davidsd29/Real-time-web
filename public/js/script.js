let socket = io();
const welcome_frame = document.querySelector('[data-welcome]');

export const settings = {
	button: document.querySelector('[data-setting-btn]'),
	frame: document.querySelector('[data-setting]'),
	close: document.querySelector('[data-setting-close]'),
};

const guest = {
	form: document.querySelector('#join_form'),
	name: document.querySelector('#join_form input[type="text"]'),
	room: document.querySelector('#join_form input[type="number"]'),
};

const host = {
	form: document.querySelector('#host_form'),
	name: document.querySelector('#host_form input[type="text"]'),
	submit: document.querySelector('#host_form button[type="submit"]'),
};

if (host.form) {
	host.submit.addEventListener('click', (event) => {
		// event.preventDefault();
		// Whenever the server emits 'user joined', log it in the chat body
		if (host.name.value) {
			const player = {
				name: host.name.value,
				room: event.target.getAttribute('data-room'),
			};
			
			console.log('player join', player);
			socket.emit('player join', player);
		}
	});
}

if (guest.form) {
	guest.form.addEventListener('submit', (event) => {
		// Whenever the server emits 'user joined', log it in the chat body
		if (guest.name.value && guest.room.value) {
			const player = {
				name: guest.name.value,
				room: guest.room.value,
			};

			socket.emit('player join', player);
		}
	});
}

setTimeout(() => {
	if (welcome_frame !== null) welcome_frame.classList.remove('visible');
}, 3000);

settings.button.addEventListener('click', () => {
	settings.frame.classList.add('visible');
});

settings.close.addEventListener('click', () => {
	settings.frame.classList.remove('visible');
});
