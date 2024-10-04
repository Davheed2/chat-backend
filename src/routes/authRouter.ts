import { signUp, signIn, verifyEmail } from '@/controllers/auth';
import authMiddleware from '@/middlewares/auth';
import express from 'express';

const router = express.Router();

router.post('/sign-up', signUp);
router.post('/sign-in', signIn);
router.post('/verify-email', authMiddleware, verifyEmail);

export { router as authRouter };
