import { createRequire } from "node:module"
import { Command, CommandExecutor, FileSystem, Path } from "@effect/platform"
import { Effect, Layer } from "effect"
import { PluginLoader } from "./service"

const resolveNpmGlobalRoot = Effect.gen(function* (_) {
	const shell = yield* CommandExecutor.CommandExecutor

	yield* Effect.logDebug("Resolving global NPM root")

	const globalModuleRoot = yield* Command.make("npm", "root", "-g").pipe(
		shell.string,
		Effect.map((output) => output.trim()),
	)

	yield* Effect.logDebug(`Global NPM root: ${globalModuleRoot}`)

	return globalModuleRoot
})

export const NpmPluginLoader = Layer.effect(
	PluginLoader,
	Effect.gen(function* (_) {
		const fs = yield* FileSystem.FileSystem
		const path = yield* Path.Path

		const npmGlobalRoot = yield* resolveNpmGlobalRoot

		yield* Effect.logDebug("Fetching installed packages")

		const installedPackages = yield* fs
			.readDirectory(npmGlobalRoot)
			.pipe(
				Effect.map((directories) =>
					directories.map((directory) => path.basename(directory)),
				),
			)

		yield* Effect.logDebug(
			`Found ${installedPackages.length} installed packages`,
		)

		const requirePackage = createRequire(npmGlobalRoot)

		return {
			installedPackages,
			loadPackage: (id: string) =>
				Effect.gen(function* (_) {
					try {
						yield* Effect.logDebug(`Loading package ${id}`)

						const value: unknown = requirePackage(id)

						yield* Effect.logDebug(`Loaded package ${id}`)

						return value
					} catch (error) {
						yield* Effect.logError(`Failed to load package ${id}`)

						yield* new PluginLoader.PackageNotFound()
					}
				}),
		}
	}).pipe(Effect.withLogSpan("NpmPluginLoader")),
)
