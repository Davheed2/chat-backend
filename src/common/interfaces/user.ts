import { Provider, Role } from '../constants';
import { Response } from 'express';

export interface IUser {
	_id: string;
	firstName: string;
	lastName: string;
	username: string;
	email: string;
	phoneNumber: string;
	password: string;
	photo: string;
	role: Role;
	providers: Provider[];
	passwordResetToken: string;
	passwordResetExpires: Date;
	passwordChangedAt: Date;
	ipAddress: string;
	loginRetries: number;
	emailVerificationToken: string;
	isSuspended: boolean;
	isEmailVerified: boolean;
	isDeleted: boolean;
	lastLogin: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface UserMethods {
	verifyPassword(enteredPassword: string): Promise<boolean>;
	generateAuthToken: (res: Response) => string;
	generateRefreshToken: (res: Response) => string;
}
