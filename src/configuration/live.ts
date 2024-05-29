import { Paths } from "@/paths"
import { Plugins } from "@/plugins"
import { type ParseResult, Schema } from "@effect/schema"
// biome-ignore lint/suspicious/noShadowRestrictedNames: it's fine
import { Data, Effect, Function, Layer } from "effect"
import { merge } from "merge-anything"
import { Configuration } from "./service"

export class ConfigLoadingError extends Data.TaggedError("ConfigLoadingError") {
	constructor(override readonly cause: unknown) {
		super()
	}
}

export class ConfigFormatError extends Data.TaggedError("ConfigFormatError") {
	constructor(override readonly cause: ParseResult.ParseError) {
		super()
	}
}

const importScript = (path: string) =>
	Effect.tryPromise({
		try: async (): Promise<unknown> => import(path),
		catch: (error) => new ConfigLoadingError(error),
	})

export const ConfigurationLive = Layer.effect(
	Configuration,
	Effect.gen(function* (_) {
		const paths = yield* Paths
		const plugins = yield* Plugins

		yield* Effect.logDebug(
			`Loading global configuration: ${paths.global.config}`,
		)

		const rawGlobalConfiguration = yield* importScript(paths.global.config)

		yield* Effect.logDebug("Loaded global configuration")

		const rawLocalConfiguration = yield* importScript(paths.local.config)

		yield* Effect.logDebug("Loaded local configuration")

		const rawConfiguration = merge(
			rawGlobalConfiguration,
			rawLocalConfiguration,
		)

		yield* Effect.logDebug("Merged configuration")

		yield* Effect.logDebug("Validating configuration")

		const configuration = yield* Function.pipe(
			rawConfiguration,
			Schema.decodeUnknown(Configuration.FullConfiguration),
			Effect.mapError((error) => new ConfigFormatError(error)),
		)

		yield* Effect.logDebug("Decoded configuration")

		for (const [id, plugin] of plugins) {
			yield* Effect.logDebug(
				`Validating plugin configuration ${plugin.name} (${id})`,
			)

			const schema = plugin.configurationSchema ?? Schema.Unknown

			const rawPluginConfiguration = configuration.plugins[plugin.name]

			yield* Function.pipe(
				rawPluginConfiguration,
				Schema.decodeUnknown(schema),
				Effect.mapError((error) => new ConfigFormatError(error)),
			)

			yield* Effect.logDebug(
				`Decoded plugin configuration ${plugin.name} (${id})`,
			)
		}

		return configuration
	}),
)
