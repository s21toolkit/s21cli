import {
	NodeCommandExecutor,
	NodeFileSystem,
	NodePath,
	NodeRuntime,
} from "@effect/platform-node"
import { Console, Effect } from "effect"
import { Configuration, ConfigurationLive } from "./configuration"
import { PathsLive } from "./paths"
import { NpmPluginLoader, PluginsLive } from "./plugins"

const program = Effect.gen(function* (_) {
	yield* Effect.logDebug("Starting program")

	yield* Effect.logDebug("Loading configuration")

	const configuration = yield* Configuration

	yield* Effect.logDebug("Loaded configuration")

	yield* Console.log(JSON.stringify(configuration, null, 2))
})

program.pipe(
	Effect.provide(ConfigurationLive),
	Effect.provide(PathsLive),
	Effect.provide(PluginsLive),
	Effect.provide(NpmPluginLoader),
	Effect.provide(PathsLive),
	Effect.provide(NodePath.layer),
	Effect.provide(NodeCommandExecutor.layer),
	Effect.provide(NodeFileSystem.layer),
	NodeRuntime.runMain,
)
