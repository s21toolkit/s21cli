import { command, number, option } from "cmd-ts"
import { getAuthorizedClient } from "@/auth"
import { fetchSelectedPeerReview } from "@/cli/commands/peer-review/fetchPeerReviews"
import { getPeerReviewDescriptor } from "@/platform/getPeerReviewDescriptor"

export const linkCommand = command({
	name: "link",
	description: "Displays SSH/HTTPS links for pending PR repository",
	args: {
		index: option({
			short: "i",
			long: "index",
			type: number,
			defaultValue: () => -1,
		}),
	},
	async handler(argv) {
		const client = getAuthorizedClient()

		const booking = await fetchSelectedPeerReview(client, argv.index)

		const descriptor = getPeerReviewDescriptor(booking)

		if (!descriptor) {
			throw new Error("Failed to create peer review descriptor")
		}

		console.log(`Pending booking detected: ${descriptor}`)

		const checklist = await client.api.createFilledChecklist({
			studentAnswerId: booking.student.getEnrichedBooking.answerId!,
		})

		const { sshLink, httpsLink } =
			checklist.student.createFilledChecklist.gitlabStudentProjectUrl

		console.log(`Repo SSH link: ${sshLink}`)
		console.log(`Repo HTTPS link: ${httpsLink}`)
	},
})
