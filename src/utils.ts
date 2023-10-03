import { existsSync } from "fs"

export function createJsonFileIfNotExists(file: string, defaults: unknown) {
    if(!existsSync(file)) {
        const w = Bun.file(file).writer()

        w.write(JSON.stringify(defaults))

        w.end()
    }

    return file
}