import express from 'express';
import { chat_rooms } from '../data/chatroom.js';
import pickRandomWord from '../controllers/generateWord.js';
const router = express.Router();

router
	.get('/guest/room', (req, res) => {
		console.log('guest room');
		console.log(req.query);
		res.render('game', {
			game: true,
			host: false,
			room_number: req.query.number,
			subject: 'Can you guess what I am drawing?',
			user_name: req.query.username || {},
		});
	})

	.get('/room', (req, res) => {
		const word = pickRandomWord();
		chat_rooms.push({
			room_number: req.query.number,
			host: req.query.username,
			team: req.query.team,
			players: [],
		});

		res.render('game', {
			game: true,
			host: true,
			team: req.query.team,
			room_number: req.query.number,
			subject: word,
			user_name: req.query.username || {},
		});
	})

export default router;
