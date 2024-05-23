import type { Type } from "arktype"

export enum ConfigurationSource {
	Environment = 1 << 0,
	LocalFile = 1 << 1,
	GlobalFile = 1 << 2,

	File = LocalFile | GlobalFile,
	Any = Environment | File,
}

export type ConfigurationSchemaProperty =
	| Type<NonNullable<unknown>>
	| readonly [Type<NonNullable<unknown>>, ConfigurationSource?]

export function resolveSchemaProperty(schema: ConfigurationSchemaProperty) {
	const isArray = Array.isArray(schema)

	return {
		schema: isArray ? schema[0] : schema,
		source: isArray
			? schema[1] ?? ConfigurationSource.Any
			: ConfigurationSource.Any,
	}
}

export type ConfigurationSchema = Record<string, ConfigurationSchemaProperty>

export namespace ConfigurationSchema {
	export type PropertyType<
		TSchema extends ConfigurationSchema,
		TKey extends keyof TSchema,
	> = PropertyOutputType<TSchema, TKey>

	// prettier-ignore
	export type PropertyInputType<
		TSchema extends ConfigurationSchema,
		TKey extends keyof TSchema,
	> = TSchema[TKey] extends Type
		? TSchema[TKey]["inferIn"]
		: TSchema[TKey] extends [Type, ConfigurationSource?]
			? TSchema[TKey][0]["inferIn"]
			: never

	export type PropertyOutputType<
		TSchema extends ConfigurationSchema,
		TKey extends keyof TSchema,
	> = TSchema[TKey] extends Type
		? TSchema[TKey]["infer"]
		: TSchema[TKey] extends [Type, ConfigurationSource?]
			? TSchema[TKey][0]["infer"]
			: never

	export type ObjectType<TSchema extends ConfigurationSchema> =
		ObjectOutputType<TSchema>

	export type ObjectInputType<TSchema extends ConfigurationSchema> = {
		[K in keyof TSchema]: PropertyInputType<TSchema, K>
	}

	export type ObjectOutputType<TSchema extends ConfigurationSchema> = {
		[K in keyof TSchema]: PropertyOutputType<TSchema, K>
	}
}
