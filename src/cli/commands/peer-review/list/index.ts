import { command } from "cmd-ts"
import { getAuthorizedClient } from "@/auth"
import { fetchPeerReviews } from "@/cli/commands/peer-review/fetchPeerReviews"
import { getPeerReviewDescriptor } from "@/adapters/getPeerReviewDescriptor"

export const listCommand = command({
	name: "list",
	description: "Displays list of pending PRs",
	args: {},
	async handler() {
		const client = getAuthorizedClient()

		const bookings = await fetchPeerReviews(client)

		if (bookings.length === 0) {
			console.log("No bookings found")

			return
		}

		console.log(`${bookings.length} bookings found:`)

		for (const [i, booking] of bookings.entries()) {
			console.log(`${i}. ${getPeerReviewDescriptor(booking)}`)
		}
	},
})
