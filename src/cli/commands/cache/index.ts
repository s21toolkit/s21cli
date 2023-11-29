import { subcommands } from "cmd-ts"
import { cleanCommand } from "./clean/index"

export const cacheCommand = subcommands({
	name: "cache",
	description: "Cache management",
	cmds: {
		clean: cleanCommand,
	},
})
