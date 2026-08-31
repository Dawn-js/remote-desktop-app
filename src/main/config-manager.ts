import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { v4 as uuidv4 } from 'uuid'
import keytar from 'keytar'

export interface ServerConfig {
  id: string
  name: string
  group: string
  host: string
  port: number
  username: string
  authMethod: 'password' | 'key' | 'agent'
  password?: string
  privateKeyPath?: string
  passphrase?: string
  keepAlive?: boolean
  keepAliveInterval?: number
  description?: string
  createdAt: number
  updatedAt: number
}

export interface AppConfig {
  servers: ServerConfig[]
  groups: string[]
  settings: {
    theme: 'dark' | 'light' | 'system'
    fontSize: number
    fontFamily: string
    cursorStyle: 'block' | 'underline' | 'bar'
    scrollback: number
    bellSound: boolean
    confirmClose: boolean
    autoReconnect: boolean
    startupBehavior: 'new-tab' | 'restore' | 'none'
  }
}

const DEFAULT_CONFIG: AppConfig = {
  servers: [],
  groups: ['Local', 'Cloud', 'Production', 'Development'],
  settings: {
    theme: 'dark',
    fontSize: 14,
    fontFamily: 'Fira Code',
    cursorStyle: 'block',
    scrollback: 10000,
    bellSound: false,
    confirmClose: true,
    autoReconnect: true,
    startupBehavior: 'restore'
  }
}

export class ConfigManager {
  private configPath: string
  private config: AppConfig

  constructor(configPath: string) {
    this.configPath = configPath
    this.config = this.loadConfig()
  }

  private loadConfig(): AppConfig {
    try {
      if (existsSync(this.configPath)) {
        const data = readFileSync(this.configPath, 'utf-8')
        const parsed = JSON.parse(data)
        return { ...DEFAULT_CONFIG, ...parsed, settings: { ...DEFAULT_CONFIG.settings, ...parsed.settings } }
      }
    } catch (error) {
      console.error('Failed to load config:', error)
    }
    return DEFAULT_CONFIG
  }

  private saveConfigToFile(): void {
    try {
      const dir = dirname(this.configPath)
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }
      writeFileSync(this.configPath, JSON.stringify(this.config, null, 2))
    } catch (error) {
      console.error('Failed to save config:', error)
    }
  }

  getConfig(): AppConfig {
    return this.config
  }

  saveConfig(config: Partial<AppConfig>): AppConfig {
    this.config = { ...this.config, ...config, settings: { ...this.config.settings, ...config.settings } }
    this.saveConfigToFile()
    return this.config
  }

  async addServer(server: Omit<ServerConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServerConfig> {
    const newServer: ServerConfig = {
      ...server,
      id: uuidv4(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    if (server.authMethod === 'password' && server.password) {
      await keytar.setPassword('ssh-client', newServer.id, server.password)
    } else if (server.authMethod === 'key' && server.passphrase) {
      await keytar.setPassword('ssh-client', `${newServer.id}-passphrase`, server.passphrase)
    }

    this.config.servers.push(newServer)
    this.saveConfigToFile()
    return newServer
  }

  async updateServer(id: string, updates: Partial<ServerConfig>): Promise<ServerConfig | null> {
    const index = this.config.servers.findIndex(s => s.id === id)
    if (index === -1) return null

    const server = this.config.servers[index]

    if (updates.authMethod === 'password' && updates.password) {
      await keytar.setPassword('ssh-client', id, updates.password)
    } else if (updates.authMethod === 'key' && updates.passphrase) {
      await keytar.setPassword('ssh-client', `${id}-passphrase`, updates.passphrase)
    }

    this.config.servers[index] = {
      ...server,
      ...updates,
      updatedAt: Date.now()
    }
    this.saveConfigToFile()
    return this.config.servers[index]
  }

  async deleteServer(id: string): Promise<boolean> {
    const index = this.config.servers.findIndex(s => s.id === id)
    if (index === -1) return false

    await keytar.deletePassword('ssh-client', id)
    await keytar.deletePassword('ssh-client', `${id}-passphrase`)

    this.config.servers.splice(index, 1)
    this.saveConfigToFile()
    return true
  }

  async getServerWithCredentials(id: string): Promise<ServerConfig | null> {
    const server = this.config.servers.find(s => s.id === id)
    if (!server) return null

    const serverWithCreds = { ...server }

    if (server.authMethod === 'password') {
      const password = await keytar.getPassword('ssh-client', id)
      if (password) serverWithCreds.password = password
    } else if (server.authMethod === 'key') {
      const passphrase = await keytar.getPassword('ssh-client', `${id}-passphrase`)
      if (passphrase) serverWithCreds.passphrase = passphrase
    }

    return serverWithCreds
  }

  addGroup(group: string): void {
    if (!this.config.groups.includes(group)) {
      this.config.groups.push(group)
      this.saveConfigToFile()
    }
  }

  removeGroup(group: string): void {
    this.config.groups = this.config.groups.filter(g => g !== group)
    this.config.servers = this.config.servers.map(s => s.group === group ? { ...s, group: 'Local' } : s)
    this.saveConfigToFile()
  }
}