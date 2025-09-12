/**
 * Secure Credential Storage
 * Manages PocketBase credentials with local caching
 */

import { readFile, writeFile, mkdir, access } from 'fs/promises';
import { join, dirname } from 'path';
import { homedir } from 'os';
import crypto from 'crypto';

export interface StoredCredentials {
  url: string;
  email: string;
  password: string; // Encrypted
  timestamp: number;
  expiresAt: number;
}

export interface CredentialCache {
  [url: string]: StoredCredentials;
}

class CredentialStore {
  private readonly cacheDir: string;
  private readonly cacheFile: string;
  private readonly encryptionKey: string;

  constructor() {
    this.cacheDir = join(homedir(), '.pocketvex');
    this.cacheFile = join(this.cacheDir, 'credentials.json');
    // Use a machine-specific key for encryption
    this.encryptionKey = this.getMachineKey();
  }

  private getMachineKey(): string {
    // Create a machine-specific key based on system info
    const machineId = process.platform + process.arch + homedir();
    return crypto
      .createHash('sha256')
      .update(machineId)
      .digest('hex')
      .substring(0, 32);
  }

  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Store credentials for a PocketBase instance
   */
  async storeCredentials(
    url: string,
    email: string,
    password: string,
    ttlHours: number = 24,
  ): Promise<void> {
    try {
      await this.ensureCacheDir();

      const cache = await this.loadCache();
      const expiresAt = Date.now() + ttlHours * 60 * 60 * 1000;

      cache[url] = {
        url,
        email,
        password: this.encrypt(password),
        timestamp: Date.now(),
        expiresAt,
      };

      await this.saveCache(cache);
    } catch (error) {
      // Fail silently - credential caching is optional
      console.warn('Failed to cache credentials:', error);
    }
  }

  /**
   * Retrieve credentials for a PocketBase instance
   */
  async getCredentials(
    url: string,
  ): Promise<{ email: string; password: string } | null> {
    try {
      const cache = await this.loadCache();
      const stored = cache[url];

      if (!stored) {
        return null;
      }

      // Check if credentials have expired
      if (Date.now() > stored.expiresAt) {
        await this.removeCredentials(url);
        return null;
      }

      return {
        email: stored.email,
        password: this.decrypt(stored.password),
      };
    } catch (error) {
      // Fail silently - credential caching is optional
      return null;
    }
  }

  /**
   * Remove credentials for a PocketBase instance
   */
  async removeCredentials(url: string): Promise<void> {
    try {
      const cache = await this.loadCache();
      delete cache[url];
      await this.saveCache(cache);
    } catch (error) {
      // Fail silently
    }
  }

  /**
   * Clear all cached credentials
   */
  async clearAllCredentials(): Promise<void> {
    try {
      await this.ensureCacheDir();
      await this.saveCache({});
    } catch (error) {
      // Fail silently
    }
  }

  /**
   * List all cached credential URLs
   */
  async listCachedUrls(): Promise<string[]> {
    try {
      const cache = await this.loadCache();
      return Object.keys(cache).filter((url) => {
        const stored = cache[url];
        return stored && Date.now() <= stored.expiresAt;
      });
    } catch (error) {
      return [];
    }
  }

  /**
   * Check if credentials exist and are valid for a URL
   */
  async hasValidCredentials(url: string): Promise<boolean> {
    const credentials = await this.getCredentials(url);
    return credentials !== null;
  }

  private async ensureCacheDir(): Promise<void> {
    try {
      await access(this.cacheDir);
    } catch {
      await mkdir(this.cacheDir, { recursive: true });
    }
  }

  private async loadCache(): Promise<CredentialCache> {
    try {
      const data = await readFile(this.cacheFile, 'utf8');
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  private async saveCache(cache: CredentialCache): Promise<void> {
    await writeFile(this.cacheFile, JSON.stringify(cache, null, 2));
  }
}

// Export singleton instance
export const credentialStore = new CredentialStore();
