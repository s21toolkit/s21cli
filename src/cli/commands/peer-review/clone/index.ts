import type { Api } from "@s21toolkit/client"
import { command, number, option, optional, string } from "cmd-ts"
import { join } from "node:path"
import { getAuthorizedClient } from "@/auth"
import { fetchSelectedPeerReview } from "@/cli/commands/peer-review/fetchPeerReviews"
import { Configuration } from "@/configuration"

function getPrDirectory(descriptor: string) {
	const basePath = Configuration.required.prDirectory

	const uuid = crypto.randomUUID()

	return join(basePath, `${descriptor}-${uuid}`)
}

function bookingToPrettyString(booking: Api.GetAgendaP2P.Data) {
	const project = booking.student.getEnrichedBooking.task!.goalName
	const verifiableUser =
		booking.student.getEnrichedBooking.verifiableStudent!.user

	const verifierUser = booking.student.getEnrichedBooking.verifierUser

	const isTeam = Boolean(booking.student.getEnrichedBooking.team)

	return `"${project}" by ${isTeam ? "(Team)" : ""} ${
		verifiableUser.login
	} reviewed by ${verifierUser.login}`
}

function bookingToUrlString(booking: Api.GetAgendaP2P.Data) {
	const project = booking.student.getEnrichedBooking.task!.goalName
	const verifiableUser =
		booking.student.getEnrichedBooking.verifiableStudent!.user

	const verifierUser = booking.student.getEnrichedBooking.verifierUser

	return `${project}-${verifiableUser.login}-${verifierUser.login}`
		.replaceAll(/[^\w\d_-]/g, "")
		.replaceAll(/\s+/g, "-")
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
			type: optional(number),
			defaultValue: () => undefined,
		}),
	},
	async handler(argv) {
		const client = getAuthorizedClient()

		const booking = await fetchSelectedPeerReview(client, argv.index)

		const checklist = await client.api.createFilledChecklist({
			studentAnswerId: booking.student.getEnrichedBooking.answerId!,
		})

		console.log(`Pending booking detected: ${bookingToPrettyString(booking)}`)

		const { sshLink, httpsLink } =
			checklist.student.createFilledChecklist.gitlabStudentProjectUrl

		console.log(`Repo SSH link: ${sshLink}`)
		console.log(`Repo HTTPS link: ${httpsLink}`)

		const directoryName = getPrDirectory(bookingToUrlString(booking))

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
