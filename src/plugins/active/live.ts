import { Configuration } from "@/configuration"
import { type LoadedPlugin, LoadedPlugins } from "@/plugins"
import { Effect, Layer } from "effect"
import { type ActivePlugin, ActivePlugins } from "./service"

const resolveEnabledPlugins = Effect.gen(function* (_) {
	const loadedPlugins = yield* LoadedPlugins
	const configuration = yield* Configuration

	const pluginFilters = configuration.general.plugins

	yield* Effect.logDebug("Resolving enabled plugins")

	const allEnabled = pluginFilters.enabled.includes("*")
	const allDisabled = pluginFilters.disabled.includes("*")

	if (allDisabled) {
		yield* Effect.logDebug(`All ${loadedPlugins.size} plugins are disabled`)

		return new Map<string, LoadedPlugin>()
	}

	if (allEnabled) {
		yield* Effect.logDebug(`All ${loadedPlugins.size} plugins are enabled`)

		return loadedPlugins
	}

	const enabledPlugins = new Map<string, LoadedPlugin>()

	for (const [id, plugin] of loadedPlugins) {
		if (
			pluginFilters.enabled.includes(id) &&
			!pluginFilters.disabled.includes(id)
		) {
			enabledPlugins.set(id, plugin)

			yield* Effect.logDebug(`Plugin ${plugin.name} (${id}) is enabled`)
		} else {
			yield* Effect.logDebug(`Plugin ${plugin.name} (${id}) is disabled`)
		}
	}

	yield* Effect.logDebug(`Resolved ${enabledPlugins.size} enabled plugins`)

	return enabledPlugins
})

export const ActivePluginsLive = Layer.effect(
	ActivePlugins,
	Effect.gen(function* (_) {
		const configuration = yield* Configuration

		const loadedPlugins = yield* resolveEnabledPlugins

		const activePlugins = new Map<string, ActivePlugin>()

		yield* Effect.logDebug("Activating plugins")

		for (const [id, plugin] of loadedPlugins) {
			yield* Effect.logDebug(`Activating plugin ${plugin.name} (${id})`)

			let contributions

			contributions = plugin.activate({
				configuration: configuration.plugins[plugin.name],
			})

			if (Effect.isEffect(contributions)) {
				contributions = yield* contributions
			}

			if (contributions) {
				yield* Effect.logDebug("Plugin contributions loaded")

				activePlugins.set(id, {
					...contributions,
					name: plugin.name,
					description: plugin.description,
				})
			}
		}

		yield* Effect.logDebug(
			`Activated plugins, loaded ${activePlugins.size} plugin contributions`,
		)

		return activePlugins
	}).pipe(Effect.withLogSpan("ActivePluginsLive")),
)
