import type { Api } from "@s21toolkit/client"
import { command, option, string } from "cmd-ts"
import { join } from "node:path"
import { Configuration } from "@/configuration"
import { fetchPendingPeerReview } from "@/platform/fetchPendingPeerReview"
import { getPeerReviewDescriptor } from "@/platform/getPeerReviewDescriptor"

function getPrDirectory(enrichedBooking: Api.GetAgendaP2P.Data) {
	const basePath = Configuration.required.prDirectory

	const descriptor = getPeerReviewDescriptor(enrichedBooking)

	if (!descriptor) {
		throw new Error("Failed to create peer review descriptor")
	}

	const uuid = crypto.randomUUID()

	return join(basePath, `${descriptor} [${uuid}]`)
}

export const cloneCommand = command({
	name: "clone",
	description:
		"Clones pending PR repository into new directory (configuration: prDirectory)",
	args: {
		branch: option({
			short: "b",
			long: "branch",
			type: string,
			defaultValue: () => "develop",
		}),
	},
	async handler(argv) {
		const review = await fetchPendingPeerReview()

		const { checklist } = review

		console.log(
			`Pending booking detected: ${checklist.student.createFilledChecklist.moduleInfoP2P.moduleName}`,
		)

		const { sshLink, httpsLink } =
			checklist.student.createFilledChecklist.gitlabStudentProjectUrl

		console.log(`Repo SSH link: ${sshLink}`)
		console.log(`Repo HTTPS link: ${httpsLink}`)

		const directoryName = getPrDirectory(review.enrichedBooking)

		const gitHandle = Bun.spawnSync({
			cmd: [
				"git",
				"clone",
				"--branch",
				argv.branch,
				"--recurse-submodules",
				sshLink,
				directoryName,
			],
			stdout: "inherit",
			stderr: "inherit",
			stdin: "inherit",
		})

		if (gitHandle.exitCode !== 0) {
			console.error("Failed to clone project repo")
		}
	},
})
