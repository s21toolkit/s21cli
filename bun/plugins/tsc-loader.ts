import { readFileSync } from "fs"
import type { BunPlugin } from "bun"
import * as ts from "typescript"

type PluginOptions = {
	tsconfig: string
}

export function tsc(options: PluginOptions): BunPlugin {
	const tsconfig = ts.readConfigFile(options.tsconfig, (filename) =>
		readFileSync(filename, "utf-8"),
	)

	if (tsconfig.error) {
		throw new Error(`TSConfig error: ${tsconfig.error.messageText}`, {
			cause: tsconfig.error,
		})
	}

	return {
		name: "tsc-loader",
		target: "bun",
		setup(build) {
			build.onLoad({ filter: /\.(ts|cts|mts|tsx)$/ }, async ({ path }) => {
				const file = Bun.file(path)

				const text = await file.text()

				const output = ts.transpileModule(text, {
					fileName: path,
					compilerOptions: {
						...tsconfig.config.compilerOptions,
						noEmit: false,
						declaration: false,
						target: ts.ScriptTarget.ES2022,
						moduleResolution: ts.ModuleResolutionKind.Bundler,
						module: ts.ModuleKind.ESNext,
						noEmitHelpers: false,
						importHelpers: false,
						jsx: ts.JsxEmit.Preserve,
					},
				})

				return {
					loader: "js",
					contents: output.outputText,
				}
			})
		},
	}
}
