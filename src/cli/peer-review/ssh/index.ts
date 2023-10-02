import { Client } from "@/client"
import { Environment } from "@/environment"
import { command } from "cmd-ts"

export const sshCommand = command({
	name: "ssh",
	args: {},
	handler() {
		const client = new Client(Environment.USERNAME, Environment.PASSWORD)

		const link = client.getPeerReviewSSHLink()

		console.log(`SSH link: "${link}"`)

		client.destroy()
	},
})
