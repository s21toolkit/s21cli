import {
	NodeCommandExecutor,
	NodeFileSystem,
	NodePath,
	NodeRuntime,
} from "@effect/platform-node"
import { Console, Effect } from "effect"
import { ConfigurationLive } from "./configuration"
import { LoggerLive } from "./logger/live"
import { PathsLive } from "./paths"
import { ActivePlugins, LoadedPluginsLive, NpmPluginLoader } from "./plugins"
import { ActivePluginsLive } from "./plugins/active/live"

const program = Effect.gen(function* (_) {
	yield* Effect.logDebug("Starting program")

	const activePlugins = yield* ActivePlugins

	yield* Console.log("Active plugins", JSON.stringify(activePlugins, null, 2))
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
	Effect.provide(LoggerLive),
	NodeRuntime.runMain,
)
