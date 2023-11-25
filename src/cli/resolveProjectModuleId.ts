import type { Client } from "@s21toolkit/client"
import { getGoalIdFromNodeCode } from "@/adapters/getGoalIdFromNodeCode"
import { resolveGoalIdFromGitRemote } from "@/git"

export async function resolveProjectModuleId(
	client: Client,
	projectCode: string,
) {
	if (projectCode === "this") {
		return await resolveGoalIdFromGitRemote()
	}

	const { user } = await client.api.getCurrentUser()

	const goalId = await getGoalIdFromNodeCode(
		client,
		projectCode,
		user.getCurrentUser.currentSchoolStudentId,
	)

	return goalId
}