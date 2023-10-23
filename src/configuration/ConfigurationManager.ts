import type { Problems } from "arktype"
import { homedir } from "node:os"
import { join } from "node:path"
import { parse } from "yaml"
import type { ConfigurationSchema } from "./ConfigurationSchema"
import {
	ConfigurationSource,
	resolveSchemaProperty,
} from "./ConfigurationSchema"

const CONFIGURATION_FILE_NAME = ".s21.yaml"

export class ConfigurationManager<const TSchema extends ConfigurationSchema> {
	#configuration: Partial<ConfigurationSchema.ObjectType<TSchema>> = {}

	constructor(readonly schema: TSchema) {}

	set<TKey extends keyof TSchema>(
		property: TKey,
		value: ConfigurationSchema.PropertyType<TSchema, TKey>,
	) {
		this.#configuration[property] = value
	}

	get<TKey extends keyof TSchema>(property: TKey) {
		this.#assertConfigured(property)

		return this.#configuration[property]!
	}

	tryGet<TKey extends keyof TSchema>(property: TKey) {
		return this.#configuration[property]
	}

	get required() {
		type RequiredConfigurationProxy = ConfigurationSchema.ObjectType<TSchema>

		return new Proxy(this, {
			get(target, property) {
				return target.get(property as keyof TSchema)
			},
		}) as Readonly<RequiredConfigurationProxy>
	}

	get optional() {
		type OptionalConfigurationProxy = Partial<
			ConfigurationSchema.ObjectType<TSchema>
		>

		return new Proxy(this, {
			get(target, property) {
				return target.tryGet(property as keyof TSchema)
			},
		}) as Readonly<OptionalConfigurationProxy>
	}

	#assertConfigured<TKey extends keyof TSchema>(property: TKey) {
		if (property in this.#configuration) {
			return
		}

		throw new Error(`Missing required configuration: ${String(property)}`)
	}

	async load() {
		await this.#loadGlobalFile()
		await this.#loadLocalFile()
		await this.#loadEnv()
	}

	async #loadGlobalFile() {
		const filename = join(homedir(), CONFIGURATION_FILE_NAME)

		await this.#loadFile(filename, ConfigurationSource.GlobalFile)
	}

	async #loadLocalFile() {
		const filename = join(process.cwd(), CONFIGURATION_FILE_NAME)

		await this.#loadFile(filename, ConfigurationSource.LocalFile)
	}

	async #loadFile(filename: string, source: ConfigurationSource) {
		const file = Bun.file(filename)

		if (!(await file.exists())) {
			return
		}

		const content = await file.text()

		const data = parse(content) as unknown

		if (!data || typeof data != "object") {
			console.error(`Configuration problems detected in ${file.name}:`)
			console.error(`\t- Invalid configuration root, must be an object`)
			return
		}

		const problems = this.#loadObject(data, source)

		this.#logProblems(filename, problems)
	}

	#logProblems(source: string, problems: Map<string, Problems>) {
		if (problems.size === 0) {
			return
		}

		console.error(`Configuration problems detected in ${source}:`)

		for (const [property, problemList] of problems) {
			console.error(`\t${property}:`)

			for (const problem of problemList) {
				console.error(`\t\t- ${problem.message}`)
			}

			console.groupEnd()
		}
	}

	#loadEnv() {
		const envProperties = Object.fromEntries(
			Object.entries(process.env)
				.filter(([key]) => key.startsWith("S21_"))
				.map(([key, value]) => [key.replace("S21_", ""), value]),
		)

		const problems = this.#loadObject(
			envProperties,
			ConfigurationSource.Environment,
		)

		this.#logProblems("process environment", problems)
	}

	#loadObject(configuration: object, source: ConfigurationSource) {
		const configurationProblems = new Map<string, Problems>()

		for (const [key, value] of Object.entries(configuration)) {
			if (!(key in this.schema)) {
				continue
			}

			const { schema, source: allowedSource } = resolveSchemaProperty(
				this.schema[key],
			)

			// eslint-disable-next-line no-bitwise
			if (!(allowedSource & source)) {
				continue
			}

			const { data, problems } = schema(value)

			if (problems) {
				configurationProblems.set(key, problems)

				continue
			}

			this.set(
				key,
				data as ConfigurationSchema.PropertyType<TSchema, typeof key>,
			)
		}

		return configurationProblems
	}
}
