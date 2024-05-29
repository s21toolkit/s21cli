import { Context, Data, type Effect } from "effect"

export class PluginLoader extends Context.Tag("PluginLoader")<
	PluginLoader,
	{
		readonly installedPackages: readonly string[]

		readonly loadPackage: (
			id: string,
		) => Effect.Effect<unknown, PluginLoader.PackageNotFound>
	}
>() {}

export namespace PluginLoader {
	export class PackageNotFound extends Data.TaggedError("PackageNotFound") {}
}
