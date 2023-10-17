import { Environment } from "@/environment"
import { Client, DefaultAuthProvider } from "@s21toolkit/client"

export function getDefaultClient() {
	const auth = new DefaultAuthProvider(
		Environment.USERNAME,
		Environment.PASSWORD,
	)

	const client = new Client(auth)

	return client
}
