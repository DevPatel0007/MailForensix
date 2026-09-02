import UserService from "@repo/services/user/index";

type GmailUserService = UserService & {
	getGoogleAccountForUser(userId: string): Promise<any>;
	getGmailCredentials(userId: string): Promise<any>;
	saveGmailCredentials(userId: string, credentials: any): Promise<void>;
	disconnectGmail(userId: string): Promise<void>;
};

export const userService = new UserService() as GmailUserService;
