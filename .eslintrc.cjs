const { configure, presets } = require("eslint-kit")

module.exports = configure({
	allowDebug: process.env.NODE_ENV !== "production",

	presets: [
		presets.imports(),
		presets.node(),
		presets.prettier(),
		presets.typescript(),
	],

	extend: {
		plugins: ["no-relative-import-paths", "require-node-import-prefix"],

		rules: {
			"no-relative-import-paths/no-relative-import-paths": [
				"error",
				{
					allowSameFolder: true,
					rootDir: "src",
					prefix: "@",
				},
			],
			"@typescript-eslint/consistent-type-definitions": ["error", "type"],
			"@typescript-eslint/no-explicit-any": ["error"],
			"@typescript-eslint/ban-types": [
				"error",
				{
					extendDefaults: true,
					types: {
						"{}": false,
					},
				},
			],
			"@typescript-eslint/no-namespace": ["off"],
			"@typescript-eslint/consistent-type-imports": [
				"error",
				{
					prefer: "type-imports",
					disallowTypeAnnotations: false,
				},
			],
			"require-node-import-prefix/no-empty-import-prefix": "error",
		},
	},
})
