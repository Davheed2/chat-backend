import { catchAsync } from '@/middlewares';
import { UserModel } from '@/models';
import { AppResponse } from '@/common/utils';
// import { Provider } from '@/common/constants';
// import { validateEmail, validatePassword, validatePhoneNumber, validateUsername, validateName } from '@/common/utils';

export const getUsers = catchAsync(async (req, res) => {
	const users = await UserModel.find();
	console.log(req);

	return AppResponse(res, 200, users, 'Data retrieved successfully');
});
