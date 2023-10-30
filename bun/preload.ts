import { resolve } from "path"
import { tsc } from "./plugins/tsc-loader"

Bun.plugin(tsc({ tsconfig: resolve(import.meta.dir, "../tsconfig.json") }))
