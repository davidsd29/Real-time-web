import express from 'express';
const router = express.Router();


router.post('/:roomNumber', (req, res) => {

    res.render('game', {
        layout: 'gameRoom',
        room_number: req.params.roomNumber,
        subject: req.body.drawing,
        user_name: req.body.user_name || {},
    });
})
  

export default router;