import * as yaml from 'js-yaml';

export interface ConfigData {
  DisableFamilyShareLock?: boolean;
  UseWhitelist?: boolean;
  AppIds?: number[];
  AdditionalApps?: number[];
  AdditionalDepots?: number[];
  AdditionalPackages?: number[];
  DecryptionKeys?: Record<string, string>;
  DlcData?: Record<string, Record<string, string>>;
  AppTokens?: Record<string, string>;
  CDKeys?: Record<string, string>;
  FakeOffline?: number[];
  FakeAppIds?: Record<string, string>;
  ManifestIds?: Record<string, string>;
  DepotBlacklist?: number[];
  CloudProxies?: Record<string, number>;
  InventoryItems?: string[];
  IdleStatus?: { AppId: number; Title: string };
  GameTitles?: Record<string, string>;
  SubscriptionTimestamps?: Record<string, number>;
  DenuvoGames?: Record<string, number[]>;
  SteamIdOverride?: string | number;
  SmartTickets?: number;
  MaxSchemaTries?: number;
  LaunchOptions?: Record<string, string>;
  SafeMode?: boolean;
  WarnHashMissmatch?: boolean;
  NotifyInit?: boolean;
  API?: boolean;
  Plugins?: boolean;
  DisableCloud?: boolean;
  DisableUpdates?: boolean;
  FakeName?: string;
  FakeEmail?: string;
  FakeWalletBalance?: number;
  LogLevels?: number;
  DumpClientInterfaces?: boolean;
  ExtendedLogging?: boolean;
}

export async function loadConfig(path: string): Promise<ConfigData> {
  try {
    const response = await fetch(`/api/file?path=${encodeURIComponent(path)}`);
    if (!response.ok) throw new Error('Failed to load config');
    const content = await response.text();
    const config = yaml.load(content) as ConfigData;
    return config || {};
  } catch (error) {
    console.error('Error loading config:', error);
    throw error;
  }
}

export async function saveConfig(path: string, data: ConfigData): Promise<void> {
  try {
    const sortedData = sortObjectKeys(data);
    const yamlStr = yaml.dump(sortedData, { indent: 2, lineWidth: 120, noRefs: true, sortKeys: true });
    const response = await fetch('/api/file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, content: yamlStr })
    });
    if (!response.ok) throw new Error('Failed to save config');
  } catch (error) {
    console.error('Error saving config:', error);
    throw error;
  }
}

export async function restoreBackup(path: string): Promise<void> {
  try {
    const response = await fetch('/api/file/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path })
    });
    if (!response.ok) throw new Error('Failed to restore backup');
  } catch (error) {
    console.error('Error restoring backup:', error);
    throw error;
  }
}

function sortObjectKeys(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(item => sortObjectKeys(item));
  const sorted: any = {};
  Object.keys(obj).sort().forEach(key => { sorted[key] = sortObjectKeys(obj[key]); });
  return sorted;
}
