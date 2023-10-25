import { command } from "cmd-ts"
import { join } from "node:path"
import { commandHandler } from "@/cli/utils/commandHandler"
import { Configuration } from "@/configuration"
import { getPendingPeerReview } from "@/tools/getPendingPeerReview"

export const cloneCommand = command({
	name: "clone",
	description:
		"Clones pending PR repository into new directory (configuration: prDirectory)",
	args: {},
	handler: () =>
		commandHandler(async () => {
			const review = await getPendingPeerReview()

			const { checklist } = review

			console.log(
				`Pending booking detected: ${checklist.student.createFilledChecklist.moduleInfoP2P.moduleName}`,
			)

			const { sshLink, httpsLink } =
				checklist.student.createFilledChecklist.gitlabStudentProjectUrl

			console.log(`Repo SSH link: ${sshLink}`)
			console.log(`Repo HTTPS link: ${httpsLink}`)

			const directoryName = join(
				Configuration.required.prDirectory,
				crypto.randomUUID(),
			)

			const gitHandle = Bun.spawnSync({
				cmd: [
					"git",
					"clone",
					"--recurse-submodules",
					sshLink,
					directoryName,
				],
				stdout: "inherit",
			})

			if (gitHandle.exitCode !== 0) {
				console.error("Failed to clone project repo")
			}
		}),
})
