import { command, number, option, optional } from "cmd-ts"
import { getPeerReviewDescriptor } from "@/adapters/getPeerReviewDescriptor"
import { getAuthorizedClient } from "@/auth"
import { fetchSelectedPeerReview } from "@/cli/commands/peer-review/fetchPeerReviews"

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

		const checklist = await client.api.createFilledChecklist({
			studentAnswerId: booking.student.getEnrichedBooking.answerId!,
		})

		const { sshLink, httpsLink } =
			checklist.student.createFilledChecklist.gitlabStudentProjectUrl

		console.log(`Repo SSH link: ${sshLink}`)
		console.log(`Repo HTTPS link: ${httpsLink}`)
	},
})
