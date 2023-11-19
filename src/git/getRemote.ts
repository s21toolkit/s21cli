export async function getRemote() {
	const proc = Bun.spawn(["git", "remote", "get-url", "origin"])
	await proc.exited

	if(proc.exitCode != 0) {
		throw new Error("Failed to get origin remote.")
	}

	return await new Response(proc.stdout).text()
}
