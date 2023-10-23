import { subcommands } from "cmd-ts"
import { apiCommand } from "./commands/api"
import { peerReviewCommand } from "./commands/peer-review"
import { testCommand } from "./commands/test"

export const cli = subcommands({
	name: "s21",
	cmds: {
		test: testCommand,
		pr: peerReviewCommand,
		api: apiCommand,
	},
})
