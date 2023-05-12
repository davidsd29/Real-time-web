import express from 'express';
import { chat_rooms } from '../data/chatroom.js';
import pickRandomWord from '../controllers/generateWord.js';
const router = express.Router();

router
	.get('/guest', (req, res) => {
		res.render('game', {
			game: true,
			host: false,
			room_number: req.query.room_nmbr,
			subject: 'Can you guess what I am drawing?',
			user_name: req.query.guest || {},
		});
	})

	.get('/:roomNumber', (req, res) => {
		const word = pickRandomWord();
		chat_rooms.push({
			room_number: req.params.roomNumber,
			host: req.query.user_name,
			team: req.query.team,
			players: [],
		});

		res.render('game', {
			game: true,
			host: true,
			team: req.query.team,
			room_number: req.params.roomNumber,
			subject: word,
			user_name: req.query.user_name || {},
		});
	})

export default router;
