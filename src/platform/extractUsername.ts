const USER_EMAIL_PATTERN = /(?<username>\w+)@student\.21-school\.ru/

export function extractUsername(login: string) {
	const match = login.match(USER_EMAIL_PATTERN)

	return match?.groups?.username ?? login
}
