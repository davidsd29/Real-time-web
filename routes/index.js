import express from 'express';

const router = express.Router();

import { home } from "../controllers/index.js";

router.get('/', home);


export default router;