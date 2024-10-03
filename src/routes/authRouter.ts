import { signUp, signIn } from '@/controllers/auth';
import express from 'express';

const router = express.Router();

router.post('/sign-up', signUp);
router.post('/sign-in', signIn);

export { router as authRouter };