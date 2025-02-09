import assert from "node:assert"
import { getAuthorizedClient } from "@/auth"
import dayjs from "dayjs"

const subscriptions: Record<string, dayjs.Dayjs> = {}

export async function watchForSlot({
	taskId,
	answerId,
	timeAhead,
	online,
	title,
}: {
	taskId: string
	answerId: string
	timeAhead: number
	online: boolean
	title: string
}) {
	const api = getAuthorizedClient().api("passthrough")

	for (;;) {
		const slots = await api.calendarGetNameLessStudentTimeslotsForReview({
			from: dayjs().toDate(),
			to: dayjs().add(timeAhead, "seconds").toDate(),
			taskId,
		})
		assert(slots.student, "Slots student not found")

		const { timeSlots } = slots.student.getNameLessStudentTimeslotsForReview

		if (timeSlots.length === 0) {
			continue
		}

		const startDate = timeSlots[0]?.validStartTimes[0]
		assert(startDate, "Start time not found")

		const startTime = startDate.toISOString()
		const timestamp = subscriptions[startTime]
		if ((timestamp?.diff(dayjs(), "seconds") ?? 15) < 15) {
			console.log(
				`[${title}] Cant resubscribe on same slot until 15 seconds is passed skipping...`,
			)
			continue
		}

		await api.calendarAddBookingToEventSlot({
			wasStaffSlotChosen: timeSlots[0]?.staffSlot ?? false,
			isOnline: online,
			startTime: startDate,
			answerId,
		})

		subscriptions[startTime] = dayjs()

		console.log(
			`[${title}] Subscribed on slot ${new Date(startDate).toLocaleString()}`,
		)
	}
}
