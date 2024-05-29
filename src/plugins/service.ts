import { Context } from "effect"
import type { ConfiguredPlugin, Plugin } from "./plugin"

export class Plugins extends Context.Tag("Plugins")<
	Plugins,
	Map<string, ConfiguredPlugin & Plugin.Metadata>
>() {}
