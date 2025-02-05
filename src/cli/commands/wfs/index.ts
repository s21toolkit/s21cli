import assert from "node:assert"
import { resolveGoalIdFromGitRemote } from "@/adapters/git"
import { getAuthorizedClient } from "@/auth"
import { duration } from "@/cli/arguments/duration"
import { command, flag, option, string } from "cmd-ts"
import dayjs from "dayjs"

export const watchForSlotsCommand = command({
	aliases: ["watch", "wfs", "watch-for-slots"],
	name: "wfs",
	description: "Watches for evaluation slots for the specified project",
	args: {
		projectId: option({
			long: "project",
			short: "p",
			description:
				"Project id to seek slots for, use `this` to infer from current repository (default)",
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
		offline: flag({
			long: "offline",
			short: "o",
			description: "Literally online flag",
			defaultValue: () => false,
		}),
	},
	async handler({ offline, projectId, timeAhead }) {
		const client = getAuthorizedClient()

		const id =
			projectId === "this" ? await resolveGoalIdFromGitRemote() : projectId

		const module = await client.api.calendarGetModule({
			moduleId: String(id),
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
					to: dayjs().add(timeAhead, "seconds").toDate(),
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
				isOnline: !offline,
				startTime,
			})

			console.log(
				`Subscribed on slot ${new Date(startTime).toLocaleString()}`,
			)
		}
	},
})
