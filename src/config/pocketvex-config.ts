import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export interface PocketVexConfig {
  /** Directory where PocketVex files are located (relative to project root) */
  directory: string;
  /** Whether to use the new /pocketvex structure (default: true) */
  usePocketVexDirectory: boolean;
  /** Whether to use pb_ prefixes (default: false when usePocketVexDirectory is true) */
  usePbPrefixes: boolean;
}

const DEFAULT_CONFIG: PocketVexConfig = {
  directory: 'pocketvex',
  usePocketVexDirectory: true,
  usePbPrefixes: false,
};

export class PocketVexConfigManager {
  private config: PocketVexConfig;

  constructor(projectRoot: string = process.cwd()) {
    this.config = this.loadConfig(projectRoot);
  }

  private loadConfig(projectRoot: string): PocketVexConfig {
    const configPath = join(projectRoot, 'pocketvex.config.json');
    
    if (existsSync(configPath)) {
      try {
        const configData = JSON.parse(readFileSync(configPath, 'utf-8'));
        return { ...DEFAULT_CONFIG, ...configData };
      } catch (error) {
        console.warn('⚠️  Invalid pocketvex.config.json, using defaults');
        return DEFAULT_CONFIG;
      }
    }

    return DEFAULT_CONFIG;
  }

  getConfig(): PocketVexConfig {
    return this.config;
  }

  getPocketVexDirectory(): string {
    return this.config.directory;
  }

  getSchemaDirectory(): string {
    if (this.config.usePocketVexDirectory) {
      return join(this.config.directory, 'schema');
    }
    return 'schema';
  }

  getJobsDirectory(): string {
    if (this.config.usePocketVexDirectory) {
      return join(this.config.directory, 'jobs');
    }
    return this.config.usePbPrefixes ? 'pb_jobs' : 'jobs';
  }

  getHooksDirectory(): string {
    if (this.config.usePocketVexDirectory) {
      return join(this.config.directory, 'hooks');
    }
    return this.config.usePbPrefixes ? 'pb_hooks' : 'hooks';
  }

  getCommandsDirectory(): string {
    if (this.config.usePocketVexDirectory) {
      return join(this.config.directory, 'commands');
    }
    return this.config.usePbPrefixes ? 'pb_commands' : 'commands';
  }

  getQueriesDirectory(): string {
    if (this.config.usePocketVexDirectory) {
      return join(this.config.directory, 'queries');
    }
    return this.config.usePbPrefixes ? 'pb_queries' : 'queries';
  }

  getMigrationsDirectory(): string {
    if (this.config.usePocketVexDirectory) {
      return join(this.config.directory, 'migrations');
    }
    return this.config.usePbPrefixes ? 'pb_migrations' : 'migrations';
  }

  getGeneratedDirectory(): string {
    return 'generated';
  }

  getAllDirectories(): string[] {
    return [
      this.getSchemaDirectory(),
      this.getJobsDirectory(),
      this.getHooksDirectory(),
      this.getCommandsDirectory(),
      this.getQueriesDirectory(),
      this.getMigrationsDirectory(),
      this.getGeneratedDirectory(),
    ];
  }

  getWatchPatterns(): string[] {
    const patterns: string[] = [];
    
    // Schema files
    patterns.push(`${this.getSchemaDirectory()}/**/*.ts`);
    patterns.push(`${this.getSchemaDirectory()}/**/*.js`);
    
    // JavaScript VM files
    patterns.push(`${this.getJobsDirectory()}/**/*.js`);
    patterns.push(`${this.getHooksDirectory()}/**/*.js`);
    patterns.push(`${this.getCommandsDirectory()}/**/*.js`);
    patterns.push(`${this.getQueriesDirectory()}/**/*.js`);
    
    return patterns;
  }

  isLegacyStructure(): boolean {
    return !this.config.usePocketVexDirectory;
  }

  shouldUsePbPrefixes(): boolean {
    return this.config.usePbPrefixes;
  }
}

// Singleton instance
let configManager: PocketVexConfigManager | null = null;

export function getPocketVexConfig(projectRoot?: string): PocketVexConfigManager {
  if (!configManager) {
    configManager = new PocketVexConfigManager(projectRoot);
  }
  return configManager;
}

export function resetPocketVexConfig(): void {
  configManager = null;
}
