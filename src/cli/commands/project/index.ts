import { subcommands } from "cmd-ts"
import { cloneCommand } from "./clone"
import { infoCommand } from "./info"

export const projectCommand = subcommands({
	name: "project",
	description: "Project-related utilities",
	cmds: {
		info: infoCommand,
		clone: cloneCommand,
	},
})
