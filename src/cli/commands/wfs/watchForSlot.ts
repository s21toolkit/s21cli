import assert from "node:assert"
import { getAuthorizedClient } from "@/auth"
import dayjs from "dayjs"

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
	const subscriptions: { timestamp: dayjs.Dayjs; startTime: dayjs.Dayjs }[] =
		[]

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

		const startTime = timeSlots[0]?.validStartTimes[0]
		assert(startTime, "Start time not found")

		const startDayjs = dayjs(startTime)
		const slot = subscriptions.find((e) => e.startTime.isSame(startDayjs))
		if (
			slot?.startTime.isSame(dayjs(startTime)) &&
			slot?.timestamp.diff(dayjs(), "seconds") < 15
		) {
			console.log(
				`[${title}] Cant resubscribe on same slot until 15 seconds is passed skipping...`,
			)
			continue
		}

		await api.calendarAddBookingToEventSlot({
			wasStaffSlotChosen: timeSlots[0]?.staffSlot ?? false,
			isOnline: online,
			startTime,
			answerId,
		})

		if (slot) {
			slot.timestamp = dayjs()
			slot.startTime = startDayjs
		}

		console.log(
			`[${title}] Subscribed on slot ${new Date(startTime).toLocaleString()}`,
		)
	}
}
