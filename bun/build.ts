import { resolve } from "node:path"
import process from "node:process"
import { mustRun } from "./shared"

const { platform, arch } = process

const entrypoint = resolve("bin/index.ts")
const outfile = resolve(`build/s21-${platform}-${arch}`)

mustRun("bun", "build", "--compile", entrypoint, "--outfile", outfile)
