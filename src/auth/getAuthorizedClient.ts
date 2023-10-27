import { Client, DefaultAuthProvider } from "@s21toolkit/client"
import { TokenAuthProvider } from "@/auth/TokenAuthProvider"
import { Configuration } from "@/configuration"

export function getAuthorizedClient() {
	const { token, schoolId } = Configuration.optional

	if (token) {
		const auth = new TokenAuthProvider(token, schoolId)

		return new Client(auth)
	}

	const { username, password } = Configuration.required

	const auth = new DefaultAuthProvider(username, password)

	const client = new Client(auth)

	return client
}
