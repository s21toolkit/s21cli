import { command, number, option } from "cmd-ts"
import { fetchPendingPeerReviews } from "@/platform/fetchPendingPeerReviews"
import { getPeerReviewDescriptor } from "@/platform/getPeerReviewDescriptor"

function resolvePeerReview(reviews: PendingPeerReview[], index: number) {
	if (reviews.length === 1) {
		return reviews[0]!
	}

	if (index >= 0 && index < reviews.length) {
		return reviews[index]!
	}

	return undefined
}

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
		const reviews = await fetchPendingPeerReviews()

		// FIXME: Refactor this, reduce duplication with pr/clone
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

		console.log(`Pending booking detected: ${descriptor}`)

		const { checklist } = review
		const { sshLink, httpsLink } =
			checklist.student.createFilledChecklist.gitlabStudentProjectUrl

		console.log(`Repo SSH link: ${sshLink}`)
		console.log(`Repo HTTPS link: ${httpsLink}`)
	},
})
