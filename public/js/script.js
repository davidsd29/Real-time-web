const welcome_frame = document.querySelector('[data-welcome]');

export const settings = {
	button: document.querySelector('[data-setting-btn]'),
	frame: document.querySelector('[data-setting]'),
	close: document.querySelector('[data-setting-close]'),
};



setTimeout(() => {
	if(welcome_frame) welcome_frame.classList.remove('visible');
}, 3000);

settings.button.addEventListener('click', () => {
	settings.frame.classList.add('visible');
});

settings.close.addEventListener('click', () => {
	settings.frame.classList.remove('visible');
});


