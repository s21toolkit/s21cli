import { Client } from "@s21toolkit/client"

export async function getGoalIdFromNodeCode(
	client: Client,
	nodeCode: string,
	studentId: string
) {
	const graphBasis = await client.api.getGraphBasisGoals({ studentId: studentId })

	const node = graphBasis.student.getBasisGraph.graphNodes.find((e) => e.nodeCode == nodeCode)
	if(!node) {
		throw new Error(`Node ${nodeCode} not found`)
	}

	return node.entityId
}
