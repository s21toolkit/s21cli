import assert from "node:assert"
import { getGoalIdFromNodeCode } from "@/adapters/getGoalIdFromNodeCode"
import { getAuthorizedClient } from "@/auth"
import { getNodeCode } from "./getNodeCode"

export async function resolveGoalIdFromGitRemote() {
	const client = getAuthorizedClient()

	const { user } = await client.api("cache").getCurrentUser()
	const studentId = user?.getCurrentUser.currentSchoolStudentId

	assert(studentId, "Student ID not found")

	const nodeCode = getNodeCode()

	return getGoalIdFromNodeCode(client, nodeCode, studentId)
}
