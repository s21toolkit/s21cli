import { command, option, string } from "cmd-ts"
import { join } from "node:path"
import { Configuration } from "@/configuration"
import { fetchPendingPeerReview } from "@/platform/fetchPendingPeerReview"
import { getPeerReviewDescriptor } from "@/platform/getPeerReviewDescriptor"

function getPrDirectory(descriptor: string) {
	const basePath = Configuration.required.prDirectory

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

		const descriptor = getPeerReviewDescriptor(review.enrichedBooking)

		if (!descriptor) {
			throw new Error("Failed to create peer review descriptor")
		}

		const { checklist } = review

		console.log(`Pending booking detected: ${descriptor}`)

		const { sshLink, httpsLink } =
			checklist.student.createFilledChecklist.gitlabStudentProjectUrl

		console.log(`Repo SSH link: ${sshLink}`)
		console.log(`Repo HTTPS link: ${httpsLink}`)

		const directoryName = getPrDirectory(descriptor)

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
