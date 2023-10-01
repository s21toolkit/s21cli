import { subcommands } from "cmd-ts"
import { testCommand } from "./test"

export const cli = subcommands({
	name: "s21cli",
	cmds: {
		test: testCommand,
	},
})
