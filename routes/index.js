import express from 'express';

const router = express.Router();

import { home } from "../controllers/index.js";

router.use('/', home);

export default router;