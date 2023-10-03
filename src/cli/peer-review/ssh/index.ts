import { Client } from "@/client"
import { loadCredentials } from "@/config"
import { command } from "cmd-ts"

export const sshCommand = command({
	name: "ssh",
	args: {},
	async handler() {
		const credentials = await loadCredentials()
		const client = new Client(credentials.S21_USERNAME, credentials.S21_PASSWORD)

		const link = client.getPeerReviewSSHLink()

		console.log(`SSH link: "${link}"`)

		client.destroy()
	},
})
