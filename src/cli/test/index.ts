import { Client, DefaultAuthProvider } from "@s21toolkit/client"
import { command, option, string } from "cmd-ts"

export const testCommand = command({
	name: "test",
	args: {
		username: option({
			short: "u",
			long: "username",
			type: string,
		}),
		password: option({
			short: "p",
			long: "password",
			type: string,
		}),
	},
	async handler(argv) {
		const { username, password } = argv

		const auth = new DefaultAuthProvider(username, password)

		const client = new Client(auth)

		try {
			const data = await client.api.getCurrentUser()

			console.log("Ok:", data.student.getExperience.coinsCount)
		} catch (error) {
			if (!(error instanceof Error)) {
				console.error("Unknown error")

				return
			}

			if (error.cause instanceof Response) {
				console.error("Request error:", error.cause.statusText)
				console.error("Headers:", error.cause.headers)
				console.error("Body:", await error.cause.text())

				return
			}

			console.error("Error:", error)
		}
	},
})
