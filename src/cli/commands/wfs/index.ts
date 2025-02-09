import assert from "node:assert"
import { getStudentCurrentTaskGoalPairsWithStatus } from "@/adapters/getStudentCurrentTaskGoalPairsWithStatus"
import { resolveGoalIdFromGitRemote } from "@/adapters/git"
import { getAuthorizedClient } from "@/auth"
import { duration } from "@/cli/arguments/duration"
import { DisplayedGoalStatus } from "@s21toolkit/client-schema"
import { command, flag, option, string } from "cmd-ts"
import { watchForSlot } from "./watchForSlot"

export const watchForSlotsCommand = command({
	aliases: ["watch", "wfs", "watch-for-slots"],
	name: "wfs",
	description:
		"Watches for evaluation slots for the specified project subscribing on first avaliabe slot from current time to current time + time-ahead",
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
			description: "Time period to seek slots in seconds",
			defaultValue: () => 60 * 60 * 12,
			type: duration,
		}),
		offline: flag({
			long: "offline",
			short: "o",
			description: "Literally online flag",
			defaultValue: () => false,
		}),
		all: flag({
			long: "all",
			short: "a",
			description:
				"Watch for slots on all projects with P2P_EVALUTAIONS status ignores project flag",
			defaultValue: () => false,
		}),
	},
	async handler({ all, offline, projectId, timeAhead }) {
		const api = getAuthorizedClient().api("passthrough")

		const modules = []
		if (all) {
			modules.push(
				...(await getStudentCurrentTaskGoalPairsWithStatus(
					DisplayedGoalStatus.P2PEvaluations,
				).then((tg) =>
					tg.map(({ goal, currentTask }) => ({
						taskId: currentTask.taskId,
						answerId: currentTask.lastAnswer?.id,
						// @ts-ignore theres must be either one or another i dont want fix intersection type between project and intensive goal query which .flat() generates
						title: goal.name ?? goal.goalName,
					})),
				)),
			)

			if (modules.length === 0) {
				console.log("No projects with evaluations status.")
				return
			}
		} else {
			const id =
				projectId === "this"
					? await resolveGoalIdFromGitRemote()
					: projectId

			modules.push(
				await api
					.calendarGetModule({
						moduleId: String(id),
					})
					.then((m) => ({
						module: m.student?.getModuleById,
						currentTask: m.student?.getModuleById.currentTask,
					}))
					.then(({ module, currentTask }) => ({
						taskId: currentTask?.id,
						answerId: currentTask?.lastAnswer?.id,
						title: module?.moduleTitle,
					})),
			)
		}

		await Promise.all(
			modules.map(({ taskId, answerId, title }) => {
				assert(taskId, "taskId not found")
				assert(answerId, "answerId not found")

				console.log(`Watching on project ${title}...`)
				return watchForSlot({
					title,
					taskId,
					answerId,
					online: !offline,
					timeAhead,
				})
			}),
		)
	},
})
