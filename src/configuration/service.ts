import { Schema } from "@effect/schema"
import { Context } from "effect"

export class Configuration extends Context.Tag("Configuration")<
	Configuration,
	Configuration.FullConfiguration
>() {}

export namespace Configuration {
	export const GeneralConfiguration = Schema.Struct({
		credentials: Schema.Union(
			Schema.Struct({
				username: Schema.String,
				password: Schema.String,
			}),
			Schema.Struct({
				token: Schema.String,
			}),
		),
		plugins: Schema.Struct({
			enabled: Schema.Array(Schema.String).pipe(Schema.default([])),
			disabled: Schema.Array(Schema.String).pipe(Schema.default([])),
		}).pipe(Schema.optional()),
		cache: Schema.Struct({
			enabled: Schema.Boolean.pipe(Schema.default(true)),
			local: Schema.Boolean.pipe(Schema.default(false)),
			flat: Schema.Boolean.pipe(Schema.default(false)),
			zip: Schema.Boolean.pipe(Schema.default(true)),
		}).pipe(Schema.optional()),
		debug: Schema.Struct({
			logLevel: Schema.Literal(
				"all",
				"debug",
				"info",
				"warn",
				"error",
				"none",
			).pipe(Schema.default("error")),
		}).pipe(Schema.optional()),
	})

	export type GeneralConfiguration = Schema.Schema.Type<
		typeof GeneralConfiguration
	>

	export const FullConfiguration = Schema.Struct({
		general: GeneralConfiguration,
		plugins: Schema.Record(Schema.String, Schema.Unknown),
	})

	export type FullConfiguration = Schema.Schema.Type<typeof FullConfiguration>
}
