import { existsSync, mkdirSync } from "fs"
import { join } from "path"
import env from "env-var"
import { createJsonFileIfNotExists } from "./utils"

type CredentialsFile = {
    S21_USERNAME: string,
    S21_PASSWORD: string,
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

async function readOrInitFileInConfigDirectory(name: string, init: unknown) {
    return await Bun.file(createJsonFileIfNotExists(getFilePathInConfigDirectory(name), init)).json()
}

export async function loadCredentials(): Promise<CredentialsFile> {  
    const json = await readOrInitFileInConfigDirectory("credentials.json", {
        S21_USERNAME: null,
        S21_PASSWORD: null
    }) as CredentialsFile

    return {
        S21_USERNAME: getEnvOrObject("S21_USERNAME", json),
        S21_PASSWORD: getEnvOrObject("S21_PASSWORD", json)
    }
}

export async function loadConfig(): Promise<ConfigFile> {
    const json = await readOrInitFileInConfigDirectory("config.json", {
        PR_DIRECTORY: getConfigDirectory()
    }) as ConfigFile

    return {
        PR_DIRECTORY: getEnvOrObject("PR_DIRECTORY", json),
    }
}

export async function loadMergedConfig(): Promise<ConfigFile & CredentialsFile> {
    return {
        ...(await loadCredentials()),
        ...(await loadConfig())
    }
}