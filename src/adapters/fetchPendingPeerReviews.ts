import dayjs from "dayjs"
import { getAuthorizedClient } from "@/auth/getAuthorizedClient"
import type { CachedClient } from "@/cache"

async function fetchEnrichedBookingAndChecklist(
	client: CachedClient,
	bookingId: string,
) {
	const enrichedBooking = await client.api.getAgendaP2P({ bookingId })

	const answerId = enrichedBooking.student.getEnrichedBooking.answerId

	if (!answerId) {
		throw new Error("Failed to fetch answerId")
	}

	const checklist = await client.api.createFilledChecklist({
		studentAnswerId: answerId,
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

	const pendingBookingEvents = agendaEvents.calendarEventS21.getMyAgendaEvents
		.filter((event) => event.agendaItemContext.entityType === "BOOKING")
		.filter((event) => dayjs().isAfter(event.start))

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
