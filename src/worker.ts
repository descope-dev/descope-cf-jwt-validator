import * as cookie from "cookie";
import * as jose from "jose";

/* istanbul ignore next */
export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		return handleRequest(request, env);
	},
};

export const handleRequest = async (request: Request, env: Env) => {
	const JWKS = jose.createRemoteJWKSet(
		new URL(`${env.DESCOPE_BASE_URL}/v2/keys/${env.DESCOPE_PROJECT_ID}`),
		{ cacheMaxAge: 600 },
	);
	const headers = request.headers;
	const authHeader = headers.get("authorization");
	let jwt = "";

	// prefer authorization token over cookie
	if (authHeader?.includes(" ")) {
		jwt = authHeader.split(" ")[1];
	} else {
		jwt = authHeader || "";
	}

	// if we didn't find a token in the Authorization header, check the DS cookie
	if (jwt === "") {
		const cookies = cookie.parse(request.headers.get("Cookie") || "");
		if (cookies[env.DESCOPE_SESSION_COOKIE] != null) {
			jwt = cookies[env.DESCOPE_SESSION_COOKIE];
		}
	}
	// if we still don't have a token, return 401
	if (jwt === "") {
		return new Response("Missing authorization header or DS cookie", { status: 401 });
	}

	try {
		await jose.jwtVerify(jwt, JWKS);
	} catch (e) {
		return new Response("Invalid authorization token", { status: 401 });
	}
	return fetch(request);
};
