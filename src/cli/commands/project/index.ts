import { subcommands } from "cmd-ts"
import { infoCommand } from "./info"

export const projectCommand = subcommands({
	name: "project",
	description: "Project-related utilities",
	cmds: {
		info: infoCommand,
	},
})
