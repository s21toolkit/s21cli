import {
	NodeCommandExecutor,
	NodeFileSystem,
	NodePath,
	NodeRuntime,
} from "@effect/platform-node"
import { Console, Effect, LogLevel, Logger } from "effect"
import { ConfigurationLive } from "./configuration"
import { PathsLive } from "./paths"
import { ActivePlugins, LoadedPluginsLive, NpmPluginLoader } from "./plugins"
import { ActivePluginsLive } from "./plugins/active/live"

const program = Effect.gen(function* (_) {
	yield* Effect.logDebug("Starting program")

	const activePlugins = yield* ActivePlugins

	yield* Console.log(JSON.stringify(activePlugins, null, 2))
})

program.pipe(
	Effect.provide(ActivePluginsLive),
	Effect.provide(ConfigurationLive),
	Effect.provide(PathsLive),
	Effect.provide(LoadedPluginsLive),
	Effect.provide(NpmPluginLoader),
	Effect.provide(PathsLive),
	Effect.provide(NodePath.layer),
	Effect.provide(NodeCommandExecutor.layer),
	Effect.provide(NodeFileSystem.layer),
	Logger.withMinimumLogLevel(LogLevel.All),
	NodeRuntime.runMain,
)
