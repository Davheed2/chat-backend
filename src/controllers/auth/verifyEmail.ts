import { comparePassword, convertToRecord, setCache, toJSON } from '@/common/utils';
import AppError from '@/common/utils/appError';
import { AppResponse } from '@/common/utils/appResponse';
import { catchAsync } from '@/middlewares';
import { UserModel } from '@/models';
import { Request, Response } from 'express';

export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
	const { otp } = req.body;
	const { user } = req;

	if (!otp) {
		throw new AppError('OTP is required!', 400);
	}

	if (!user) {
		throw new AppError('User not found', 404);
	}

	const foundUser = await UserModel.findById(user._id).select('emailVerificationToken');
	if (!foundUser) {
		throw new AppError('User not found!', 404);
	}

	if (!foundUser.emailVerificationToken) {
		throw new AppError('No OTP found for this user', 400);
	}

	const isValidOTP = await comparePassword(otp, foundUser.emailVerificationToken);

	if (!isValidOTP) {
		throw new AppError('Invalid OTP', 400);
	}

	const updatedUser = await UserModel.findByIdAndUpdate(
		foundUser._id,
		{ isEmailVerified: true, emailVerificationToken: null },
		{ new: true }
	);

	if (!updatedUser) {
		throw new AppError('Verification failed!', 400);
	}

	await setCache(updatedUser._id.toString(), toJSON(convertToRecord(updatedUser), ['password']));

	AppResponse(res, 200, {}, 'Account successfully verified!');
});
