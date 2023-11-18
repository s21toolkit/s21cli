import type { Api, Client } from "@s21toolkit/client"
import dayjs from "dayjs"
import { getPeerReviewDescriptor } from "@/platform/getPeerReviewDescriptor"

export async function fetchPendingBookings(client: Client) {
	const agendaEvents = await client.api.getAgendaEvents({
		from: dayjs().toDate(),
		to: dayjs().add(1, "hour").toDate(),
		limit: 100,
	})

	const pendingBookingEvents =
		agendaEvents.calendarEventS21.getMyAgendaEvents.filter(
			(event) =>
				event.agendaEventType === "CHECK_FOR_VERIFIER" &&
				event.agendaItemContext.entityType === "BOOKING" &&
				dayjs().isAfter(event.start),
		)

	return pendingBookingEvents
}

export async function fetchEnrichedBooking(
	client: Client,
	event: Api.GetAgendaEvents.Data.GetMyAgendaEvent,
) {
	return await client.api.getAgendaP2P({
		bookingId: event.agendaItemContext.entityId,
	})
}

export async function fetchPeerReviews(
	client: Client,
): Promise<Api.GetAgendaP2P.Data[]>
export async function fetchPeerReviews(
	client: Client,
	index: number,
): Promise<Api.GetAgendaP2P.Data>
export async function fetchPeerReviews(client: Client, index?: number) {
	const pendingBookings = await fetchPendingBookings(client)

	if (index === undefined) {
		const enrichedBookings = await Promise.all(
			pendingBookings.map((event) => fetchEnrichedBooking(client, event)),
		)

		return enrichedBookings
	}

	if (pendingBookings.length === 0) {
		throw new Error("No bookings found")
	}

	if (index < 0 || index >= pendingBookings.length) {
		throw new Error(
			`Invalid booking index, should be between 0 and ${
				pendingBookings.length - 1
			} (was ${index})`,
		)
	}

	const selectedBooking = pendingBookings[index]!

	const enrichedBooking = await fetchEnrichedBooking(client, selectedBooking)

	return enrichedBooking
}

export async function fetchSelectedPeerReview(client: Client, index?: number) {
	if (index === undefined) {
		const bookings = await fetchPeerReviews(client)

		if (bookings.length === 1) {
			return bookings[0]!
		}

		if (bookings.length === 0) {
			throw new Error("No bookings found")
		}

		console.log(
			`Multiple pending bookings detected, use "-i" option to select:`,
		)

		for (const [i, booking] of bookings.entries()) {
			console.log(`${i}. ${getPeerReviewDescriptor(booking)}`)
		}

		throw new Error("Multiple bookings found")
	} else {
		const booking = await fetchPeerReviews(client, index)

		return booking
	}
}
