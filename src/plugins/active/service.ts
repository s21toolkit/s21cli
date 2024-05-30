import type { Plugin } from "@/plugins"
import { Context } from "effect"

export type ActivePlugin = Plugin.Contributions & Plugin.Metadata

export class ActivePlugins extends Context.Tag("ActivePlugins")<
	ActivePlugins,
	Map<string, ActivePlugin>
>() {}
