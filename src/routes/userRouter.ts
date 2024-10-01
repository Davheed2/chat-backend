import { getUsers } from '@/controllers';
import authMiddleware from '@/middlewares/auth';
import express from 'express';

const router = express.Router();

router.get('/', getUsers);
router.get('/protect', authMiddleware, getUsers);

export { router as userRouter };
