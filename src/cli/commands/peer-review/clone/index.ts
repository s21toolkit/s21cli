import { command, number, option, string } from "cmd-ts"
import { join } from "node:path"
import { Configuration } from "@/configuration"
import type { PendingPeerReview } from "@/platform/fetchPendingPeerReviews"
import { fetchPendingPeerReviews } from "@/platform/fetchPendingPeerReviews"
import { getPeerReviewDescriptor } from "@/platform/getPeerReviewDescriptor"

function getPrDirectory(descriptor: string) {
	const basePath = Configuration.required.prDirectory

	const uuid = crypto.randomUUID()

	return join(basePath, `${descriptor}-${uuid}`)
}

function resolvePeerReview(reviews: PendingPeerReview[], index: number) {
	if (reviews.length === 1) {
		return reviews[0]!
	}

	if (index >= 0 && index < reviews.length) {
		return reviews[index]!
	}

	return undefined
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
		index: option({
			short: "i",
			long: "index",
			type: number,
			defaultValue: () => -1,
		}),
	},
	async handler(argv) {
		const reviews = await fetchPendingPeerReviews()

		// FIXME: Refactor this, reduce duplication with pr/link
		const review = resolvePeerReview(reviews, argv.index)

		if (!review) {
			console.log(
				`Multiple pending bookings detected, use "-i" option to select:`,
			)

			// eslint-disable-next-line unicorn/no-for-loop
			for (let i = 0; i < reviews.length; i++) {
				console.log(
					`${i}. ${getPeerReviewDescriptor(reviews[i]!.enrichedBooking)}`,
				)
			}

			throw new Error("Multiple bookings found")
		}

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
