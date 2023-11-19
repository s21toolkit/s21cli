import { getGoalIdFromNodeCode } from "@/adapters/getGoalIdFromNodeCode";
import { AuthProvider } from "@s21toolkit/client";
import { getNodeCode } from "./getNodeCode";
import { getAuthorizedClient } from "@/auth";

export async function resolveGoalIdFromGit() {
	const client = getAuthorizedClient()
	const studentId = (await client.api.getCurrentUser({})).user.getCurrentUser.currentSchoolStudentId

	return getGoalIdFromNodeCode(client, await getNodeCode(), studentId)
}
