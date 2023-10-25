import { subcommands } from "cmd-ts"
import { apiCommand } from "./commands/api"
import { gqlCommand } from "./commands/gql"
import { peerReviewCommand } from "./commands/peer-review"
import { testCommand } from "./commands/test"

export const cli = subcommands({
	name: "s21",
	description: "Command line utilities for school 21 education platform",
	cmds: {
		test: testCommand,
		pr: peerReviewCommand,
		api: apiCommand,
		gql: gqlCommand,
	},
})
