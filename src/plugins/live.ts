import { Effect, Layer } from "effect"
import { PluginLoader } from "./loader/service"
import type { ConfiguredPlugin, Plugin } from "./plugin"
import { Plugins } from "./service"

const PLUGIN_PACKAGE_NAME_PATTERN =
	/^(@s21toolkit\/cli-plugin-|s21cli-plugin-)(?<pluginName>[\w\d\-\_)\.]+)$/

function setupPlugin(plugin: Plugin) {
	return plugin({})
}

export const PluginsLive = Layer.effect(
	Plugins,
	Effect.gen(function* (_) {
		const loader = yield* PluginLoader

		const plugins = new Map<string, ConfiguredPlugin & Plugin.Metadata>()

		yield* Effect.logDebug("Loading plugin packages")

		for (const installedPackage of loader.installedPackages) {
			const match = installedPackage.match(PLUGIN_PACKAGE_NAME_PATTERN)

			if (!match) {
				continue
			}

			// biome-ignore lint/style/noNonNullAssertion: guaranteed to exist
			const name = match.groups?.pluginName!

			yield* Effect.logDebug(
				`Loading plugin package ${installedPackage} as ${name}`,
			)

			try {
				const unsafePlugin = (yield* loader.loadPackage(
					installedPackage,
				)) as Plugin

				const configuredPlugin = setupPlugin(unsafePlugin)

				yield* Effect.logDebug(
					`Loaded plugin package ${installedPackage} as ${name}`,
				)

				plugins.set(installedPackage, {
					...configuredPlugin,
					name,
				})
			} catch (error) {
				yield* Effect.logError(
					`Failed to load plugin package ${installedPackage}: ${error}`,
				)
			}
		}

		return plugins
	}),
)
