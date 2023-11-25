import { command, flag } from "cmd-ts"
import selfInstallScript from "@root/scripts/install_self.sh.txt"

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
	},
	handler(argv) {
		Bun.spawnSync({
			cmd: ["sh", "-c", selfInstallScript],
			env: {
				S21_INSTALL_UNSTABLE: argv.unstable.toString(),
			},
			stdio: ["inherit", "inherit", "inherit"],
		})
	},
})
