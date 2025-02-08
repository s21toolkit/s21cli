import assert from "node:assert"
import { getAuthorizedClient } from "./getAuthorizedClient"

/* Require to clean cache before authenticating as another user */
export async function getCurrentUser() {
	const client = getAuthorizedClient()
	const userResponse = await client.api("cache").getCurrentUser()

	assert(userResponse.user, "Cannot get current user")

	return userResponse.user.getCurrentUser
}

export async function getCurrentUserId() {
	return getCurrentUser().then((u) => u.id)
}
