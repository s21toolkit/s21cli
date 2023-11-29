import { command } from "cmd-ts"
import { rm } from "node:fs/promises"
import { cacheDirectory } from "@/cache"

export const cleanCommand = command({
	name: "clean",
	description: "Clean cache",
	args: {},
	async handler() {
		console.log(`Cleaning cache from '${cacheDirectory}' . . .`)

		await rm(cacheDirectory, { force: true, recursive: true })

		console.log("Complete.")
	},
})
