import { command } from "cmd-ts"
import { commandHandler } from "@/cli/utils/commandHandler"
import { getPendingPeerReview } from "@/tools/getPendingPeerReview"

export const linkCommand = command({
	name: "link",
	description: "Displays SSH/HTTPS links for pending PR repository",
	args: {},
	handler: () =>
		commandHandler(async () => {
			const review = await getPendingPeerReview()

			const { checklist } = review
			const { sshLink, httpsLink } =
				checklist.student.createFilledChecklist.gitlabStudentProjectUrl

			console.log(`Repo SSH link: ${sshLink}`)
			console.log(`Repo HTTPS link: ${httpsLink}`)
		}),
})
