export const errorHandlingConfig = {
	enabled: true,
	redirectPath: '/dashboard',
	redirectDelayMs: 15000,
	showPopup: true,
	title: 'Something went wrong',
	message: 'A critical error occurred. You will be redirected shortly.',
	reportUrl: '/api/bug-report',
	includeUrl: true,
	includeUserAgent: true,
};
