const brush = {
	color: document.querySelectorAll('[data-brush-color]'),
	slider: document.querySelector('[data-brush-slider]'),
	value: document.querySelector('[data-brush-value]'),
};

brush.slider.addEventListener('input', () => {
	brush.value.textContent = brush.slider.value;
});

brush.color.forEach((pallet) => {
	pallet.addEventListener('click', () => {
		brush.color.forEach((c) => c.classList.remove('active'));
		pallet.classList.add('active');

		let pallet_color = getComputedStyle(pallet);
		console.log(pallet_color['background-color']);
	});
});