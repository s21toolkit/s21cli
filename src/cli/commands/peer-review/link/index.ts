import assert from "node:assert"
import { getPeerReviewDescriptor } from "@/adapters/getPeerReviewDescriptor"
import { getAuthorizedClient } from "@/auth"
import { fetchSelectedPeerReview } from "@/cli/commands/peer-review/fetchPeerReviews"
import { command, number, option, optional } from "cmd-ts"

export const linkCommand = command({
	name: "link",
	description: "Displays SSH/HTTPS links for pending PR repository",
	args: {
		index: option({
			short: "i",
			long: "index",
			type: optional(number),
			defaultValue: () => undefined,
		}),
	},
	async handler(argv) {
		const client = getAuthorizedClient()

		const booking = await fetchSelectedPeerReview(client, argv.index)

		console.log(
			`Pending booking detected: ${getPeerReviewDescriptor(booking)}`,
		)

		assert(
			booking.student?.getEnrichedBooking.answerId,
			"Answer ID not found",
		)

		const checklist = await client.api.getFilledChecklist({
			filledChecklistId: booking.student.getEnrichedBooking.answerId,
		})

		assert(
			checklist.student?.getP2pInfo.solutionInfo?.gitlabSolutionInfo
				?.gitlabLink,
			"Gitlab link not found",
		)

		const { sshLink, httpsLink } =
			checklist.student.getP2pInfo.solutionInfo.gitlabSolutionInfo.gitlabLink

		console.log(`Repo SSH link: ${sshLink}`)
		console.log(`Repo HTTPS link: ${httpsLink}`)
	},
})
