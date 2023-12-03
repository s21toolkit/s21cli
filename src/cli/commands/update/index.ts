import { command, flag } from "cmd-ts"
import { stripIndents } from "common-tags"
import { spawnSync } from "node:child_process"
import process from "node:process"
import selfInstallScript from "@root/scripts/install_self.sh.txt"
import { IS_BINARY_BUILD } from "@/build"
import { Paths } from "@/paths"

export const updateCommand = command({
	name: "update",
	description:
		"Pulls latest install script from the repo and installs latest binaries",
	args: {
		unstable: flag({
			long: "unstable",
			short: "u",
			description: "Allow installing unstable (prerelease) versions",
			defaultValue: () => false,
		}),
		force: flag({
			long: "force",
			short: "f",
			description: "Force your way through the warnings",
			defaultValue: () => false,
		}),
	},
	handler(argv) {
		if (!IS_BINARY_BUILD && !argv.force) {
			console.warn(stripIndents`
				This command is meant for updating standalone binary installs, which is not your case.

				For updating npm installs use:
				> npm update --global @s21toolkit/cli

				If you still wish to proceed use \`-f\` flag to disable this warning.
			`)

			return
		}

		spawnSync("sh", ["-c", selfInstallScript], {
			env: {
				...process.env,
				S21_INSTALL_UNSTABLE: argv.unstable.toString(),
				S21_HOME: Paths.HOME,
			},
			stdio: "inherit",
		})
	},
})
