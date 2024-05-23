import assert from "node:assert"
import { getAuthorizedClient } from "@/auth"
import { resolveProjectModuleId } from "@/cli/resolveProjectModuleId"
import { command, option, string } from "cmd-ts"

export const infoCommand = command({
	name: "info",
	description: "Displays project information",
	args: {
		projectCode: option({
			long: "project",
			short: "p",
			description:
				"Project to seek slots for, use `this` to infer from current repository (default)",
			type: string,
			defaultValue: () => "this",
		}),
	},
	async handler(argv) {
		const client = getAuthorizedClient()

		const moduleId = await resolveProjectModuleId(client, argv.projectCode)

		const module = await client.api.calendarGetModule({
			moduleId: String(moduleId),
		})

		const info = module.student?.getModuleById

		assert(info, "Module info not found")

		console.log("Id:", info.id)
		console.log("Title:", info.moduleTitle)
		console.log("Subject:", info.subjectTitle)
		console.log("Type:", info.goalExecutionType)
	},
})
