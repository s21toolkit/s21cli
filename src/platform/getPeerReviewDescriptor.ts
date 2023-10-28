import type { Api } from "@s21toolkit/client"
import { extractUsername } from "./extractUsername"

export function getPeerReviewDescriptor(
	enrichedBooking: Api.GetAgendaP2P.Data,
) {
	const { task } = enrichedBooking.student.getEnrichedBooking

	if (!task) {
		return undefined
	}

	const verifierUser = enrichedBooking.student.getEnrichedBooking.verifierUser!
	const verifiableUser =
		enrichedBooking.student.getEnrichedBooking.verifiableStudent!.user

	const projectName = task.goalName
	const verifiableUserName = extractUsername(verifiableUser.login)
	const verifierUserName = extractUsername(verifierUser.login)

	return `${projectName} / ${verifiableUserName} (${verifierUserName})`
}
