import { command } from "cmd-ts"
import { getPendingPeerReview } from "@/tools/getPendingPeerReview"

export const sshCommand = command({
	name: "ssh",
	args: {},
	async handler() {
		const review = await getPendingPeerReview().catch((error) => {
			if (error instanceof Error) {
				console.error(error.message)
			} else {
				console.error("Unknown error")
			}
		})

		if (!review) {
			return
		}

		const { checklist } = review

		const { sshLink, httpsLink } =
			checklist.student.createFilledChecklist.gitlabStudentProjectUrl

		console.log(`Repo SSH link: ${sshLink}`)
		console.log(`Repo HTTPS link: ${httpsLink}`)
	},
})
