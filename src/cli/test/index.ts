import { command, flag, option, string } from "cmd-ts"
import { Client } from "@/client"
import { symbols } from "@/client/symbols"
import { CStringUtils } from "@/client/utils"

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
		uniqueClient: flag({
			short: "x",
			long: "unique-client",
			defaultValue: () => false,
		}),
	},
	handler(argv) {
		const { username, password, uniqueClient } = argv

		if (uniqueClient) {
			Client.use(new Client(username, password), (client) => {
				const result = client.testCredentials()

				console.log(`[X] Result: `, result)
			})
		} else {
			const result = Client.testCredentials(username, password)

			console.log(`Result: `, result)
		}
	},
})
