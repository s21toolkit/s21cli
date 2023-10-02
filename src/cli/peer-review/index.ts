import { subcommands } from "cmd-ts"
import { sshCommand } from "./ssh"
import { cloneCommand } from "./clone"

export const peerReviewCommand = subcommands({
	name: "pr",
	cmds: {
		ssh: sshCommand,
		clone: cloneCommand,
	},
})
