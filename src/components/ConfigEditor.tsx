import { useState, useEffect } from "react";
import { 
  Button, 
  Field, 
  TextField, 
  DialogButton,
  SteamSpinner,
  showModal
} from "@decky/ui";
import { loadConfig, saveConfig, ConfigData, restoreBackup } from "../utils/configParser";
import ConfigSection from "./ConfigSection";
import ArrayEditor from "./ArrayEditor";
import ToggleSwitch from "./ToggleSwitch";

interface ConfigEditorProps {
  configPath: string;
}

export default function ConfigEditor({ configPath }: ConfigEditorProps) {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasBackup, setHasBackup] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("general");

  useEffect(() => {
    loadConfiguration();
    checkBackup();
  }, [configPath]);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      const data = await loadConfig(configPath);
      setConfig(data);
      setError(null);
    } catch (err: any) {
      setError(`Failed to load config: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkBackup = async () => {
    try {
      const response = await fetch(`/api/file/exists?path=${encodeURIComponent(configPath + '.backup')}`);
      const data = await response.json();
      setHasBackup(data.exists);
    } catch {
      setHasBackup(false);
    }
  };

  const saveConfiguration = async () => {
    if (!config) return;
    try {
      setSaving(true);
      await saveConfig(configPath, config);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await checkBackup();
    } catch (err: any) {
      setError(`Failed to save config: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const restoreFromBackup = async () => {
    try {
      await restoreBackup(configPath);
      await loadConfiguration();
      showModal({
        title: "Success",
        content: "Configuration restored from backup!",
        onOK: () => {}
      });
    } catch (err: any) {
      setError(`Failed to restore backup: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <SteamSpinner />
        <p style={{ marginTop: "10px" }}>Loading configuration...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: "var(--steam-color-error)", padding: "10px" }}>
        <p>❌ {error}</p>
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <DialogButton onClick={loadConfiguration}>Retry</DialogButton>
          {hasBackup && (
            <DialogButton onClick={restoreFromBackup}>Restore Backup</DialogButton>
          )}
        </div>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div style={{ padding: "10px" }}>
      {success && (
        <div style={{ color: "var(--steam-color-success)", marginBottom: "10px", padding: "10px", background: "var(--steam-color-success-background)", borderRadius: "4px" }}>
          ✅ Configuration saved successfully!
        </div>
      )}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <Button onClick={saveConfiguration} disabled={saving}>
          {saving ? <SteamSpinner size="small" /> : "💾 Save Configuration"}
        </Button>
        <Button onClick={loadConfiguration}>🔄 Reload</Button>
        {hasBackup && (
          <Button onClick={restoreFromBackup} style={{ background: "var(--steam-color-warning)" }}>
            ↩️ Restore Backup
          </Button>
        )}
      </div>

      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "15px", padding: "5px", background: "var(--steam-color-bg-dark)", borderRadius: "4px" }}>
        {[
          { id: "general", label: "⚙️ General" },
          { id: "apps", label: "📱 Apps" },
          { id: "fake", label: "🎭 Fake IDs" },
          { id: "manifest", label: "📦 Manifests" },
          { id: "idle", label: "💤 Idle" },
          { id: "advanced", label: "🔧 Advanced" },
          { id: "dlc", label: "🎮 DLC" },
          { id: "denuvo", label: "🔒 Denuvo" },
          { id: "launch", label: "🚀 Launch" }
        ].map(section => (
          <Button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            style={{
              background: activeSection === section.id ? "var(--steam-color-accent)" : "transparent",
              flex: "1",
              minWidth: "60px",
              fontSize: "12px",
              padding: "5px 8px"
            }}
          >
            {section.label}
          </Button>
        ))}
      </div>

      <div style={{ maxHeight: "calc(100vh - 400px)", overflow: "auto" }}>
        {activeSection === "general" && (
          <ConfigSection title="General Settings">
            <ToggleSwitch label="Disable Family Share Lock" description="Disables Family Share license locking for self and others" value={config.DisableFamilyShareLock ?? true} onChange={(val) => setConfig({ ...config, DisableFamilyShareLock: val })} />
            <ToggleSwitch label="Use Whitelist Mode" description="Switches to whitelist instead of the default blacklist" value={config.UseWhitelist ?? false} onChange={(val) => setConfig({ ...config, UseWhitelist: val })} />
            <ToggleSwitch label="Safe Mode" description="Automatically disable SLSsteam when steamclient.so doesn't match" value={config.SafeMode ?? false} onChange={(val) => setConfig({ ...config, SafeMode: val })} />
            <ToggleSwitch label="Disable Updates" description="Disable updates for unowned games" value={config.DisableUpdates ?? true} onChange={(val) => setConfig({ ...config, DisableUpdates: val })} />
            <ToggleSwitch label="Disable Cloud Saves" description="Disable cloud saves for unlocked games" value={config.DisableCloud ?? false} onChange={(val) => setConfig({ ...config, DisableCloud: val })} />
            <ToggleSwitch label="Enable API" description="Enable sending commands via /tmp/SLSsteam.API" value={config.API ?? true} onChange={(val) => setConfig({ ...config, API: val })} />
            <ToggleSwitch label="Enable Plugins" description="Enable Lua plugins from plugins subdirectory (CAUTION: Can run arbitrary code)" value={config.Plugins ?? false} onChange={(val) => setConfig({ ...config, Plugins: val })} />
            <ToggleSwitch label="Dump Client Interfaces" description="Dump all used IClientInterfaceMaps" value={config.DumpClientInterfaces ?? false} onChange={(val) => setConfig({ ...config, DumpClientInterfaces: val })} />
            <ToggleSwitch label="Extended Logging" description="Logs all calls to Steamworks (makes logfile huge!)" value={config.ExtendedLogging ?? false} onChange={(val) => setConfig({ ...config, ExtendedLogging: val })} />
            <ToggleSwitch label="Warn Hash Mismatch" description="Warn when steamclient.so hash differs from known safe hash" value={config.WarnHashMissmatch ?? false} onChange={(val) => setConfig({ ...config, WarnHashMissmatch: val })} />
            <ToggleSwitch label="Notify on Init" description="Notify when SLSsteam is done initializing" value={config.NotifyInit ?? false} onChange={(val) => setConfig({ ...config, NotifyInit: val })} />
          </ConfigSection>
        )}
        {activeSection === "apps" && (
          <ConfigSection title="Application IDs">
            <ArrayEditor label="App IDs" description="List of AppIds to include/exclude" items={config.AppIds || []} onAdd={() => setConfig({ ...config, AppIds: [...(config.AppIds || []), 0] })} onRemove={(index) => setConfig({ ...config, AppIds: config.AppIds?.filter((_, i) => i !== index) })} onChange={(index, value) => { const newApps = [...(config.AppIds || [])]; newApps[index] = parseInt(value) || 0; setConfig({ ...config, AppIds: newApps }); }} />
            <ArrayEditor label="Additional Apps" description="Additional AppIds to inject (overrides OwnerIds)" items={config.AdditionalApps || []} onAdd={() => setConfig({ ...config, AdditionalApps: [...(config.AdditionalApps || []), 0] })} onRemove={(index) => setConfig({ ...config, AdditionalApps: config.AdditionalApps?.filter((_, i) => i !== index) })} onChange={(index, value) => { const newApps = [...(config.AdditionalApps || [])]; newApps[index] = parseInt(value) || 0; setConfig({ ...config, AdditionalApps: newApps }); }} />
            <ArrayEditor label="Additional Depots" description="Additional DepotIds to inject" items={config.AdditionalDepots || []} onAdd={() => setConfig({ ...config, AdditionalDepots: [...(config.AdditionalDepots || []), 0] })} onRemove={(index) => setConfig({ ...config, AdditionalDepots: config.AdditionalDepots?.filter((_, i) => i !== index) })} onChange={(index, value) => { const newDepots = [...(config.AdditionalDepots || [])]; newDepots[index] = parseInt(value) || 0; setConfig({ ...config, AdditionalDepots: newDepots }); }} />
            <ArrayEditor label="Additional Packages" description="Additional licenses to inject (store packages)" items={config.AdditionalPackages || []} onAdd={() => setConfig({ ...config, AdditionalPackages: [...(config.AdditionalPackages || []), 0] })} onRemove={(index) => setConfig({ ...config, AdditionalPackages: config.AdditionalPackages?.filter((_, i) => i !== index) })} onChange={(index, value) => { const newPackages = [...(config.AdditionalPackages || [])]; newPackages[index] = parseInt(value) || 0; setConfig({ ...config, AdditionalPackages: newPackages }); }} />
            <ArrayEditor label="Fake Offline Apps" description="Fake Steam being offline for specified AppIds" items={config.FakeOffline || []} onAdd={() => setConfig({ ...config, FakeOffline: [...(config.FakeOffline || []), 0] })} onRemove={(index) => setConfig({ ...config, FakeOffline: config.FakeOffline?.filter((_, i) => i !== index) })} onChange={(index, value) => { const newApps = [...(config.FakeOffline || [])]; newApps[index] = parseInt(value) || 0; setConfig({ ...config, FakeOffline: newApps }); }} />
            <ArrayEditor label="Depot Blacklist" description="Never download these depots" items={config.DepotBlacklist || []} onAdd={() => setConfig({ ...config, DepotBlacklist: [...(config.DepotBlacklist || []), 0] })} onRemove={(index) => setConfig({ ...config, DepotBlacklist: config.DepotBlacklist?.filter((_, i) => i !== index) })} onChange={(index, value) => { const newList = [...(config.DepotBlacklist || [])]; newList[index] = parseInt(value) || 0; setConfig({ ...config, DepotBlacklist: newList }); }} />
          </ConfigSection>
        )}
        {activeSection === "fake" && (
          <ConfigSection title="Fake App IDs">
            <p style={{ fontSize: "12px", color: "var(--steam-color-text-muted)", marginBottom: "10px" }}>Change AppIds of games to enable networking features. Use 0 as key for all unowned apps.<br /><strong>Warning:</strong> Do not run multiple apps under the same AppId simultaneously!</p>
            {Object.entries(config.FakeAppIds || {}).map(([key, value]) => (
              <div key={key} style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "center" }}>
                <TextField label="Real App ID" value={key} onChange={(e) => { const newFake = { ...(config.FakeAppIds || {}) }; const val = newFake[key]; delete newFake[key]; newFake[e.target.value] = val; setConfig({ ...config, FakeAppIds: newFake }); }} style={{ flex: 1 }} />
                <TextField label="Fake App ID" value={value} onChange={(e) => { const newFake = { ...(config.FakeAppIds || {}) }; newFake[key] = e.target.value; setConfig({ ...config, FakeAppIds: newFake }); }} style={{ flex: 1 }} />
                <Button onClick={() => { const newFake = { ...(config.FakeAppIds || {}) }; delete newFake[key]; setConfig({ ...config, FakeAppIds: newFake }); }} style={{ alignSelf: "flex-end" }}>✕</Button>
              </div>
            ))}
            <Button onClick={() => { const newFake = { ...(config.FakeAppIds || {}) }; newFake["0"] = "0"; setConfig({ ...config, FakeAppIds: newFake }); }}>➕ Add Fake App ID</Button>
          </ConfigSection>
        )}
        {activeSection === "manifest" && (
          <ConfigSection title="Manifest Overrides">
            <p style={{ fontSize: "12px", color: "var(--steam-color-text-muted)", marginBottom: "10px" }}>Override Depot manifest IDs to download older versions or lock to specific versions.<br /><strong>Example:</strong> 3405691: 3719125797281763380</p>
            {Object.entries(config.ManifestIds || {}).map(([depot, manifest]) => (
              <div key={depot} style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "center" }}>
                <TextField label="Depot ID" value={depot} onChange={(e) => { const newManifests = { ...(config.ManifestIds || {}) }; const val = newManifests[depot]; delete newManifests[depot]; newManifests[e.target.value] = val; setConfig({ ...config, ManifestIds: newManifests }); }} style={{ flex: 1 }} />
                <TextField label="Manifest ID" value={manifest} onChange={(e) => { const newManifests = { ...(config.ManifestIds || {}) }; newManifests[depot] = e.target.value; setConfig({ ...config, ManifestIds: newManifests }); }} style={{ flex: 2 }} />
                <Button onClick={() => { const newManifests = { ...(config.ManifestIds || {}) }; delete newManifests[depot]; setConfig({ ...config, ManifestIds: newManifests }); }} style={{ alignSelf: "flex-end" }}>✕</Button>
              </div>
            ))}
            <Button onClick={() => { const newManifests = { ...(config.ManifestIds || {}) }; newManifests["0"] = ""; setConfig({ ...config, ManifestIds: newManifests }); }}>➕ Add Manifest Override</Button>
          </ConfigSection>
        )}
        {activeSection === "idle" && (
          <ConfigSection title="Idle Status">
            <p style={{ fontSize: "12px", color: "var(--steam-color-text-muted)", marginBottom: "10px" }}>Custom ingame statuses. Set AppId to 0 to disable.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <Field label="Idle App ID" style={{ flex: 1 }}>
                <TextField type="number" value={config.IdleStatus?.AppId ?? 221410} onChange={(e) => setConfig({ ...config, IdleStatus: { ...(config.IdleStatus || { Title: "Grand Theft Auto VI" }), AppId: parseInt(e.target.value) || 0 } })} />
              </Field>
              <Field label="Idle Title" style={{ flex: 2 }}>
                <TextField value={config.IdleStatus?.Title || "Grand Theft Auto VI"} onChange={(e) => setConfig({ ...config, IdleStatus: { ...(config.IdleStatus || { AppId: 221410 }), Title: e.target.value } })} />
              </Field>
            </div>
          </ConfigSection>
        )}
        {activeSection === "advanced" && (
          <ConfigSection title="Advanced Settings">
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Field label="Max Schema Tries" style={{ flex: 1 }}><TextField type="number" value={config.MaxSchemaTries ?? 10} onChange={(e) => setConfig({ ...config, MaxSchemaTries: parseInt(e.target.value) || 0 })} /></Field>
              <Field label="Log Levels (Hex)" style={{ flex: 1 }}><TextField value={`0x${((config.LogLevels ?? 0x3f) as number).toString(16)}`} onChange={(e) => { const val = e.target.value.replace('0x', ''); setConfig({ ...config, LogLevels: parseInt(val, 16) || 0 }); }} /></Field>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
              <Field label="Smart Tickets (Hex)" style={{ flex: 1 }}><TextField value={`0x${((config.SmartTickets ?? 0x1) as number).toString(16)}`} onChange={(e) => { const val = e.target.value.replace('0x', ''); setConfig({ ...config, SmartTickets: parseInt(val, 16) || 0 }); }} /></Field>
              <Field label="Fake Wallet Balance" style={{ flex: 1 }}><TextField type="number" value={config.FakeWalletBalance ?? 0} onChange={(e) => setConfig({ ...config, FakeWalletBalance: parseInt(e.target.value) || 0 })} /></Field>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
              <Field label="Fake Name" style={{ flex: 1 }}><TextField value={config.FakeName || ""} onChange={(e) => setConfig({ ...config, FakeName: e.target.value })} /></Field>
              <Field label="Fake Email" style={{ flex: 1 }}><TextField value={config.FakeEmail || ""} onChange={(e) => setConfig({ ...config, FakeEmail: e.target.value })} /></Field>
            </div>
            <Field label="Steam ID Override" style={{ marginTop: "10px" }}><TextField value={config.SteamIdOverride ?? ""} onChange={(e) => setConfig({ ...config, SteamIdOverride: e.target.value || "0" })} /></Field>
            <Field label="Cloud Proxies" style={{ marginTop: "10px" }}>
              <p style={{ fontSize: "12px", color: "var(--steam-color-text-muted)" }}>Redirects Cloud operations for unowned apps. Use 0 as key for all unowned appIds.</p>
              {Object.entries(config.CloudProxies || {}).map(([key, value]) => (
                <div key={key} style={{ display: "flex", gap: "10px", marginBottom: "5px" }}>
                  <TextField value={key} onChange={(e) => { const newProxies = { ...(config.CloudProxies || {}) }; const val = newProxies[key]; delete newProxies[key]; newProxies[e.target.value] = val; setConfig({ ...config, CloudProxies: newProxies }); }} style={{ flex: 1 }} />
                  <TextField value={value} onChange={(e) => { const newProxies = { ...(config.CloudProxies || {}) }; newProxies[key] = parseInt(e.target.value) || 0; setConfig({ ...config, CloudProxies: newProxies }); }} style={{ flex: 1 }} />
                  <Button onClick={() => { const newProxies = { ...(config.CloudProxies || {}) }; delete newProxies[key]; setConfig({ ...config, CloudProxies: newProxies }); }}>✕</Button>
                </div>
              ))}
              <Button onClick={() => { const newProxies = { ...(config.CloudProxies || {}) }; newProxies["0"] = 0; setConfig({ ...config, CloudProxies: newProxies }); }}>➕ Add Cloud Proxy</Button>
            </Field>
            <Field label="Game Titles Override" style={{ marginTop: "10px" }}>
              <p style={{ fontSize: "12px", color: "var(--steam-color-text-muted)" }}>Override game titles. Only works with owned appIds!</p>
              {Object.entries(config.GameTitles || {}).map(([appId, title]) => (
                <div key={appId} style={{ display: "flex", gap: "10px", marginBottom: "5px" }}>
                  <TextField value={appId} onChange={(e) => { const newTitles = { ...(config.GameTitles || {}) }; const val = newTitles[appId]; delete newTitles[appId]; newTitles[e.target.value] = val; setConfig({ ...config, GameTitles: newTitles }); }} style={{ flex: 1 }} />
                  <TextField value={title} onChange={(e) => { const newTitles = { ...(config.GameTitles || {}) }; newTitles[appId] = e.target.value; setConfig({ ...config, GameTitles: newTitles }); }} style={{ flex: 2 }} />
                  <Button onClick={() => { const newTitles = { ...(config.GameTitles || {}) }; delete newTitles[appId]; setConfig({ ...config, GameTitles: newTitles }); }}>✕</Button>
                </div>
              ))}
              <Button onClick={() => { const newTitles = { ...(config.GameTitles || {}) }; newTitles["0"] = ""; setConfig({ ...config, GameTitles: newTitles }); }}>➕ Add Game Title</Button>
            </Field>
            <Field label="Subscription Timestamps" style={{ marginTop: "10px" }}>
              <p style={{ fontSize: "12px", color: "var(--steam-color-text-muted)" }}>Override purchase time stamps</p>
              {Object.entries(config.SubscriptionTimestamps || {}).map(([appId, timestamp]) => (
                <div key={appId} style={{ display: "flex", gap: "10px", marginBottom: "5px" }}>
                  <TextField value={appId} onChange={(e) => { const newTimestamps = { ...(config.SubscriptionTimestamps || {}) }; const val = newTimestamps[appId]; delete newTimestamps[appId]; newTimestamps[e.target.value] = val; setConfig({ ...config, SubscriptionTimestamps: newTimestamps }); }} style={{ flex: 1 }} />
                  <TextField type="number" value={timestamp} onChange={(e) => { const newTimestamps = { ...(config.SubscriptionTimestamps || {}) }; newTimestamps[appId] = parseInt(e.target.value) || 0; setConfig({ ...config, SubscriptionTimestamps: newTimestamps }); }} style={{ flex: 1 }} />
                  <Button onClick={() => { const newTimestamps = { ...(config.SubscriptionTimestamps || {}) }; delete newTimestamps[appId]; setConfig({ ...config, SubscriptionTimestamps: newTimestamps }); }}>✕</Button>
                </div>
              ))}
              <Button onClick={() => { const newTimestamps = { ...(config.SubscriptionTimestamps || {}) }; newTimestamps["0"] = 0; setConfig({ ...config, SubscriptionTimestamps: newTimestamps }); }}>➕ Add Subscription Timestamp</Button>
            </Field>
          </ConfigSection>
        )}
        {activeSection === "dlc" && (
          <ConfigSection title="DLC Data">
            <p style={{ fontSize: "12px", color: "var(--steam-color-text-muted)", marginBottom: "10px" }}>Extra data for DLCs belonging to a specific AppId (for Steam's 64 DLC limit)</p>
            {Object.entries(config.DlcData || {}).map(([appId, dlcs]) => (
              <div key={appId} style={{ border: "1px solid var(--steam-color-border)", padding: "10px", marginBottom: "10px", borderRadius: "4px" }}>
                <Field label={`DLCs for App ID ${appId}`}>
                  {Object.entries(dlcs).map(([dlcId, dlcName]) => (
                    <div key={dlcId} style={{ display: "flex", gap: "10px", marginBottom: "5px" }}>
                      <TextField value={dlcId} onChange={(e) => { const newDlcData = { ...(config.DlcData || {}) }; const oldDlcs = newDlcData[appId] || {}; const val = oldDlcs[dlcId]; delete oldDlcs[dlcId]; oldDlcs[e.target.value] = val; setConfig({ ...config, DlcData: newDlcData }); }} placeholder="DLC App ID" style={{ flex: 1 }} />
                      <TextField value={dlcName} onChange={(e) => { const newDlcData = { ...(config.DlcData || {}) }; newDlcData[appId] = { ...(newDlcData[appId] || {}), [dlcId]: e.target.value }; setConfig({ ...config, DlcData: newDlcData }); }} placeholder="DLC Name" style={{ flex: 2 }} />
                      <Button onClick={() => { const newDlcData = { ...(config.DlcData || {}) }; const dlcsObj = { ...(newDlcData[appId] || {}) }; delete dlcsObj[dlcId]; newDlcData[appId] = dlcsObj; if (Object.keys(dlcsObj).length === 0) delete newDlcData[appId]; setConfig({ ...config, DlcData: newDlcData }); }}>✕</Button>
                    </div>
                  ))}
                  <Button onClick={() => { const newDlcData = { ...(config.DlcData || {}) }; if (!newDlcData[appId]) newDlcData[appId] = {}; newDlcData[appId]["0"] = "New DLC"; setConfig({ ...config, DlcData: newDlcData }); }}>➕ Add DLC</Button>
                </Field>
              </div>
            ))}
            <Button onClick={() => { const newDlcData = { ...(config.DlcData || {}) }; newDlcData["0"] = {}; setConfig({ ...config, DlcData: newDlcData }); }}>➕ Add New App ID for DLCs</Button>
          </ConfigSection>
        )}
        {activeSection === "denuvo" && (
          <ConfigSection title="Denuvo Games">
            <p style={{ fontSize: "12px", color: "var(--steam-color-text-muted)", marginBottom: "10px" }}>Blocks games from unlocking on wrong accounts</p>
            {Object.entries(config.DenuvoGames || {}).map(([steamId, appIds]) => (
              <div key={steamId} style={{ border: "1px solid var(--steam-color-border)", padding: "10px", marginBottom: "10px", borderRadius: "4px" }}>
                <Field label={`Steam ID: ${steamId}`}>
                  {appIds.map((appId, index) => (
                    <div key={index} style={{ display: "flex", gap: "10px", marginBottom: "5px" }}>
                      <TextField value={appId} onChange={(e) => { const newDenuvo = { ...(config.DenuvoGames || {}) }; newDenuvo[steamId][index] = parseInt(e.target.value) || 0; setConfig({ ...config, DenuvoGames: newDenuvo }); }} placeholder="App ID" style={{ flex: 1 }} />
                      <Button onClick={() => { const newDenuvo = { ...(config.DenuvoGames || {}) }; newDenuvo[steamId] = newDenuvo[steamId].filter((_, i) => i !== index); if (newDenuvo[steamId].length === 0) delete newDenuvo[steamId]; setConfig({ ...config, DenuvoGames: newDenuvo }); }}>✕</Button>
                    </div>
                  ))}
                  <Button onClick={() => { const newDenuvo = { ...(config.DenuvoGames || {}) }; newDenuvo[steamId] = [...(newDenuvo[steamId] || []), 0]; setConfig({ ...config, DenuvoGames: newDenuvo }); }}>➕ Add App ID</Button>
                </Field>
              </div>
            ))}
            <Button onClick={() => { const newDenuvo = { ...(config.DenuvoGames || {}) }; newDenuvo["0"] = []; setConfig({ ...config, DenuvoGames: newDenuvo }); }}>➕ Add Steam ID</Button>
          </ConfigSection>
        )}
        {activeSection === "launch" && (
          <ConfigSection title="Launch Options">
            <p style={{ fontSize: "12px", color: "var(--steam-color-text-muted)", marginBottom: "10px" }}>Override commands in CUser::SpawnGame. Use %command% as special string.<br /><strong>Special keys:</strong> 4294967294 = all unowned apps, 4294967295 = all apps</p>
            {Object.entries(config.LaunchOptions || {}).map(([appId, options]) => (
              <div key={appId} style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "center" }}>
                <TextField label="App ID" value={appId} onChange={(e) => { const newOptions = { ...(config.LaunchOptions || {}) }; const val = newOptions[appId]; delete newOptions[appId]; newOptions[e.target.value] = val; setConfig({ ...config, LaunchOptions: newOptions }); }} style={{ flex: 1 }} />
                <TextField label="Launch Options" value={options} onChange={(e) => { const newOptions = { ...(config.LaunchOptions || {}) }; newOptions[appId] = e.target.value; setConfig({ ...config, LaunchOptions: newOptions }); }} style={{ flex: 2 }} />
                <Button onClick={() => { const newOptions = { ...(config.LaunchOptions || {}) }; delete newOptions[appId]; setConfig({ ...config, LaunchOptions: newOptions }); }} style={{ alignSelf: "flex-end" }}>✕</Button>
              </div>
            ))}
            <Button onClick={() => { const newOptions = { ...(config.LaunchOptions || {}) }; newOptions["0"] = ""; setConfig({ ...config, LaunchOptions: newOptions }); }}>➕ Add Launch Option</Button>
          </ConfigSection>
        )}
      </div>
    </div>
  );
}
