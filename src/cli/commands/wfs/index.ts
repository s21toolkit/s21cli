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

		console.log("Watching...")

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

			client.api.calendarAddBookingToEventSlot({
				answerId: module.student.getModuleById.trajectory.levels[0]!.goalElements[0]!.points[0]!.studentTask.lastAnswer.id,
				startTime: timeSlots[0]!.validStartTimes[0]!.toISOString(),
				wasStaffSlotChosen: timeSlots[0]!.staffSlot.toString(),
				isOnline: false
			})

			console.log(`Subscribed on slot ${timeSlots[0]!.validStartTimes[0]}`)
		}
	}
})
