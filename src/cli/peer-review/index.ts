import { subcommands } from "cmd-ts"
import { cloneCommand } from "./clone"
import { sshCommand } from "./ssh"

export const peerReviewCommand = subcommands({
	name: "pr",
	cmds: {
		ssh: sshCommand,
		clone: cloneCommand,
	},
})
