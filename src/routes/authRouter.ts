import { signUp } from '@/controllers/auth';
import express from 'express';

const router = express.Router();

router.post('/sign-up', signUp);

export { router as authRouter };