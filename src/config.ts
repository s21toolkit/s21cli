import { existsSync, mkdirSync } from "fs"
import { join } from "path"
import env from "env-var"
import { createJsonFileIfNotExists } from "./utils"

type CredentialsFile = {
    S21_USERNAME: string | null,
    S21_PASSWORD: string | null,
}

type ConfigFile = {
    PR_DIRECTORY: string,
}

function getEnvOrObject<T>(key: keyof T, obj: T) {
    return env.get(key.toString()).asString() || obj[key]
}

function getConfigDirectory() {
    // TODO: windows
    const path = env.get("HOME").required().asString()
    const config = join(path, ".s21")

    return config
}

function getOrCreateConfigDirectoryIfNotExists() {
    const config = getConfigDirectory()

    if(!existsSync(config))
        mkdirSync(config)

    return config
}

function getFilePathInConfigDirectory(name: string) {
    return join(getOrCreateConfigDirectoryIfNotExists(), name)
}

function tryLoadFromEnv<T>(json: T) {
    for(const key in json) {
        const val = env.get(key).asString()

        if(val) json[key] = val as any
    }

    return json
}

async function readOrInitFileInConfigDirectory<T>(name: string, init: T): Promise<T> {
    return await Bun.file(createJsonFileIfNotExists(getFilePathInConfigDirectory(name), init)).json()
}

export async function loadCredentials() {  
    const json = await readOrInitFileInConfigDirectory<CredentialsFile>("credentials.json", {
        S21_USERNAME: null,
        S21_PASSWORD: null
    })

    const resolved = tryLoadFromEnv(json)

    if(!resolved.S21_PASSWORD || !resolved.S21_USERNAME)
        throw "No credentials resolved from config or env."

    return resolved
}

export async function loadConfig() {
    const json = await readOrInitFileInConfigDirectory<ConfigFile>("config.json", {
        PR_DIRECTORY: getConfigDirectory()
    })

    return tryLoadFromEnv(json)
}

export async function loadMergedConfig(): Promise<ConfigFile & CredentialsFile> {
    return {
        ...(await loadCredentials()),
        ...(await loadConfig())
    }
}