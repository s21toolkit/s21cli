import dayjs from "dayjs"
import { inspect } from "node:util"
import { getDefaultClient } from "./getDefaultClient"

export async function getPendingPeerReview(client = getDefaultClient()) {
	const agendaEvents = await client.api.getAgendaEvents({
		from: dayjs().toDate(),
		to: dayjs().add(1, "hour").toDate(),
		limit: 100,
	})

	const pendingBookingEvents = agendaEvents.student.getMyAgendaEvents
		.filter((event) => event.agendaItemContext.entityType === "BOOKING")
		.filter((event) => dayjs().isAfter(event.start))

	if (pendingBookingEvents.length === 0) {
		throw new Error("No bookings found")
	}

	const [booking] = pendingBookingEvents

	const enrichedBooking = await client.api.getAgendaP2P({
		bookingId: booking!.agendaItemContext.entityId,
	})

	const answerId = enrichedBooking.student.getEnrichedBooking.answerId

	if (!answerId) {
		throw new Error("Failed to fetch answerId")
	}

	const checklist = await client.api.createFilledChecklist({
		studentAnswerId: answerId,
	})

	return {
		booking,
		enrichedBooking,
		checklist,
	}
}
