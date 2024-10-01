import { catchAsync } from '@/middlewares';
import { UserModel } from '@/models';
import { AppError, AppResponse, hashPassword } from '@/common/utils';
import { Provider } from '@/common/constants';
import { validateEmail, validatePassword, validatePhoneNumber, validateUsername, validateName } from '@/common/utils';

export const signUp = catchAsync(async (req, res) => {
	let { firstName, lastName, username, email, password, phoneNumber } = req.body;

	if (!firstName || !lastName || !email || !username || !phoneNumber || !password) {
		throw new AppError('Incomplete signup data', 400);
	}

	firstName = validateName(firstName);
	lastName = validateName(lastName);
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
			throw new AppError('User with this phone number already exists', 409);
		}
	}

	const hashedPassword = await hashPassword(password);

	const user = await UserModel.create({
		email,
		firstName,
		lastName,
		username,
		phoneNumber,
		password: hashedPassword,
		providers: Provider.Local,
		ipAddress: req.ip,
	});

	user.generateAuthToken(res);
	user.generateRefreshToken(res);

	return AppResponse(res, 201, user, 'Account created successfully');
});