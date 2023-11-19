import { getRemote } from "./getRemote"

export function getNodeCode() {
	const remote = getRemote()

	const { pathname } = new URL(remote)

	const project = pathname.split("/").at(-1)

	if (!project) {
		throw new Error("Failed to parse remote repo URL")
	}

	const code = project.split("_")[0]!

	return code
}
