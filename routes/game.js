import express from 'express';
import { chat_rooms } from '../data/chatroom.js';
const router = express.Router();

router
	.get('/', (req, res) => {
		const room = chat_rooms.filter(
			(obj) => obj.room_number === req.query.room_nmbr
		);
		console.log(room);

		room[0].players.push(req.query.guest);

		if (room !== undefined || room !== []) {
			res.render('game', {
				layout: 'gameRoom',
				room_number: req.query.room_nmbr,
				subject: 'Can you guess what I am drawing?',
				user_name: req.query.guest || {},
			});
		}
	})

	.post('/:roomNumber', (req, res) => {
		chat_rooms.push({
			room_number: req.params.roomNumber,
			host: req.body.user_name,
			players: [],
		});

		console.log(chat_rooms);

		res.render('game', {
			layout: 'gameRoom',
			room_number: req.params.roomNumber,
			subject: req.body.drawing,
			user_name: req.body.user_name || {},
		});
	})

	.get('/:roomNumber', (req, res) => {
		console.log('hai');
		res.render('game', {
			layout: 'gameRoom',
			room_number: req.params.roomNumber,
			subject: 'Can you guess what I am drawing?',
			user_name: req.params.guest || {},
		});
	});

export default router;
