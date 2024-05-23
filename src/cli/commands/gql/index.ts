import { getAuthorizedClient } from "@/auth"
import { json } from "@/cli/arguments/json"
import { S21_GQL_API_URL, getAuthHeaders } from "@s21toolkit/client"
import { command, option, positional } from "cmd-ts"

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

		const response = await fetch(S21_GQL_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...(await getAuthHeaders(client.auth)),
			},
			body: JSON.stringify({
				query,
				variables,
			}),
		})

		if (!response.ok) {
			console.error(
				`HTTP Error: [${response.status}] ${response.statusText}`,
			)
		}

		try {
			const data = await response.json()

			console.log(JSON.stringify(data, undefined, 2))
		} catch {
			console.log(await response.text())
		}
	},
})
