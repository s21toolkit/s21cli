import { command } from "cmd-ts"
import selfInstallScript from "@root/scripts/install_self.sh.txt"

export const updateCommand = command({
	name: "update",
	description:
		"Pulls latest install script from the repo and installs latest binaries",
	args: {},
	handler() {
		Bun.spawnSync({
			cmd: ["sh", "-c", selfInstallScript],
			stdio: ["inherit", "inherit", "inherit"],
		})
	},
})
