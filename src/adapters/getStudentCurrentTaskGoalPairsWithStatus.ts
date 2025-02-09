import assert from "node:assert"
import { getAuthorizedClient } from "@/auth"
import { DisplayedGoalStatus } from "@s21toolkit/client-schema"
import { getUserGoalsWithStatus } from "./getUserGoalsWithStatus"

export async function getStudentCurrentTaskGoalPairsWithStatus(
	status: DisplayedGoalStatus = DisplayedGoalStatus.InProgress,
) {
	const api = getAuthorizedClient().api("passthrough")
	const goals = await getUserGoalsWithStatus(status)
	return await Promise.all(
		goals.map(async (g) => {
			assert(g?.goalId, "Got empty goalId")
			const currentTask = await api
				.getProjectInfo({ goalId: g.goalId.toString() })
				.then((p) => p.student?.getModuleById.currentTask)
			assert(currentTask, `No current task for ${g?.goalId}`)
			return { goal: g, currentTask }
		}),
	)
}
