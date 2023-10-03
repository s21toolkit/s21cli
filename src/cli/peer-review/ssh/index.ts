import { Client } from "@/client"
import { Config } from "@/config"
import { command } from "cmd-ts"

export const sshCommand = command({
	name: "ssh",
	args: {},
	handler() {
		const client = new Client(Config.username, Config.password)

		const link = client.getPeerReviewSSHLink()

		console.log(`SSH link: "${link}"`)

		client.destroy()
	},
})
