import type { Command } from "@effect/cli"
import type { Schema } from "@effect/schema"
import type { Effect } from "effect"

type MaybeEffect<A, E = never, R = never> = A | Effect.Effect<A, E, R>

export namespace Plugin {
	// biome-ignore lint/suspicious/noExplicitAny: invariant
	export type Schema = Schema.Schema<any, any, never>

	export type SetupContext = Record<never, unknown>

	export type ActivationContext<TSchema extends Schema = Schema> = {
		configuration: Schema.Schema.Type<TSchema>
	}

	export type Contributions = {
		/**
		 * Command to be added to the CLI
		 */
		// biome-ignore lint/suspicious/noExplicitAny: invariant
		command?: Command.Command<any, never, unknown, unknown> | undefined
	}

	export type Metadata = {
		name: string
		description?: string | undefined
	}
}

export type ConfiguredPlugin<TSchema extends Plugin.Schema = Plugin.Schema> = {
	configurationSchema?: TSchema | undefined
	activate: (
		context: Plugin.ActivationContext<TSchema>,
	) => MaybeEffect<Plugin.Contributions | undefined>
}

export type Plugin<TSchema extends Plugin.Schema = Plugin.Schema> = (
	setupContext: Plugin.SetupContext,
) => MaybeEffect<ConfiguredPlugin<TSchema>>
