import { Configuration } from "@/configuration"
import { fetchAccessToken, fetchContextHeaders } from "@s21toolkit/client"
import { command, flag } from "cmd-ts"

export const authCommand = command({
	name: "auth",
	description: "Performs user authentication, returns API token and school ID",
	args: {
		noContextHeaders: flag({
			long: "no-context-headers",
			short: "n",
			description: "Not request school ID",
			defaultValue: () => false,
		}),
	},
	async handler(argv) {
		const { noContextHeaders } = argv

		const { username, password } = Configuration.required

		const tokenResponse = await fetchAccessToken(username, password)

		console.log(`Token: ${tokenResponse.accessToken}`)

		if (noContextHeaders) {
			return
		}

		const contextHeaders = await fetchContextHeaders(
			tokenResponse.accessToken,
		)

		for (const [header, value] of Object.entries(contextHeaders)) {
			console.log(`${header}: ${value}`)
		}
	},
})
