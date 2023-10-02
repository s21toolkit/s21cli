import { Client } from "@/client"
import { Environment } from "@/environment"
import { command } from "cmd-ts"
import path from "node:path"

export const cloneCommand = command({
	name: "clone",
	args: {},
	handler() {
		const client = new Client(Environment.USERNAME, Environment.PASSWORD)

		const link = client.getPeerReviewSSHLink()

		if (!link) {
			console.error("Review not found")

			return
		} else {
			console.log(`Pending peer review detected ${link}`)
		}

		const prDirectory = Environment.PR_DIRECTORY

		const directory = path.join(prDirectory, crypto.randomUUID())

		const gitProc = Bun.spawnSync({
			cmd: ["git", "clone", link, directory],
		})

		console.log(gitProc.stderr.toString())

		console.log(`Cloned to ${directory}`)

		client.destroy()
	},
})
