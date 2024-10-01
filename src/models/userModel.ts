import jwt from 'jsonwebtoken';
import type { IUser, UserMethods } from '@/common/interfaces';
import bcrypt from 'bcryptjs';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { hashPassword } from '@/common/utils';
import { Role } from '@/common/constants';
import { Response } from 'express';
import { ENVIRONMENT } from '@/common/config';
import { parseTokenDuration } from '@/common/utils';

type UserModel = Model<IUser, unknown, UserMethods>;

const userSchema = new mongoose.Schema<IUser, unknown, UserMethods>(
	{
		firstName: {
			type: String,
			min: [2, 'First name must be at least 2 characters long'],
			max: [50, 'First name must not be more than 50 characters long'],
			required: [true, 'First name is required'],
		},
		lastName: {
			type: String,
			min: [2, 'Last name must be at least 2 characters long'],
			max: [50, 'Last name must not be more than 50 characters long'],
			required: [true, 'Last name is required'],
		},
		username: {
			type: String,
			required: [true, 'Username is required'],
			unique: true,
		},
		phoneNumber: {
			type: String,
			unique: true,
			min: [10, 'Phone number must be at least 10 characters long'],
			required: [true, 'Phone number is required'],
			select: false,
		},
		email: {
			type: String,
			required: [true, 'Email field is required'],
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			min: [8, 'Password must be at least 8 characters long'],
			required: [true, 'Password field is required'],
			select: false,
		},
		role: {
			type: String,
			enum: Object.values(Role),
			default: Role.User,
			select: false,
		},
		// photo: {
		// 	type: String,
		// },
		providers: {
			type: [String],
			select: false,
		},
		passwordResetToken: {
			type: String,
			select: false,
		},
		passwordResetExpires: {
			type: Date,
			select: false,
		},
		passwordChangedAt: {
			type: Date,
			select: false,
		},
		ipAddress: {
			type: String,
			select: false,
		},
		loginRetries: {
			type: Number,
			default: 0,
			select: false,
		},
		isDeleted: {
			type: Boolean,
			default: false,
			select: false,
		},
		isSuspended: {
			type: Boolean,
			default: false,
			select: false,
		},
		isEmailVerified: {
			type: Boolean,
			default: false,
			select: false,
		},
		lastLogin: {
			type: Date,
			select: false,
		},
	},
	{
		timestamps: true,
	}
);

/**
 * hash password before saving to the database only if the password is modified
 */
userSchema.pre('save', async function (next) {
	if (this.isModified('password')) {
		this.password = await hashPassword(this.password as string);
	}

	next();
});

userSchema.pre(/^find/, function (this: Model<IUser>, next) {
	this.find({ isDeleted: { $ne: true }, isSuspended: { $ne: true } });
	next();
});

/**
 * Verify user password method
 * @param {HydratedDocument<IUser>} this - The hydrated document.
 * @param {string} enteredPassword - The entered password.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the password is valid.
 */
userSchema.method('verifyPassword', async function (this: HydratedDocument<IUser>, enteredPassword: string) {
	if (!this.password) {
		return false;
	}

	return await bcrypt.compare(enteredPassword, this.password);
});

userSchema.method('toJSON', function (this: HydratedDocument<IUser>) {
	const userObject = this.toObject() as Partial<IUser>;
	delete userObject.password;
	return userObject;
});

export const setTokenCookie = (res: Response, tokenName: string, token: string, maxAge: number): void => {
	res.cookie(tokenName, token, {
		httpOnly: true,
		secure: ENVIRONMENT.APP.ENV === 'production',
		maxAge,
		sameSite: 'none',
	});
};

userSchema.method('generateAuthToken', function (this: HydratedDocument<IUser>, res: Response): string {
	const payload = { _id: this._id };
	const authToken = jwt.sign(payload, ENVIRONMENT.JWT.ACCESS_KEY as string, {
		expiresIn: ENVIRONMENT.JWT_EXPIRES_IN.ACCESS,
	});

	setTokenCookie(res, 'authToken', authToken, parseTokenDuration(ENVIRONMENT.JWT_EXPIRES_IN.ACCESS)); // 15 minutes

	return authToken;
});

userSchema.method('generateRefreshToken', function (this: HydratedDocument<IUser>, res: Response): string {
	const refreshPayload = { _id: this._id };

	const refreshToken = jwt.sign(refreshPayload, ENVIRONMENT.JWT.REFRESH_KEY as string, {
		expiresIn: ENVIRONMENT.JWT_EXPIRES_IN.REFRESH,
	});

	setTokenCookie(
		res,
		'refreshToken',
		refreshToken,
		parseTokenDuration(ENVIRONMENT.JWT_EXPIRES_IN.REFRESH) // 7 days default in seconds
	);

	return refreshToken;
});

export const UserModel = mongoose.model<IUser, UserModel>('User', userSchema);
