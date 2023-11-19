import { command, option } from "cmd-ts"
import { duration } from "@/cli/arguments/duration"
import { getNodeCode } from "@/git/getNodeCode"
import { Client, DefaultAuthProvider } from "@s21toolkit/client"
import { Configuration } from "@/configuration"
import { getGoalIdFromNodeCode } from "@/adapters/getGoalIdFromNodeCode"
import { resolveGoalIdFromGit } from "@/git/resolveGoalIdFromGit"

export const watchForSlots = command({
	aliases: ["watch", "wfs", "watchForSlots"],
	name: "wfs",
	description:
		"Watching for slots on project. Should be called in project directory.",
	args: {
		ahead: option({
			long: "time-ahead",
			defaultValue: () => 60 * 60 * 12,
			type: duration
		})
	},
	async handler (args) {
		console.log(await resolveGoalIdFromGit())
	}
})
