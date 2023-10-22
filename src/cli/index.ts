import { subcommands } from "cmd-ts"
import { peerReviewCommand } from "./peer-review"
import { testCommand } from "./test"

export const cli = subcommands({
	name: "s21",
	cmds: {
		test: testCommand,
		pr: peerReviewCommand,
	},
})
