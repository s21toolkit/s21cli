import { Schema as S } from "@effect/schema"
import { Context } from "effect"

export class Configuration extends Context.Tag("Configuration")<
	Configuration,
	{
		general: Configuration.GeneralConfiguration
		plugins: Map<string, unknown>
	}
>() {}

export namespace Configuration {
	export const GeneralConfiguration = S.Struct({
		credentials: S.Union(
			S.Struct({
				username: S.String,
				password: S.String,
			}),
			S.Struct({
				token: S.String,
			}),
		),
		plugins: S.Struct({
			enabled: S.Array(S.String).pipe(S.optional({ default: () => ["*"] })),
			disabled: S.Array(S.String).pipe(S.optional({ default: () => [] })),
		}).pipe((self) =>
			self.pipe(S.optional({ default: () => self.make({}) })),
		),
		cache: S.Struct({
			enabled: S.Boolean.pipe(S.optional({ default: () => true })),
			local: S.Boolean.pipe(S.optional({ default: () => false })),
			flat: S.Boolean.pipe(S.optional({ default: () => false })),
			zip: S.Boolean.pipe(S.optional({ default: () => true })),
		}).pipe((self) =>
			self.pipe(S.optional({ default: () => self.make({}) })),
		),
	})

	export type GeneralConfiguration = S.Schema.Type<typeof GeneralConfiguration>

	export const FullConfiguration = S.Struct({
		general: GeneralConfiguration,
		plugins: S.Record(S.String, S.Unknown).pipe(
			S.optional({ default: () => ({}) }),
		),
	})

	export type FullConfiguration = S.Schema.Type<typeof FullConfiguration>
}
