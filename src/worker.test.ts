import Descope, { JWTResponse } from "@descope/node-sdk";
import { handleRequest } from "./worker";

const env = {
	DESCOPE_BASE_URL: "https://api.descope.com",
	DESCOPE_SESSION_COOKIE: "DS",
	DESCOPE_PROJECT_ID: process.env.DESCOPE_PROJECT_ID ?? "",
};

describe("handleRequest", () => {
	let token: JWTResponse;
	const testLoginId = "test@user.internal";
	const descope = Descope({
		projectId: env.DESCOPE_PROJECT_ID,
		managementKey: process.env.DESCOPE_MANAGEMENT_KEY ?? "",
	});

	beforeAll(async () => {
		const { ok: testUserOK, data: testUserData } =
			await descope.management.user.createTestUser(testLoginId);
		if (!testUserOK) {
			throw new Error(`Failed to create test user: ${testUserData}`);
		}
		const { ok: OTPOK, data: OTPData } = await descope.management.user.generateOTPForTestUser(
			"email",
			testLoginId,
		);
		if (!OTPOK || !OTPData?.code) {
			throw new Error(`Failed to generate OTP for test user`);
		}
		console.log("OTPData", OTPData);
		const { ok, data } = await descope.otp.verify.email(OTPData.loginId, OTPData.code);
		if (!ok || !data) {
			throw new Error(`Failed to verify OTP for test user` + JSON.stringify({ ok, data }));
		}
		token = data;
	});

	const testUrl = "http://httpbin.org/get";
	it("fails without any auth", async () => {
		const response = await handleRequest(new Request(testUrl), env);
		expect(response.status).toBe(401);
		expect(await response.text()).toBe("Missing authorization header or DS cookie");
	});

	it("fails with invalid auth header", async () => {
		const response = await handleRequest(
			new Request(testUrl, { headers: new Headers({ authorization: "Bearer ASD" }) }),
			env,
		);
		expect(response.status).toBe(401);
	});

	it("works with valid auth header", async () => {
		const headers = new Headers();
		headers.set("authorization", `Bearer ${token.sessionJwt}`);

		const response = await handleRequest(
			new Request(testUrl, {
				headers,
			}),
			env,
		);
		expect(response.status).toBe(200);
	});

	it("works with valid cookie header", async () => {
		const headers = new Headers();
		headers.set("Cookie", `${env.DESCOPE_SESSION_COOKIE}=${token.sessionJwt}`);

		const response = await handleRequest(
			new Request(testUrl, {
				headers,
			}),
			env,
		);
		expect(response.status).toBe(200);
	});

	afterAll(() => {
		descope.management.user.delete(testLoginId);
	});
});
