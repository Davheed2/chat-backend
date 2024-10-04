import bcrypt from 'bcryptjs';
import { randomBytes, randomInt } from 'crypto';
import { encode } from 'hi-base32';
import { redisClient } from '../config';
import { startEmailQueue } from '@/queues/emailQueue';
import { IUser, WelcomeEmailData } from '../interfaces';

const generateRandomString = () => {
	return randomBytes(32).toString('hex');
};

const hashPassword = async (password: string) => {
	return await bcrypt.hash(password, 12);
};

const comparePassword = async (password: string, hashedPassword: string) => {
	return await bcrypt.compare(password, hashedPassword);
};

const generateRandomBase32 = () => {
	const buffer = randomBytes(15);
	return encode(buffer).replace(/=/g, '').substring(0, 24);
};

const generateRandom6DigitKey = () => {
	let randomNum = randomInt(0, 999999);

	// Ensure the number is within the valid range (000000 to 999999)
	while (randomNum < 100000) {
		randomNum = randomInt(0, 999999);
	}
	// Convert the random number to a string and pad it with leading zeros if necessary
	return randomNum.toString().padStart(6, '0');
};

const dateFromString = async (value: string) => {
	const date = new Date(value);

	if (isNaN(date?.getTime())) {
		return false;
	}

	return date;
};

const parseTokenDuration = (duration: string): number => {
	const match = duration.match(/(\d+)([smhd])/);
	if (!match) return 0;

	const value = parseInt(match[1]);
	const unit = match[2];

	switch (unit) {
		case 's':
			return value * 1000;
		case 'm':
			return value * 60 * 1000;
		case 'h':
			return value * 60 * 60 * 1000;
		case 'd':
			return value * 24 * 60 * 60 * 1000;
		default:
			return 0;
	}
};

const setCache = async (key: string, value: string, expiryInSeconds: number = 3600): Promise<void> => {
	try {
		await redisClient.set(key, value, 'EX', expiryInSeconds); // EX sets the expiration in seconds
		console.log(`Cache set for key: ${key}`);
	} catch (error) {
		console.error(`Error setting cache for key: ${key}`, error);
	}
};

const getCache = async (key: string): Promise<string | null> => {
	try {
		const data = await redisClient.get(key);
		if (data) {
			console.log(`Cache hit for key: ${key}`);
		} else {
			console.log(`Cache miss for key: ${key}`);
		}
		return data;
	} catch (error) {
		console.error(`Error fetching cache for key: ${key}`, error);
		return null;
	}
};

const deleteCache = async (key: string): Promise<void> => {
	try {
		await redisClient.del(key);
		console.log(`Cache deleted for key: ${key}`);
	} catch (error) {
		console.error(`Error deleting cache for key: ${key}`, error);
	}
};

const toJSON = <T extends Record<string, unknown>>(obj: T, excludeFields: string[] = []): string => {
	const sanitizedObj: Partial<T> = { ...obj };
	excludeFields.forEach((field) => delete sanitizedObj[field]);
	return JSON.stringify(sanitizedObj);
};

const convertToRecord = (obj: unknown): Record<string, unknown> => {
	return obj as Record<string, unknown>;
};

const sendVerificationEmail = async (user: IUser, otp: string): Promise<void> => {
	const { addEmailToQueue } = await startEmailQueue();

	const emailData: WelcomeEmailData = {
		to: user.email,
		priority: 'high',
		name: user.firstName,
		otp,
	};

	addEmailToQueue({
		type: 'welcomeEmail',
		data: emailData,
	});
};

export {
	dateFromString,
	generateRandom6DigitKey,
	generateRandomBase32,
	generateRandomString,
	hashPassword,
	comparePassword,
	parseTokenDuration,
	setCache,
	getCache,
	deleteCache,
	toJSON,
	convertToRecord,
	sendVerificationEmail
};
