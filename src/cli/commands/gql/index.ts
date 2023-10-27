import { createGqlQueryRequest } from "@s21toolkit/client"
import { command, option, positional } from "cmd-ts"
import { getAuthorizedClient } from "@/auth"
import { json } from "@/cli/arguments/json"

export const gqlCommand = command({
	name: "gql",
	description: "Performs arbitrary GQL query, returns raw JSON data",
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
	async handler(argv) {
		const { query, variables } = argv

		const client = getAuthorizedClient()

		const request = createGqlQueryRequest(
			query,
			variables as Record<string, unknown>,
		)

		const data = await client.request(request)

		console.log(JSON.stringify(data, undefined, 2))
	},
})
