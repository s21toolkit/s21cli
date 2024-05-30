import type { Plugin } from "@/plugins"

export function definePlugin<TPlugin extends Plugin>(plugin: TPlugin) {
	return plugin
}

export type { Plugin } from "@/plugins"
