import { Paths } from "@/paths"
import { Plugins } from "@/plugins"
import { type ParseResult, Schema } from "@effect/schema"
// biome-ignore lint/suspicious/noShadowRestrictedNames: it's fine
import { Data, Effect, Function, Layer } from "effect"
import { merge } from "merge-anything"
import { Configuration } from "./service"

export class ConfigLoadingError extends Data.TaggedError("ConfigLoadingError")<{
	cause: unknown
}> {}

export class ConfigFormatError extends Data.TaggedError("ConfigFormatError")<{
	cause: ParseResult.ParseError
}> {
	override toString() {
		return this.cause.toString()
	}
}

class LoadedConfig extends Data.TaggedClass("LoadedConfig") {
	constructor(readonly value: unknown) {
		super()
	}
}

const importScript = (path: string) =>
	Effect.gen(function* (_) {
		yield* Effect.logDebug(`Importing ${path}`)

		const result = yield* Effect.tryPromise({
			try: async (): Promise<unknown> =>
				import(path).then((value) => value?.default),
			catch: (cause) => new ConfigLoadingError({ cause }),
		}).pipe(
			Effect.map((value) => new LoadedConfig(value)),
			Effect.merge,
		)

		if (result._tag === "LoadedConfig") {
			yield* Effect.logDebug(`Imported ${path}`)
		} else {
			yield* Effect.logDebug(`Failed to import ${path}`, result.cause)
		}

		return result
	})

const loadConfigs = (paths: string[]) =>
	Effect.gen(function* (_) {
		const results = yield* Effect.all(paths.map(importScript))

		const errors = results.filter(
			(value): value is ConfigLoadingError =>
				value._tag === "ConfigLoadingError",
		)

		const values = results.filter(
			(value): value is LoadedConfig => value._tag === "LoadedConfig",
		)

		return { values, errors }
	})

const validatePluginConfiguration = (
	pluginCponfiguration: Record<string, unknown>,
) =>
	Effect.gen(function* (_) {
		const plugins = yield* Plugins

		for (const [id, plugin] of plugins) {
			yield* Effect.logDebug(
				`Validating plugin configuration ${plugin.name} (${id})`,
			)

			const schema = plugin.configurationSchema ?? Schema.Unknown

			const rawPluginConfiguration = pluginCponfiguration[plugin.name]

			yield* Function.pipe(
				rawPluginConfiguration,
				Schema.decodeUnknown(schema),
				Effect.mapError((cause) => new ConfigFormatError({ cause })),
			)

			yield* Effect.logDebug(
				`Decoded plugin configuration ${plugin.name} (${id})`,
			)
		}
	})

export const ConfigurationLive = Layer.effect(
	Configuration,
	Effect.gen(function* (_) {
		const paths = yield* Paths

		yield* Effect.logDebug("Loading configuration")

		const loadedConfigs = yield* loadConfigs([
			paths.global.config,
			paths.local.config,
		])

		if (loadedConfigs.values.length === 0) {
			yield* Effect.logDebug("No configuration found")

			// biome-ignore lint/style/noNonNullAssertion: expect non-nullable
			yield* loadedConfigs.errors[0]!
		}

		yield* Effect.logDebug("Loaded configuration")

		const [rawGlobalConfig, ...rawLocalConfigs] = loadedConfigs.values.map(
			({ value }) => value,
		)

		const rawConfiguration = merge(rawGlobalConfig, ...rawLocalConfigs)

		yield* Effect.logDebug(
			"Merged configuration",
			JSON.stringify(rawConfiguration, null, 2),
		)

		yield* Effect.logDebug("Validating configuration")

		const configuration = yield* Function.pipe(
			rawConfiguration,
			Schema.decodeUnknown(Configuration.FullConfiguration),
			Effect.mapError((cause) => new ConfigFormatError({ cause })),
		)

		yield* Effect.logDebug("Decoded configuration")

		yield* validatePluginConfiguration(configuration.plugins)

		return configuration
	}),
)
