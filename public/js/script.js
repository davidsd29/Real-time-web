let socket = io();
const chat = {
	section: document.querySelector('.chat_session'),
	form: document.querySelector('#chat'),
	messages: document.querySelector('.chat_session ul'),
	input: document.querySelector('#chat input'),
};

const user = {
	form: document.querySelector('#name'),
	input: document.querySelector('#name input'),
};

user.form.addEventListener('submit', (event) => {
	event.preventDefault();

	if (event.target.value !== '') {
		chat.section.classList.remove('hidden');
		socket.emit('username', user.input.value);

		chat.form.addEventListener('submit', (event) => {
			event.preventDefault();
			if (chat.input.value) {

                const chat_bolb = {
                    user: user.input.value,
                    message: chat.input.value  
                } 
                socket.emit('message', chat_bolb);
				chat.input.value = '';
			}
		});
	} else {
		chat.section.classList.add('hidden');
	}
});



socket.on('message', (item) => {
	chat.messages.appendChild(
		Object.assign(document.createElement('li'), { textContent: `${item.user}: ${item.message}` })
	);
	chat.messages.scrollTop = chat.messages.scrollHeight;
});
