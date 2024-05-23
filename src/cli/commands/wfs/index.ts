import assert from "node:assert"
import { getAuthorizedClient } from "@/auth"
import { duration } from "@/cli/arguments/duration"
import { resolveProjectModuleId } from "@/cli/resolveProjectModuleId"
import { command, option, string } from "cmd-ts"
import dayjs from "dayjs"

export const watchForSlotsCommand = command({
	aliases: ["watch", "wfs", "watch-for-slots"],
	name: "wfs",
	description: "Watches for evaluation slots for the specified project",
	args: {
		projectCode: option({
			long: "project",
			short: "p",
			description:
				"Project to seek slots for, use `this` to infer from current repository (default)",
			type: string,
			defaultValue: () => "this",
		}),
		timeAhead: option({
			long: "time-ahead",
			short: "t",
			description: "Time period to seek slots in",
			defaultValue: () => 60 * 60 * 12,
			type: duration,
		}),
	},
	async handler(argv) {
		const client = getAuthorizedClient()

		const moduleId = await resolveProjectModuleId(client, argv.projectCode)

		const module = await client.api.calendarGetModule({
			moduleId: String(moduleId),
		})

		assert(module.student, "Module student not found")

		const taskId = module.student.getModuleById.currentTask?.task.id

		assert(taskId, "Current task not found")

		console.log(
			`Watching on project ${module.student.getModuleById.moduleTitle}...`,
		)

		for (;;) {
			const slots =
				await client.api.calendarGetNameLessStudentTimeslotsForReview({
					from: dayjs().toDate(),
					to: dayjs().add(argv.timeAhead, "seconds").toDate(),
					taskId,
				})

			assert(slots.student, "Slots student not found")

			const { timeSlots } =
				slots.student.getNameLessStudentTimeslotsForReview

			if (timeSlots.length === 0) {
				continue
			}

			const startTime = timeSlots[0]?.validStartTimes[0]

			assert(startTime, "Start time not found")

			assert(
				module.student.getModuleById.currentTask?.lastAnswer?.id,
				"Current task answer ID not found",
			)

			await client.api.calendarAddBookingToEventSlot({
				answerId: module.student.getModuleById.currentTask?.lastAnswer?.id,
				wasStaffSlotChosen: timeSlots[0]?.staffSlot ?? false,
				startTime,
				isOnline: false,
			})

			console.log(
				`Subscribed on slot ${new Date(startTime).toLocaleString()}`,
			)
		}
	},
})
