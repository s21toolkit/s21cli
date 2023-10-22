import { Client, DefaultAuthProvider } from "@s21toolkit/client"
import { Configuration } from "@/configuration"

export function getDefaultClient() {
	const { username, password } = Configuration.static

	const auth = new DefaultAuthProvider(username, password)

	const client = new Client(auth)

	return client
}
