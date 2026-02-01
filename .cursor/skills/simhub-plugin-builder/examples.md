## Project Structure Template

### This repo (WinPodiums)

```
apps/plugin/
├── README.md
└── WinPodiums.Plugin/
    ├── WinPodiums.Plugin.csproj
    ├── Core/
    │   └── PluginMain.cs          # SimHub plugin entry point, lifecycle hooks
    ├── Auth/
    │   └── TokenStorage.cs
    ├── Services/
    │   └── ApiClient.cs
    └── Properties/
        └── AssemblyInfo.cs (optional)
```

See [docs/design/components/simhub-plugin.md](docs/design/components/simhub-plugin.md) for full LLD. POC scope and tech plans: [PRD-001](docs/product/simhub-plugin-poc/001-simhub-plugin-poc.md), [TP-SPOC-001–005](docs/tech-plans/simhub-plugin-poc/README.md).

### Minimal plugin (generic, SDK-aligned)

```
SimHubPlugin/
├── SimHubPlugin.csproj
├── Plugin.cs
├── Control.xaml / Control.xaml.cs  # Optional: settings UI (IWPFSettingsV2)
├── Settings.cs                    # Optional: settings model
├── Properties/
│   └── AssemblyInfo.cs
└── README.md
```

## Minimal Plugin Class Skeleton (C#)

SDK-aligned: **IPlugin**, **IDataPlugin**, **Init(PluginManager)**, **DataUpdate(PluginManager, ref GameData)**, **End(PluginManager)**. No Start().

```csharp
using GameReaderCommon;
using SimHub.Plugins;
using System;

namespace SimHubPlugin
{
    [PluginName("My SimHub Plugin")]
    [PluginAuthor("Your Name")]
    [PluginDescription("Short description for SimHub menu")]
    public class Plugin : IPlugin, IDataPlugin
    {
        public void Init(PluginManager pluginManager)
        {
            // Called once at startup. Declare properties, events, actions; load settings.
        }

        public void DataUpdate(PluginManager pluginManager, ref GameData data)
        {
            // Called every game data update (~1/fps). Must be fast; avoid throwing.
            if (data.GameRunning && data.NewData != null)
            {
                // Prefer normalized data, e.g. data.NewData.SpeedKmh
                // Avoid relying on undocumented/raw types.
            }
        }

        public void End(PluginManager pluginManager)
        {
            // Called at plugin stop. Save settings, dispose resources.
        }
    }
}
```

For a settings UI, implement **IWPFSettingsV2** and return a WPF Control from `GetWPFSettingsControl(PluginManager)`.

## csproj Template Snippet

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net48</TargetFramework>
    <AssemblyName>SimHubPlugin</AssemblyName>
    <RootNamespace>SimHubPlugin</RootNamespace>
    <OutputType>Library</OutputType>
  </PropertyGroup>

  <ItemGroup>
    <!-- Reference SimHub.Plugins and GameReaderCommon from SimHub install.
         Demo projects: C:\Program Files (x86)\SimHub\PluginSdk.
         Copy reference paths from the SDK demo .csproj (e.g. User.PluginSdkDemo). -->
    <!-- <Reference Include="SimHub.Plugins"> -->
    <!--   <HintPath>C:\Program Files (x86)\SimHub\...\SimHub.Plugins.dll</HintPath> -->
    <!-- </Reference> -->
    <!-- <Reference Include="GameReaderCommon"> -->
    <!--   <HintPath>C:\Program Files (x86)\SimHub\...\GameReaderCommon.dll</HintPath> -->
    <!-- </Reference> -->
  </ItemGroup>
</Project>
```

For this repo's assembly name use `WinPodiums.Plugin`; replace `SimHubPlugin` above with your assembly name when scaffolding a new plugin.

## Build and Deploy (PowerShell)

```powershell
# Build
dotnet build -c Debug

# Deploy to SimHub plugins folder (canonical path for this repo)
$SimHubPlugins = "C:\Program Files (x86)\SimHub\Plugins"
$PluginOut = "bin\Debug\net48"
# Use your assembly name, e.g. WinPodiums.Plugin.dll
Copy-Item "$PluginOut\WinPodiums.Plugin.dll" "$SimHubPlugins\" -Force
```

If SimHub does not load the plugin, try copying the DLL to the SimHub install root: `C:\Program Files (x86)\SimHub\`.
