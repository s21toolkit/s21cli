import { homedir } from "node:os"
import { resolve } from "node:path"
import { Configuration } from "./configuration"

const configuredHomedir = Configuration.optional.HOME

export namespace Paths {
	export const S21 = ".s21"

	export const HOME_DEFAULT = resolve(homedir(), S21)

	export const HOME = resolve(configuredHomedir ?? HOME_DEFAULT)
}
