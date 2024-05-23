import assert from "node:assert"
import { getAuthorizedClient } from "@/auth/getAuthorizedClient"
import type { CachedClient } from "@/cache"
import dayjs from "dayjs"

async function fetchEnrichedBookingAndChecklist(
	client: CachedClient,
	bookingId: string,
) {
	const enrichedBooking = await client.api.getAgendaP2P({ bookingId })

	const answerId = enrichedBooking.student?.getEnrichedBooking.answerId

	assert(answerId, "Failed to fetch answerId")

	const checklist = await client.api.getFilledChecklist({
		filledChecklistId: answerId,
	})

	return {
		enrichedBooking,
		checklist,
	}
}

export async function fetchPendingPeerReviews(client = getAuthorizedClient()) {
	const agendaEvents = await client.api.getAgendaEvents({
		from: dayjs().toDate(),
		to: dayjs().add(1, "hour").toDate(),
		limit: 100,
	})

	const pendingBookingEvents = agendaEvents.calendarEventS21?.getMyAgendaEvents
		.filter((event) => event.agendaItemContext.entityType === "BOOKING")
		.filter((event) => dayjs().isAfter(event.start))

	assert(pendingBookingEvents, "Pending booking events are not available")

	if (pendingBookingEvents.length === 0) {
		throw new Error("No bookings found")
	}

	const peerReviews = await Promise.all(
		pendingBookingEvents.map(async (booking) => ({
			booking,
			...(await fetchEnrichedBookingAndChecklist(
				client,
				booking.agendaItemContext.entityId,
			)),
		})),
	)

	return peerReviews
}

export type PendingPeerReview = Awaited<
	ReturnType<typeof fetchPendingPeerReviews>
>[number]
