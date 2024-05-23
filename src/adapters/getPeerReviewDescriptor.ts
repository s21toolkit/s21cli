import assert from "node:assert"
import type { GetAgendaP2PQuery } from "@s21toolkit/client-schema"
import { extractUsername } from "./extractUsername"

export function getPeerReviewDescriptor(enrichedBooking: GetAgendaP2PQuery) {
	const { task } = enrichedBooking.student?.getEnrichedBooking ?? {}

	assert(task, "Failed to create booking descriptor, task was not provided")

	const verifierUser = enrichedBooking.student?.getEnrichedBooking.verifierUser
	const verifiableUsers =
		enrichedBooking.student?.getEnrichedBooking.verifiableInfo
			?.verifiableStudents

	assert(
		verifierUser,
		"Failed to create booking descriptor, verifierUser was not provided",
	)
	assert(
		verifiableUsers,
		"Failed to create booking descriptor, verifiableUsers were not provided",
	)

	assert(
		verifierUser.login,
		"Failed to create booking descriptor, verifierUser.login was not provided",
	)

	const projectName = task.goalName
	const verifiableUserName = verifiableUsers
		.map((user) => extractUsername(user.login))
		.join("-")
	const verifierUserName = extractUsername(verifierUser.login)

	return `${projectName}--${verifiableUserName}--${verifierUserName}`
		.toLowerCase()
		.replaceAll(/\s+/g, "-")
		.replaceAll(/[^\w\d_-]/g, "")
}
