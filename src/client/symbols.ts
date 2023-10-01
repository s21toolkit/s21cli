import * as ffi from "bun:ffi"
import * as path from "node:path"

const libraryBasePath = `../../lib/client/build`

function getLibraryURL() {
	const { platform, arch } = process

	const normalizedArch = arch == "x64" ? "amd64" : arch

	return path.resolve(
		import.meta.dir,
		libraryBasePath,
		`libclient-${platform}-${normalizedArch}.${ffi.suffix}`,
	)
}

const libraryLocation = getLibraryURL()

const t = ffi.FFIType

export const { symbols } = ffi.dlopen(libraryLocation, {
	ClientCreate: {
		args: [t.cstring, t.cstring],
		returns: t.uint64_t,
	},
	ClientDestroy: {
		args: [t.uint64_t],
		returns: t.void,
	},
	ClientTestCredentials: {
		args: [t.uint64_t],
		returns: t.int,
	},
	TestCredentials: {
		args: [t.cstring, t.cstring],
		returns: t.int,
	},
})
