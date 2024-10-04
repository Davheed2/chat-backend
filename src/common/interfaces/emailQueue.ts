export interface CommonDataFields {
	to: string;
	priority: string;
}

export interface WelcomeEmailData extends CommonDataFields {
	name: string;
	otp: string;
}

export interface ResetPasswordData extends CommonDataFields {
	token: string;
	name: string;
}

export interface PasswordResetSuccessfulData extends CommonDataFields {
	name: string; // Example field for when the password reset is successful
}

export type EmailJobData =
	| { type: 'welcomeEmail'; data: WelcomeEmailData }
	| { type: 'resetPassword'; data: ResetPasswordData }
	| { type: 'passwordResetSuccessful'; data: PasswordResetSuccessfulData };
