import { Client } from "@/client"
import { Config } from "@/config"
import { command } from "cmd-ts"
import path from "node:path"

export const cloneCommand = command({
	name: "clone",
	args: {},
	handler() {
		const client = new Client(Config.username, Config.password)

		const link = client.getPeerReviewSSHLink()

		if (!link) {
			console.error("Review not found")

			return
		} else {
			console.log(`Pending peer review detected ${link}`)
		}

		const prDirectory = Config.pr_directory

		const directory = path.join(prDirectory, crypto.randomUUID())

		let gitProc = Bun.spawnSync({
			cmd: [
				"git", "clone", "-b", "develop",
				...(Config.clone_depth != 0 ? ["--depth", Config.clone_depth.toString()] : []),
				link, directory
			],
		})

		console.log(gitProc.stderr.toString())

		console.log(`Cloned to ${directory} on branch develop`)

		client.destroy()
	},
})
