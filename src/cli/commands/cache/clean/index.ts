import { command, flag } from "cmd-ts"
import { rm } from "node:fs/promises"
import {
	cacheDirectory,
	globalCacheDirectory,
	localCacheDirectory,
} from "@/cache"

async function cleanCache(directory: string) {
	console.log(`Cleaning cache from '${directory}' . . .`)

	await rm(directory, { force: true, recursive: true })

	console.log("Complete.")
}

export const cleanCommand = command({
	name: "clean",
	description: "Clean cache",
	args: {
		local: flag({
			long: "local",
			short: "l",
			description: "Clean local cache (ignores configuration)",
			defaultValue: () => false,
		}),
		global: flag({
			long: "global",
			short: "g",
			description: "Clean global cache (ignores configuration)",
			defaultValue: () => false,
		}),
		all: flag({
			long: "all",
			short: "a",
			description: "Clean both local & global cache (ignores configuration)",
			defaultValue: () => false,
		}),
	},
	async handler(argv) {
		if (argv.local || argv.all) {
			await cleanCache(localCacheDirectory)
		}

		if (argv.global || argv.all) {
			await cleanCache(globalCacheDirectory)
		}

		if (!argv.global && !argv.local && !argv.all) {
			await cleanCache(cacheDirectory)
		}
	},
})
