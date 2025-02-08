import assert from "node:assert"
import { getAuthorizedClient } from "@/auth"
import { getCurrentUserId } from "@/auth/getCurrentUser"
import type { DisplayedGoalStatus } from "@s21toolkit/client-schema"

export async function getCurrentUserGoalsWithStatus(
	status: DisplayedGoalStatus,
) {
	const api = getAuthorizedClient().api("passthrough")
	const userId = await getCurrentUserId()

	const projects = await api
		.getStudentCurrentProjects({ userId })
		.then((p) => p.student?.getStudentCurrentProjects)
	assert(projects, "No projects returned")

	return await Promise.all(
		projects
			.filter(
				(p) => p?.localCourseId || (p?.goalId && p.goalStatus === status),
			)
			.map(async (p) =>
				p?.localCourseId
					? await getIntensiveGoalsWithStatus(
							p.localCourseId.toString(),
							status,
						)
					: [p],
			),
	).then((e) => e.flat())
}

export async function getIntensiveGoalsWithStatus(
	id: string,
	status: DisplayedGoalStatus,
) {
	const api = getAuthorizedClient().api("passthrough")
	const goals = await api
		.getLocalCourseGoalsInfo({ localCourseId: id })
		.then((c) => c.course?.getLocalCourseGoals.localCourseGoals)

	assert(goals, "No goals returned")

	return goals.filter((g) => g.status === status)
}
