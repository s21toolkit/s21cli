import { VERSION } from "@/version"
import { subcommands } from "cmd-ts"
import { apiCommand } from "./commands/api"
import { authCommand } from "./commands/auth/index"
import { cacheCommand } from "./commands/cache"
import { gqlCommand } from "./commands/gql"
import { peerReviewCommand } from "./commands/peer-review"
import { projectCommand } from "./commands/project"
import { testCommand } from "./commands/test"
import { updateCommand } from "./commands/update"
import { versionCommand } from "./commands/version"
import { watchForSlotsCommand } from "./commands/wfs"

export const cli = subcommands({
	name: "s21",
	description: "Command line utilities for school 21 education platform",
	version: VERSION.toString(),
	cmds: {
		test: testCommand,
		pr: peerReviewCommand,
		api: apiCommand,
		gql: gqlCommand,
		auth: authCommand,
		version: versionCommand,
		update: updateCommand,
		wfs: watchForSlotsCommand,
		project: projectCommand,
		cache: cacheCommand,
	},
})
