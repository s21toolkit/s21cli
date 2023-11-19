import { command, option } from "cmd-ts"
import { duration } from "@/cli/arguments/duration"
import { resolveGoalIdFromGit } from "@/git/resolveGoalIdFromGit"
import { getAuthorizedClient } from "@/auth"
import dayjs from "dayjs"

export const watchForSlots = command({
	aliases: ["watch", "wfs", "watchForSlots"],
	name: "wfs",
	description:
		"Watching for slots on project. Should be called in project directory.",
	args: {
		ahead: option({
			long: "time-ahead",
			defaultValue: () => 60 * 60 * 12,
			type: duration
		})
	},
	async handler (args) {
		const client = getAuthorizedClient();

		const module = await client.api.calendarGetModule({
			moduleId: await resolveGoalIdFromGit()
		})

		const taskId = module.student.getModuleById.currentTask.task.id

		console.log(`Watching on project ${module.student.getModuleById.moduleTitle}...`)

		while(true) {
			const slots = await client.api.calendarGetNameLessStudentTimeslotsForReview({
				from: dayjs().toDate(),
				to: dayjs().add(args.ahead, "s").toDate(),
				taskId: taskId
			})

			const timeSlots = slots.student.getNameLessStudentTimeslotsForReview.timeSlots
			if(timeSlots.length === 0) {
				continue
			}

			const startTime = timeSlots[0]!.validStartTimes[0] as any as string
			await client.api.calendarAddBookingToEventSlot({
				answerId: module.student.getModuleById.trajectory.levels[0]!.goalElements[0]!.points[0]!.studentTask.lastAnswer.id,
				wasStaffSlotChosen: timeSlots[0]!.staffSlot.toString(),
				startTime: startTime,
				isOnline: false
			})

			console.log(`Subscribed on slot ${new Date(startTime).toLocaleString()}`)
		}
	}
})
