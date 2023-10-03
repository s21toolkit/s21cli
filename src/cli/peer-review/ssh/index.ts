import { Client } from "@/client"
import { loadCredentials } from "@/config"
import { command } from "cmd-ts"

export const sshCommand = command({
	name: "ssh",
	args: {},
	handler() {
		const credentials = loadCredentials()
		const client = new Client(credentials.username, credentials.password)

		const link = client.getPeerReviewSSHLink()

		console.log(`SSH link: "${link}"`)

		client.destroy()
	},
})
