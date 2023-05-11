import express from 'express';
import { chat_rooms } from '../data/chatroom.js';
import pickRandomWord from '../controllers/generateWord.js';
const router = express.Router();

const checkRoom = (roomNumber) => {
	const room = chat_rooms.filter((obj) => obj.room_number === roomNumber);
	return room;
};

router
	.get('/guest', (req, res) => {
		console.log('ik ben er in gekomen');

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

	.get('/:roomNumber', (req, res) => {
		const word = pickRandomWord();
		chat_rooms.push({
			room_number: req.params.roomNumber,
			host: req.query.user_name,
			team: req.query.team,
			players: [],
		});

		console.log(chat_rooms);
		console.log('ik post');

		res.render('game', {
			game: true,
			team: req.body.team,
			room_number: req.params.roomNumber,
			subject: word,
			user_name: req.body.user_name || {},
		});
	})

	// .get('/:roomNumber', (req, res) => {
	// 	const room = checkRoom(req.query.room_nmbr);
	// 	console.log(room);
	// 	res.render('game', {
	// 		game: true,
	// 		room_number: req.params.roomNumber,
	// 		user_name: req.params.guest || {},
	// 	});
	// });

export default router;
