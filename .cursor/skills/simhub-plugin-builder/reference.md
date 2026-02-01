# SimHub SDK Quick Reference

Concise reference for SimHub plugin development. Confirm against the installed SDK at `C:\Program Files (x86)\SimHub\PluginSdk` and [SimHub Wiki – Plugin and extensions SDKs](https://github.com/SHWotever/SimHub/wiki/Plugin-and-extensions-SDKs).

## Interfaces

- **IPlugin** — Base plugin contract.
- **IDataPlugin** — Receives game data updates via `DataUpdate(PluginManager, ref GameData)`.
- **IWPFSettingsV2** — Optional: provides a WPF settings control via `GetWPFSettingsControl(PluginManager)`.

## Lifecycle

- **Init(PluginManager pluginManager)** — Called once after plugin startup. Declare properties, events, actions; load settings.
- **DataUpdate(PluginManager pluginManager, ref GameData data)** — Called every game data update (~1/fps). On the critical path; must be fast and must not throw. Use normalized data from `data`.
- **End(PluginManager pluginManager)** — Called at plugin stop. Save settings, dispose resources.

There is **no Start()** in the SDK; lifecycle is Init → DataUpdate (repeated) → End.

## GameData

- **data.GameRunning** — Whether a game/session is active.
- **data.OldData** — Previous frame (normalized).
- **data.NewData** — Current frame (normalized); e.g. `data.NewData.SpeedKmh`.

Prefer normalized properties (e.g. SpeedKmh). Avoid relying on undocumented or raw types; the SDK intentionally hides raw data behind a generic object.

## Namespaces

- **SimHub.Plugins** — PluginManager, IPlugin, IDataPlugin, IWPFSettingsV2, attributes.
- **GameReaderCommon** — GameData and normalized data types.

## Attributes

- **[PluginName("...")]** — Short title in SimHub menu.
- **[PluginAuthor("...")]** — Author name.
- **[PluginDescription("...")]** — Description for SimHub.

## SDK Location and Target

- **Demo projects:** `C:\Program Files (x86)\SimHub\PluginSdk` (e.g. User.PluginSdkDemo, User.DeviceExtensionDemo, User.LedEditorEffect).
- **Target framework:** .NET Framework 4.8 (required by SimHub SDK).
- **UI:** WPF; optional Control.xaml / Settings when implementing IWPFSettingsV2.

## Documentation

- [SimHub Wiki – Plugin and extensions SDKs](https://github.com/SHWotever/SimHub/wiki/Plugin-and-extensions-SDKs)
