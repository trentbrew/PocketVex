export type HostConfig = {
  name: string;
  url: string;
};

export type PocketVexUserConfig = {
  hosts?: HostConfig[];
  defaultHost?: string;
  schema?: string[];
  watch?: string[];
  types?: { outDir?: string; clientFile?: string };
  migrations?: { outDir?: string; idPrefix?: string };
  vm?: { mode?: 'local-copy' | 'pack'; restart?: 'graceful' | 'hard' };
};

export function defineConfig<T extends PocketVexUserConfig>(config: T): T {
  return config;
}

