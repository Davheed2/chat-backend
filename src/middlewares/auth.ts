import { Request, Response, NextFunction } from 'express';
import { ENVIRONMENT } from '@/common/config';
import { authenticate, parseTokenDuration } from '@/common/utils';
import { setTokenCookie } from '@/models';

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const accessToken = req.cookies?.authToken || req.headers['authorization']?.split(' ')[1];
		const refreshToken = req.cookies?.refreshToken || req.headers['x-refresh-token'];

		const { currentUser, accessToken: newAccessToken } = await authenticate({
			accessToken,
			refreshToken,
		});

		req.user = currentUser;

		if (newAccessToken) {
			setTokenCookie(res, 'authToken', newAccessToken, parseTokenDuration(ENVIRONMENT.JWT_EXPIRES_IN.ACCESS));
		}

		next();
	} catch (error) {
		next(error);
	}
};

export default authMiddleware;
