import { command } from "cmd-ts"
import { fetchPendingPeerReview } from "@/platform/fetchPendingPeerReview"
import { getPeerReviewDescriptor } from "@/platform/getPeerReviewDescriptor"

export const linkCommand = command({
	name: "link",
	description: "Displays SSH/HTTPS links for pending PR repository",
	args: {},
	async handler() {
		const review = await fetchPendingPeerReview()

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
