import { Client } from "@/client"
import { loadMergedConfig } from "@/config"
import { command } from "cmd-ts"
import path from "node:path"

export const cloneCommand = command({
	name: "clone",
	args: {},
	handler() {
		const config = loadMergedConfig()

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
			cmd: [
				"git",
				"clone",
				"-b", "develop",
				...(config.clone_depth != 0 ? ["--depth", config.clone_depth.toString()] : []),
				link,
				directory
			],
		})

		console.log(gitProc.stderr.toString())

		console.log(`Cloned to ${directory} on branch develop`)

		client.destroy()
	},
})
