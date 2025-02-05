import assert from "node:assert"
import { resolveGoalIdFromGitRemote } from "@/adapters/git"
import { getAuthorizedClient } from "@/auth"
import { command, option, string } from "cmd-ts"

export const infoCommand = command({
	name: "info",
	description: "Displays project information",
	args: {
		projectId: option({
			long: "project",
			short: "p",
			description:
				"Project code to seek slots for, use `this` to infer from current repository (default)",
			type: string,
			defaultValue: () => "this",
		}),
	},
	async handler({ projectId }) {
		const client = getAuthorizedClient()

		const id =
			projectId === "this" ? await resolveGoalIdFromGitRemote() : projectId

		const module = await client.api.calendarGetModule({
			moduleId: String(id),
		})

		const info = module.student?.getModuleById

		assert(info, "Module info not found")

		console.log("Id:", info.id)
		console.log("Title:", info.moduleTitle)
		console.log("Subject:", info.subjectTitle)
		console.log("Type:", info.goalExecutionType)
	},
})
