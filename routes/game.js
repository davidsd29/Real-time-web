import express from 'express';
const router = express.Router();

router
	.get('/', (req, res) => {

		// res.redirect('/game/' + req.query.roomNumber, {
		// 	guest: req.query.guest || {}
		// });
		
		res.redirect('/game/' + req.query.roomNumber + '?guest=' + req.query.guest);
		
		// res.redirect('/test', () => {
		// 	console.log('nu mort jr hirt zijn');
		// });
	})

	.post('/:roomNumber', (req, res) => {
		res.render('game', {
			layout: 'gameRoom',
			room_number: req.params.roomNumber,
			subject: req.body.drawing,
			user_name: req.body.user_name || {},
		});
	})

	.get('/:roomNumber', (req, res) => {
		console.log('hai')
		res.render('game', {
			layout: 'gameRoom',
			room_number: req.params.roomNumber,
			subject: 'Can you guess what I am drawing?',
			user_name: req.params.guest || {},
		});
	});

export default router;
