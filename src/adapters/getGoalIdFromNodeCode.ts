import assert from "node:assert"
import type { CachedClient } from "@/cache"

export async function getGoalIdFromNodeCode(
	client: CachedClient,
	nodeCode: string,
	studentId: string,
) {
	const graphState = await client.api("cache").ProjectMapGetStudentGraphState({
		studentId,
	})

	const nodes = graphState.holyGraph?.getStudentStateGraph?.nodes

	assert(nodes, "Nodes not found")

	const [item] = nodes
		.map((node) => node.items.find((item) => item.code === nodeCode))
		.filter(Boolean)

	if (!item) {
		throw new Error(`Item ${nodeCode} not found`)
	}

	return item.entityId
}
