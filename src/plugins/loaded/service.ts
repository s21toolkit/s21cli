import type { ConfiguredPlugin, Plugin } from "@/plugins"
import { Context } from "effect"

export type LoadedPlugin = ConfiguredPlugin & Plugin.Metadata

export class LoadedPlugins extends Context.Tag("LoadedPlugins")<
	LoadedPlugins,
	Map<string, LoadedPlugin>
>() {}
