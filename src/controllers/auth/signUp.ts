import { catchAsync } from '@/middlewares';
import { UserModel } from '@/models';
import { AppError, AppResponse, convertToRecord, hashPassword } from '@/common/utils';
import { Provider } from '@/common/constants';
import { validateEmail, validatePassword, validatePhoneNumber, validateUsername, trim } from '@/common/utils';
import { setCache, toJSON, sendVerificationEmail, generateRandom6DigitKey } from '@/common/utils';

export const signUp = catchAsync(async (req, res) => {
	let { firstName, lastName, username, email, password, phoneNumber } = req.body;

	if (!firstName || !lastName || !email || !username || !phoneNumber || !password) {
		throw new AppError('Incomplete signup data', 400);
	}

	firstName = trim(firstName);
	lastName = trim(lastName);
	email = validateEmail(email);
	phoneNumber = validatePhoneNumber(phoneNumber);
	username = validateUsername(username);
	password = validatePassword(password);

	const existingUser = await UserModel.findOne({ $or: [{ email }, { username }, { phoneNumber }] });
	if (existingUser) {
		if (existingUser.email === email) {
			throw new AppError('User with this email already exists', 409);
		} else if (existingUser.phoneNumber === phoneNumber) {
			throw new AppError('User with this phone number already exists', 409);
		} else if (existingUser.username === username) {
			throw new AppError('User with this username already exists', 409);
		}
	}

	const user = await UserModel.create({
		email,
		firstName,
		lastName,
		username,
		phoneNumber,
		password,
		providers: Provider.Local,
		ipAddress: req.ip,
	});

	user.generateAuthToken(res);
	user.generateRefreshToken(res);

	const otp = generateRandom6DigitKey();
	await sendVerificationEmail(user, otp);

	const hashedOtp = await hashPassword(otp);
	user.emailVerificationToken = hashedOtp;
	user.save();

	await setCache(user._id.toString(), toJSON(convertToRecord(user), ['password']));

	return AppResponse(res, 201, user, 'Account created successfully');
});
