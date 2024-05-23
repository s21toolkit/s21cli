import { getAuthorizedClient } from "@/auth"
import { json } from "@/cli/arguments/json"
import { command, option, positional } from "cmd-ts"

export const apiCommand = command({
	name: "api",
	description: "Performs specified API operation, returns raw JSON data",
	args: {
		operation: positional({
			displayName: "operation",
		}),
		variables: option({
			short: "v",
			long: "variables",
			type: json,
			defaultValue: () => ({}),
		}),
	},
	async handler(argv) {
		const { operation, variables } = argv

		const client = getAuthorizedClient()

		if (!(operation in client.api) || operation === "client") {
			throw new Error("Unsupported API operation")
		}

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const data = await client.api[operation](variables)

		console.log(JSON.stringify(data, undefined, 2))
	},
})
