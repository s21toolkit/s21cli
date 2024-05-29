import os from "node:os"
import { FileSystem, Path } from "@effect/platform"
import { Config, Effect, Layer } from "effect"
import { Paths } from "./service"

const STORAGE_DIRECTORY = ".s21"
const CACHE_DIRECTORY = "cache"
const CONFIG_FILE = "config.mjs"

const getStoragePaths = (storageRoot: string) =>
	Effect.gen(function* (_) {
		const path = yield* Path.Path
		const fs = yield* FileSystem.FileSystem

		const storage = path.join(storageRoot, STORAGE_DIRECTORY)
		const cache = path.join(storage, CACHE_DIRECTORY)
		const config = path.join(storage, CONFIG_FILE)

		yield* fs.makeDirectory(storage, { recursive: true })
		yield* fs.makeDirectory(cache, { recursive: true })

		return { storage, cache, config }
	})

export const PathsLive = Layer.effect(
	Paths,
	Effect.gen(function* (_) {
		yield* Effect.logDebug("Resolving paths")

		const home = yield* Config.string("S21HOME").pipe(
			Config.withDefault(os.homedir()),
		)

		const global = yield* getStoragePaths(home)

		const local = yield* getStoragePaths(process.cwd())

		yield* Effect.logDebug(
			"Resolved paths",
			`global:"${global}"`,
			`local:"${local}"`,
		)

		return { home, global, local }
	}),
)
