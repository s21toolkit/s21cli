import { subcommands } from "cmd-ts"
import { cloneCommand } from "./clone"
import { linkCommand } from "./link"

export const peerReviewCommand = subcommands({
	name: "pr",
	description: "Peer-review related utilities",
	cmds: {
		link: linkCommand,
		clone: cloneCommand,
	},
})
