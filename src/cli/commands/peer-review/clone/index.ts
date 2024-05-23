import assert from "node:assert"
import { spawnSync } from "node:child_process"
import { randomUUID } from "node:crypto"
import { join } from "node:path"
import { getPeerReviewDescriptor } from "@/adapters/getPeerReviewDescriptor"
import { getAuthorizedClient } from "@/auth"
import { fetchSelectedPeerReview } from "@/cli/commands/peer-review/fetchPeerReviews"
import { Configuration } from "@/configuration"
import type { GetAgendaP2PQuery } from "@s21toolkit/client-schema"
import { command, number, option, optional, string } from "cmd-ts"

function getPrDirectory(descriptor: string) {
	const basePath = Configuration.required.prDirectory

	const uuid = randomUUID()

	return join(basePath, `${descriptor}-${uuid}`)
}

function bookingToPrettyString(booking: GetAgendaP2PQuery) {
	const project = booking.student?.getEnrichedBooking.task?.goalName
	const verifiableUsers =
		booking.student?.getEnrichedBooking.verifiableInfo?.verifiableStudents

	assert(
		project,
		"Failed to create booking descriptor, project was not provided",
	)
	assert(
		verifiableUsers,
		"Failed to create booking descriptor, user was not provided",
	)

	const verifierUser = booking.student?.getEnrichedBooking.verifierUser

	assert(
		verifierUser,
		"Failed to create booking descriptor, verifier was not provided",
	)

	const isTeam = Boolean(
		booking.student?.getEnrichedBooking.verifiableInfo?.team,
	)

	return `"${project}" by ${isTeam ? "(Team)" : ""} ${verifiableUsers
		.map((student) => student.login)
		.join(", ")} reviewed by ${verifierUser.login}`
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

		assert(
			booking.student?.getEnrichedBooking.answerId,
			"Selected booking is missing answerId",
		)

		const checklist = await client.api.getFilledChecklist({
			filledChecklistId: booking.student?.getEnrichedBooking.answerId,
		})

		console.log(`Pending booking detected: ${bookingToPrettyString(booking)}`)

		const { sshLink, httpsLink } =
			checklist.student?.getP2pInfo.solutionInfo?.gitlabSolutionInfo
				?.gitlabLink ?? {}

		assert(sshLink, "Failed to extract ssh repo link")
		assert(httpsLink, "Failed to extarct https repo link")

		console.log(`Repo SSH link: ${sshLink}`)
		console.log(`Repo HTTPS link: ${httpsLink}`)

		const directoryName = getPrDirectory(getPeerReviewDescriptor(booking))

		const handle = spawnSync(
			"git",
			[
				"clone",
				"--branch",
				argv.branch,
				"--recurse-submodules",
				sshLink,
				directoryName,
			],
			{
				stdio: "inherit",
			},
		)

		if (handle.error) {
			console.error("Failed to clone project repo")
		}
	},
})
