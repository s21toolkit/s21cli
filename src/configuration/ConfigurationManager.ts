import type { Problems } from "arktype"
import { access, constants, open, readFile } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "node:path"
import process from "node:process"
import { parse } from "yaml"
import type { ConfigurationSchema } from "./ConfigurationSchema"
import {
	ConfigurationSource,
	resolveSchemaProperty,
} from "./ConfigurationSchema"

const YAML_CONFIGURATION_FILE_NAMES = [".s21.yaml", ".s21.yml"]
const JS_CONFIGURATION_FILE_NAMES = [
	".s21.js",
	".s21.cjs",
	".s21.mjs",
	".s21.ts",
	".s21.cts",
	".s21.mts",
]

// TODO: Decompose this, extract configuration loaders
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

	async #loadLocalFile() {
		return await this.#loadFileFrom(
			process.cwd(),
			ConfigurationSource.LocalFile,
		)
	}

	async #loadGlobalFile() {
		return await this.#loadFileFrom(homedir(), ConfigurationSource.GlobalFile)
	}

	async #loadFileFrom(directory: string, source: ConfigurationSource) {
		for (const configName of YAML_CONFIGURATION_FILE_NAMES) {
			const filename = join(directory, configName)

			await this.#loadYamlFile(filename, source)
		}

		for (const configName of JS_CONFIGURATION_FILE_NAMES) {
			const filename = join(directory, configName)

			// eslint-disable-next-line no-bitwise
			await this.#loadJSFile(filename, source | ConfigurationSource.JSFile)
		}
	}

	async #loadYamlFile(filename: string, source: ConfigurationSource) {
		if (!(await this.#validateFilename(filename))) {
			return
		}

		const content = (await readFile(filename)).toString()

		const data = parse(content) as unknown

		await this.#loadFileData(data, source, filename)
	}

	async #loadJSFile(filename: string, source: ConfigurationSource) {
		if (!(await this.#validateFilename(filename))) {
			return
		}

		const data = (await import(filename))?.default as unknown

		await this.#loadFileData(data, source, filename)
	}

	async #validateFilename(filename: string) {
		const result = await access(filename, constants.R_OK)
			.then(() => true)
			.catch(() => false)

		return result
	}

	async #loadFileData(
		data: unknown,
		source: ConfigurationSource,
		filename: string,
	) {
		if (!data || typeof data != "object") {
			console.error(`Configuration problems detected in ${filename}:`)
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
				this.schema[key]!,
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
