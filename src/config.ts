import { existsSync, mkdirSync, readFileSync } from "fs"
import { join } from "path"
import env from "env-var"

function getConfigDirectory() {
    // TODO: windows
    const path = env.get("HOME").required().asString()
    const config = join(path, ".s21")

    return config
}

class ConfigFileBase {
    #path: string

    constructor(name: string) {
        this.#path = join(getConfigDirectory(), name)
    }

    protected create() {
        const dir = getConfigDirectory()
        if(!existsSync(dir))
            mkdirSync(dir)

        if(!existsSync(this.#path)) {
            const w = Bun.file(this.#path).writer()
    
            w.write(JSON.stringify(this))
    
            w.end()
        }
    }

    protected loadFromEnv() {
        for(const key in this) {
            const val = env.get(`S21_${String(key).toUpperCase()}`).asString()
    
            if(val) this[key] = val as any
        }
    }

    protected loadFromFile() {
        this.create()
        Object.assign(this, JSON.parse(readFileSync(this.#path).toString()))
    }
}

class CredentialsFile extends ConfigFileBase {
    username: string = ""
    password: string = ""

    constructor() {
        super("credentials.json")
        this.loadFromFile()
        this.loadFromEnv()
    }

    check() {
        return !!this.username && !!this.password
    }
}

class ConfigFile extends ConfigFileBase {
    pr_directory: string = getConfigDirectory()
    clone_depth: number = 1

    constructor() {
        super("config.json")
        this.loadFromFile()
        this.loadFromEnv()
    }
}


type MergedConfig = ConfigFile & CredentialsFile


function loadCredentials() {  
    const cretentials = new CredentialsFile()

    if(!cretentials.check()) {
        console.error("No credentials resolved from config or env.")
        process.exit(1)
    }

    return cretentials
}

function loadConfig() {
    return new ConfigFile()
}

function loadMergedConfig(): MergedConfig {
    return {
        ...loadCredentials(),
        ...loadConfig()
    } as MergedConfig
}

export const Config = loadMergedConfig()