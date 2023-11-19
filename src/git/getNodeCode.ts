import { getRemote } from ".";

export async function getNodeCode() {
	return new URL(await getRemote()).pathname.split("/")[2]!.split("_")[0]!
}