import { command } from "cmd-ts"
import { VERSION } from "@/version"

export const versionCommand = command({
	name: "version",
	aliases: ["v"],
	description: "Displays program version and additional information",
	args: {},
	handler() {
		console.log(`s21cli version ${VERSION}\n`)
		console.log("repository: https://github.com/s21toolkit/s21cli")
	},
})
