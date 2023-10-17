import { subcommands } from "cmd-ts"
import { testCommand } from "./test"
import { peerReviewCommand } from "./peer-review"

export const cli = subcommands({
	name: "s21",
	cmds: {
		test: testCommand,
		pr: peerReviewCommand,
	},
})
