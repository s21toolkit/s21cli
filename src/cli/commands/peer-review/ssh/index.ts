import { command } from "cmd-ts"
import { commandHandler } from "@/tools/commandHandler"
import { getPendingPeerReview } from "@/tools/getPendingPeerReview"

export const sshCommand = command({
	name: "ssh",
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
