import express from 'express';
import { chat_rooms } from '../data/chatroom.js';
import pickRandomWord from '../controllers/generateWord.js';
const router = express.Router();

const checkRoom = (roomNumber) => {
	const room = chat_rooms.filter((obj) => obj.room_number === roomNumber);
	return room;
};

router
	.get('/', (req, res) => {
		console.log('ik ben er in gekomen');
		const room = checkRoom(req.query.room_nmbr);
		// if (room.length !== 0) {
		// room[0].players.push(req.query.guest);
		res.render('game', {
			game: true,
			room_number: req.query.room_nmbr,
			subject: 'Can you guess what I am drawing?',
			user_name: req.query.guest || {},
		});
		// }
	})

	.post('/:roomNumber', (req, res) => {
		const word = pickRandomWord();
		chat_rooms.push({
			room_number: req.params.roomNumber,
			host: req.body.user_name,
			players: [],
		});

		console.log(chat_rooms);

		res.render('game', {
			game: true,
			room_number: req.params.roomNumber,
			subject: word,
			user_name: req.body.user_name || {},
		});
	})

	.get('/:roomNumber', (req, res) => {
		const room = checkRoom(req.query.room_nmbr);
		console.log(room);

		res.render('game', {
			game: true,
			room_number: req.params.roomNumber,
			user_name: req.params.guest || {},
		});
	});

export default router;
