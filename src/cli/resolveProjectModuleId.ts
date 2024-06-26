import assert from "node:assert"
import { getGoalIdFromNodeCode } from "@/adapters/getGoalIdFromNodeCode"
import type { CachedClient } from "@/cache"
import { resolveGoalIdFromGitRemote } from "@/git"

export async function resolveProjectModuleId(
	client: CachedClient,
	projectCode: string,
) {
	if (projectCode === "this") {
		return await resolveGoalIdFromGitRemote()
	}

	const { user } = await client.api("cache").getCurrentUser()

	assert(user?.getCurrentUser.currentSchoolStudentId, "Student ID not found")

	const goalId = await getGoalIdFromNodeCode(
		client,
		projectCode,
		user.getCurrentUser.currentSchoolStudentId,
	)

	return goalId
}
