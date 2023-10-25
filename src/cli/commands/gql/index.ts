import { createGqlQueryRequest } from "@s21toolkit/client"
import { command, option, positional } from "cmd-ts"
import { json } from "@/cli/arguments/json"
import { commandHandler } from "@/cli/utils/commandHandler"
import { getDefaultClient } from "@/tools/getDefaultClient"

export const gqlCommand = command({
	name: "gql",
	args: {
		query: positional({
			displayName: "query",
		}),
		variables: option({
			short: "v",
			long: "variables",
			type: json,
			defaultValue: () => ({}),
		}),
	},
	handler: (argv) =>
		commandHandler(async () => {
			const { query, variables } = argv

			const client = getDefaultClient()

			const request = createGqlQueryRequest(
				query,
				variables as Record<string, unknown>,
			)

			const data = await client.request(request)

			console.log(JSON.stringify(data, undefined, 2))
		}),
})
