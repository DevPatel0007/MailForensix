import { AUTH_COOKIE_NAME, verifySessionToken } from "@repo/services/auth";
import UserService from "@repo/services/user";

type RequestLike = { headers?: { cookie?: string } };
type ResponseLike = { append: (field: string, value: string) => void };

function getCookie(request: RequestLike | undefined, name: string) {
	const cookie = request?.headers?.cookie;
	const entry = cookie?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
	return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}

const userService = new UserService();

export async function createContext({ req, res }: { req?: RequestLike; res?: ResponseLike } = {}) {
	const token = getCookie(req, AUTH_COOKIE_NAME);
	let user = null;
	if (token) {
		try {
			const userId = await verifySessionToken(token);
			user = userId ? await userService.findById(userId) : null;
		} catch {
			user = null;
		}
	}
	return { req, res, user };
}
export type Context = Awaited<ReturnType<typeof createContext>>;
