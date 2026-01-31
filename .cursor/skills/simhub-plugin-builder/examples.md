## Project Structure Template

```
SimHubPlugin/
├── SimHubPlugin.csproj
├── Plugin.cs
├── Properties/
│   └── AssemblyInfo.cs
└── README.md
```

## Minimal Plugin Class Skeleton (C#)

```csharp
using System;

namespace SimHubPlugin
{
    // TODO: Implement the required SimHub plugin interface(s) from the SDK.
    public class Plugin /* : ISimHubPluginInterface */
    {
        // TODO: Add required lifecycle methods (Init/Start/Stop/etc).
        public void Init()
        {
            // Initialize plugin state
        }

        public void Start()
        {
            // Start collecting data or services
        }

        public void Stop()
        {
            // Cleanup
        }
    }
}
```

## csproj Template Snippet

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework><!-- TODO: Set to SDK-required framework --></TargetFramework>
    <AssemblyName>SimHubPlugin</AssemblyName>
    <RootNamespace>SimHubPlugin</RootNamespace>
  </PropertyGroup>

  <ItemGroup>
    <!-- TODO: Reference SimHub SDK assemblies -->
    <!-- <Reference Include="SimHub.SDK"> -->
    <!--   <HintPath>SIMHUB_INSTALL_DIR\SDK\SimHub.SDK.dll</HintPath> -->
    <!-- </Reference> -->
  </ItemGroup>
</Project>
```

## Build and Deploy (PowerShell)

```powershell
# Build
dotnet build -c Debug

# Deploy (update paths for your system)
$SimHubInstall = "SIMHUB_INSTALL_DIR"
$PluginOut = "bin\\Debug\\"
Copy-Item "$PluginOut\\SimHubPlugin.dll" "$SimHubInstall\\Plugins\\" -Force
```
