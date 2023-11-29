import type { CachedClient } from "@/cache"

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
		throw new Error(`Node ${nodeCode} not found`)
	}

	return node.entityId
}
