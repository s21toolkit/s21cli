import { Config } from "@/config"
import { getPendingPeerReview } from "@/tools/getPendingPeerReview"
import { command } from "cmd-ts"
import { join } from "node:path"

export const cloneCommand = command({
	name: "clone",
	args: {},
	async handler() {
		const review = await getPendingPeerReview().catch((error) => {
			if (error instanceof Error) {
				console.error(error.message)
			} else {
				console.error("Unknown error")
			}
		})

		if (!review) {
			return
		}

		const { checklist } = review

		console.log(
			`Pending booking detected: ${checklist.student.createFilledChecklist.moduleInfoP2P.moduleName}`,
		)

		const { sshLink, httpsLink } =
			checklist.student.createFilledChecklist.gitlabStudentProjectUrl

		console.log(`Repo SSH link: ${sshLink}`)
		console.log(`Repo HTTPS link: ${httpsLink}`)

		const directoryName = join(Config.pr_directory, crypto.randomUUID())

		const gitHandle = Bun.spawnSync({
			cmd: [
				"git", "clone", "-b", "-develop", "--recurse-submodules",
				...(Config.clone_depth != 0 ? ["--depth", Config.clone_depth.toString()] : []),
				sshLink, directoryName
			],
			stdout: "inherit",
		})

		if (gitHandle.exitCode != 0) {
			console.error("Failed to clone project repo")
		}
	},
})
