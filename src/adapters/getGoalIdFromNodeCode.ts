import { type Api } from "@s21toolkit/client"
import { getAuthorizedClient } from "@/auth"
import type { CachedClient } from "@/cache"

async function resolveGoalIdFromCourse(
	client: CachedClient,
	course: Api.GetGraphBasisGoals.Data.GraphNode,
) {
	const userId = await (
		await client.api("cache").getCurrentUser({})
	).user.getCurrentUser.id

	const projects = await client
		.api("invalidate")
		.getStudentCurrentProjects({ userId })

	const project = projects.student.getStudentCurrentProjects.find(
		(e) => e.name === course.course?.projectName,
	)
	if (!project) {
		throw new Error(
			`Project correspoding to ${course.course?.projectName} course not found`,
		)
	}

	const goals = await client.api("invalidate").getLocalCourseGoals({
		localCourseId: `${project.localCourseId}`,
	})

	const goal = goals.course.getLocalCourseGoals.localCourseGoals.find(
		(e) => e.status === "P2P_EVALUATIONS",
	)
	if (!goal) {
		throw new Error(
			`No one goal from ${course.course?.projectName} appear to be in evaluations status`,
		)
	}

	return goal.goalId
}

export async function getGoalIdFromNodeCode(
	client: CachedClient,
	nodeCode: string,
	studentId: string,
) {
	const graphBasis = await client.api("cache").getGraphBasisGoals({
		studentId,
	})

	const node = graphBasis.student.getBasisGraph.graphNodes.find(
		(e) => e.nodeCode === nodeCode,
	)
	if (!node) {
		// Update cause we relying on IN_PROGRESS status
		const graphBasis = await getAuthorizedClient(
			"invalidate",
		).api.getGraphBasisGoals({ studentId })

		const course = graphBasis.student.getBasisGraph.graphNodes.find(
			(e) =>
				e.nodeCode.includes(nodeCode) &&
				e.course?.projectState === "IN_PROGRESS",
		)
		if (course) {
			return resolveGoalIdFromCourse(client, course)
		}

		throw new Error(`Node ${nodeCode} not found`)
	}

	return node.entityId
}
