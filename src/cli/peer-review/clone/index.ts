import { Client } from "@/client"
import { loadMergedConfig } from "@/config"
import { command } from "cmd-ts"
import path from "node:path"

export const cloneCommand = command({
	name: "clone",
	args: {},
	async handler() {
		const config = await loadMergedConfig()

		const client = new Client(config.username, config.password)

		const link = client.getPeerReviewSSHLink()

		if (!link) {
			console.error("Review not found")

			return
		} else {
			console.log(`Pending peer review detected ${link}`)
		}

		const prDirectory = config.pr_directory

		const directory = path.join(prDirectory, crypto.randomUUID())

		let gitProc = Bun.spawnSync({
			cmd: ["git", "clone", link, directory],
		})

		console.log(gitProc.stderr.toString())

		console.log(`Cloned to ${directory}`)

		gitProc = Bun.spawnSync({
			cmd: ["git", "checkout", "-b", "develop"],
			cwd: directory
		})

		console.log(gitProc.stderr.toString())

		console.log(`Checkouted to develop`)

		client.destroy()
	},
})
