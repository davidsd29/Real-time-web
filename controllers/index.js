export const home = (req, res) => {
	let roomNumber = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);

	res.render('home', { roomNumber });
};
