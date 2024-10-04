import { catchAsync } from '@/middlewares';
import { UserModel } from '@/models';
import { AppError, AppResponse, convertToRecord, setCache, toJSON } from '@/common/utils';
import { Provider } from '@/common/constants';
import { trim } from '@/common/utils';

export const signIn = catchAsync(async (req, res) => {
	let { username, password } = req.body;

	if (!username || !password) {
		throw new AppError('Incomplete signup data', 400);
	}

	username = username ? trim(username) : null;
	password = trim(password);

	if (!username) {
		throw new AppError('Email or username is required to sign in', 400);
	}

	if (!password) {
		throw new AppError('Password field is required', 400);
	}

	const user = await UserModel.findOne({
		$or: [{ email: username }, { username }],
		isDeleted: false,
		providers: Provider.Local,
	}).select('loginRetries isSuspended isEmailVerified lastLogin password updatedAt');

	if (!user) {
		throw new AppError('User not found', 404);
	}

	const lastUpdated = user.updatedAt.getTime() - Date.now();

	// If the user activity was 12 hours ago or more, reset the loginRetries to zero
	if (user.loginRetries > 0 && lastUpdated >= 12 * 60 * 60 * 1000) {
		user.loginRetries = 0;
	}

	if (user.loginRetries >= 6) {
		throw new AppError('login retries exceeded', 401);
	}

	const isPasswordValid = await user.verifyPassword(password);
	if (!isPasswordValid) {
		user.loginRetries = (user.loginRetries ?? 0) + 1;
		await user.save();
		throw new AppError('Invalid password', 401);
	}

	if (!user.isEmailVerified) {
		throw new AppError('Your email is yet to be verified', 401);
	}

	if (user.isSuspended) {
		throw new AppError('Your account is currently suspended', 401);
	}

	user.generateAuthToken(res);
	user.generateRefreshToken(res);

	user.lastLogin = new Date();
	user.save();

	await setCache(user.id, toJSON(convertToRecord(user)));
	return AppResponse(res, 200, user, 'Signed in successfully');
});
