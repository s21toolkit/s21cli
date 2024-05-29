import type { Command } from "@effect/cli"
import type { Schema } from "@effect/schema"

export namespace Plugin {
	// biome-ignore lint/suspicious/noExplicitAny: invariant
	export type Schema = Schema.Schema<any, any, never>

	export type SetupContext = Record<never, unknown>

	export type ActivationContext<TSchema extends Schema = Schema> = {
		configuration: TSchema
	}

	export type Contributions = {
		// biome-ignore lint/suspicious/noExplicitAny: invariant
		command: Command.Command<any, any, any, any>
	}

	export type Metadata = {
		name: string
		description?: string
	}
}

export type ConfiguredPlugin<TSchema extends Plugin.Schema = Plugin.Schema> = {
	configurationSchema?: TSchema
	activate: (
		context: Plugin.ActivationContext<TSchema>,
	) => Plugin.Contributions | undefined
}

export type Plugin<TSchema extends Plugin.Schema = Plugin.Schema> = (
	setupContext: Plugin.SetupContext,
) => ConfiguredPlugin<TSchema>
