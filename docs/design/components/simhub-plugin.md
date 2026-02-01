# Low-Level Design: SimHub Plugin

**Component**: WinPodiums SimHub Plugin  
**Technology**: C# / .NET Framework 4.8 (WPF)  
**Platform**: Windows 10/11  
**Version**: 1.0

## Overview

The SimHub plugin is a desktop application that monitors sim racing telemetry via SimHub SDK and automatically verifies podium finishes by submitting encrypted race results to the WinPodiums API.

### Responsibilities
- Listen to SimHub telemetry events for race completion
- Detect podium finishes (Position ≤ 3) in competitive sessions
- Provide local authentication UI (3 methods: browser, QR, manual token)
- Build and sign telemetry payloads with HMAC-SHA256
- Submit verified race results to API
- Display real-time monitoring status ("Scrutineering Panel")
- Handle plugin updates and version checking

## Architecture

### Module Structure

```
WinPodiums.Plugin/
├── Core/
│   ├── PluginMain.cs              # SimHub plugin entry point, lifecycle hooks
│   ├── TelemetryMonitor.cs        # SessionEnd event listener
│   ├── VerificationService.cs     # Payload builder, HMAC signer, API client
│   └── ConfigManager.cs           # DPAPI-encrypted local storage
├── Auth/
│   ├── AuthenticationManager.cs   # Orchestrates all auth methods
│   ├── BrowserAuthFlow.cs         # OAuth2 + PKCE with loopback listener
│   ├── QRCodeAuthFlow.cs          # QR generation and polling
│   ├── ManualTokenAuthFlow.cs     # Token input and validation
│   └── TokenStorage.cs            # DPAPI wrapper for token encryption
├── UI/
│   ├── MainWindow.xaml/.cs        # Primary plugin window (Scrutineering Panel)
│   ├── AuthWindow.xaml/.cs        # Authentication method selection
│   ├── QRCodeWindow.xaml/.cs      # QR code display
│   └── StatusIndicator.xaml/.cs   # Real-time status widget
├── Models/
│   ├── RaceResult.cs              # Telemetry data model
│   ├── UserProfile.cs             # Local user state
│   └── PluginConfig.cs            # Configuration model
└── Utils/
    ├── PKCEGenerator.cs           # PKCE verifier/challenge generator
    ├── HMACHelper.cs              # HMAC-SHA256 signing
    └── HttpClientFactory.cs       # Configured HttpClient instances
```

### Class Diagram (Key Classes)

```csharp
// Core Plugin Entry Point
public class PluginMain : IPlugin, IDataPlugin
{
    public void Init(PluginManager pluginManager);
    public void DataUpdate(PluginManager pluginManager, ref GameData data);
    public void End(PluginManager pluginManager);
    
    private TelemetryMonitor _monitor;
    private AuthenticationManager _auth;
    private VerificationService _verification;
}

// Telemetry Monitoring
public class TelemetryMonitor
{
    public event EventHandler<RaceResult> PodiumDetected;
    
    public void OnSessionEnd(GameData data);
    private bool IsPodiumFinish(int position);
    private bool IsCompetitiveSession(SessionData session);
}

// Authentication Manager
public class AuthenticationManager
{
    public bool IsAuthenticated { get; }
    public string DiscordId { get; }
    
    public Task<AuthResult> AuthenticateAsync(AuthMethod method);
    public Task<bool> RefreshTokenAsync();
    public void Logout();
    
    private BrowserAuthFlow _browserAuth;
    private QRCodeAuthFlow _qrAuth;
    private ManualTokenAuthFlow _manualAuth;
    private TokenStorage _tokenStorage;
}

// Verification Service
public class VerificationService
{
    public async Task<VerificationResult> SubmitRaceResultAsync(RaceResult result);
    
    private string BuildPayload(RaceResult result);
    private string SignPayload(string payload, string secret);
    private Task<HttpResponseMessage> PostToApiAsync(string endpoint, object body);
}
```

## Authentication Flows

### Method 1: Browser Launch (PKCE)

```csharp
public class BrowserAuthFlow
{
    public async Task<AuthResult> AuthenticateAsync()
    {
        // 1. Generate PKCE parameters
        string codeVerifier = PKCEGenerator.GenerateVerifier();
        string codeChallenge = PKCEGenerator.GenerateChallenge(codeVerifier);
        string state = GenerateRandomState();
        
        // 2. Start local loopback listener
        int port = FindAvailablePort(); // Random port 50000-60000
        var listener = new HttpListener();
        listener.Prefixes.Add($"http://127.0.0.1:{port}/callback/");
        listener.Start();
        
        // 3. Open browser with Discord OAuth URL
        string authUrl = $"https://discord.com/oauth2/authorize" +
            $"?client_id={ClientId}" +
            $"&redirect_uri=http://127.0.0.1:{port}/callback" +
            $"&response_type=code" +
            $"&scope=identify" +
            $"&state={state}" +
            $"&code_challenge={codeChallenge}" +
            $"&code_challenge_method=S256";
        
        Process.Start(new ProcessStartInfo(authUrl) { UseShellExecute = true });
        
        // 4. Wait for callback (with 5-minute timeout)
        var context = await listener.GetContextAsync().WithTimeout(TimeSpan.FromMinutes(5));
        var query = context.Request.QueryString;
        
        // 5. Validate state
        if (query["state"] != state)
            throw new SecurityException("State mismatch");
        
        // 6. Exchange code for tokens
        string authCode = query["code"];
        var tokens = await ExchangeCodeForTokensAsync(authCode, codeVerifier, port);
        
        // 7. Store tokens with DPAPI
        _tokenStorage.SaveTokens(tokens);
        
        // 8. Close listener
        listener.Stop();
        
        return new AuthResult { Success = true, DiscordId = tokens.DiscordId };
    }
    
    private async Task<TokenResponse> ExchangeCodeForTokensAsync(
        string code, string verifier, int port)
    {
        var response = await _httpClient.PostAsync(
            "https://winpodiums.com/api/auth/discord/exchange",
            new {
                code = code,
                codeVerifier = verifier,
                redirectUri = $"http://127.0.0.1:{port}/callback"
            });
        
        return await response.Content.ReadAsAsync<TokenResponse>();
    }
}
```

### Method 2: QR Code (Polling)

```csharp
public class QRCodeAuthFlow
{
    public async Task<AuthResult> AuthenticateAsync()
    {
        // 1. Generate session ID
        string sessionId = Guid.NewGuid().ToString();
        
        // 2. Build OAuth URL with session ID in state
        string authUrl = $"https://discord.com/oauth2/authorize" +
            $"?client_id={ClientId}" +
            $"&redirect_uri=https://winpodiums.com/auth/qr-callback" +
            $"&response_type=code" +
            $"&scope=identify" +
            $"&state={sessionId}";
        
        // 3. Generate QR code image
        var qrImage = QRCodeGenerator.Generate(authUrl);
        
        // 4. Display QR code in UI
        ShowQRCodeWindow(qrImage, sessionId);
        
        // 5. Poll API for session completion (every 2 seconds, max 10 minutes)
        var cts = new CancellationTokenSource(TimeSpan.FromMinutes(10));
        
        while (!cts.Token.IsCancellationRequested)
        {
            var response = await _httpClient.GetAsync(
                $"https://winpodiums.com/api/auth/qr-status/{sessionId}",
                cts.Token);
            
            var status = await response.Content.ReadAsAsync<QRStatusResponse>();
            
            if (status.Status == "completed")
            {
                // Tokens received!
                _tokenStorage.SaveTokens(status.Tokens);
                CloseQRCodeWindow();
                return new AuthResult { Success = true, DiscordId = status.DiscordId };
            }
            else if (status.Status == "expired")
            {
                CloseQRCodeWindow();
                throw new TimeoutException("QR session expired");
            }
            
            // Poll every 2 seconds
            await Task.Delay(2000, cts.Token);
        }
        
        CloseQRCodeWindow();
        throw new TimeoutException("QR authentication timed out");
    }
}
```

### Method 3: Manual Token (Input)

```csharp
public class ManualTokenAuthFlow
{
    public async Task<AuthResult> AuthenticateAsync()
    {
        // 1. Show token input UI
        string token = ShowTokenInputDialog();
        
        if (string.IsNullOrWhiteSpace(token))
            return new AuthResult { Success = false, Error = "No token provided" };
        
        // 2. Validate and exchange token
        var response = await _httpClient.PostAsync(
            "https://winpodiums.com/api/auth/token-exchange",
            new { token = token.Trim().ToUpper() });
        
        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            return new AuthResult { Success = false, Error = error };
        }
        
        // 3. Store tokens
        var tokens = await response.Content.ReadAsAsync<TokenResponse>();
        _tokenStorage.SaveTokens(tokens);
        
        return new AuthResult { Success = true, DiscordId = tokens.DiscordId };
    }
}
```

## Telemetry Submission

### Race Result Payload

```csharp
public class RaceResult
{
    public string DiscordId { get; set; }
    public DateTime Timestamp { get; set; }
    public string Nonce { get; set; } // UUID v4
    
    public SessionData Session { get; set; }
    public string Signature { get; set; } // HMAC-SHA256
}

public class SessionData
{
    public string TrackName { get; set; }
    public string VehicleClass { get; set; }
    public string SimPlatform { get; set; } // "iRacing", "ACC", "rFactor2"
    public int FinalPosition { get; set; } // 1, 2, or 3
    public string SessionType { get; set; } // "race", "qualifying", "time_trial"
    public double CompetitivenessScore { get; set; } // 0-10
    public int ParticipantCount { get; set; }
    public List<double> LapTimes { get; set; }
    public int Incidents { get; set; }
}
```

### Payload Signing and Submission

```csharp
public class VerificationService
{
    private readonly string _sharedSecret; // Loaded from secure config
    
    public async Task<VerificationResult> SubmitRaceResultAsync(RaceResult result)
    {
        // 1. Build payload (without signature)
        result.Nonce = Guid.NewGuid().ToString();
        result.Timestamp = DateTime.UtcNow;
        
        string payload = JsonConvert.SerializeObject(result.Session);
        
        // 2. Sign payload
        string dataToSign = $"{result.DiscordId}|{result.Timestamp:O}|{result.Nonce}|{payload}";
        result.Signature = HMACHelper.ComputeHMACSHA256(dataToSign, _sharedSecret);
        
        // 3. Submit to API
        var response = await _httpClient.PostAsJsonAsync(
            "https://winpodiums.com/api/plugin/verify",
            result);
        
        // 4. Parse response
        if (response.IsSuccessStatusCode)
        {
            var apiResult = await response.Content.ReadAsAsync<VerificationApiResponse>();
            return new VerificationResult
            {
                Success = true,
                Verified = apiResult.Verified,
                NewState = apiResult.NewState,
                Message = apiResult.Message
            };
        }
        else
        {
            var error = await response.Content.ReadAsStringAsync();
            return new VerificationResult { Success = false, Error = error };
        }
    }
}
```

## Data Storage (DPAPI Encryption)

```csharp
public class TokenStorage
{
    private readonly string _configPath = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
        "WinPodiums", "config.dat");
    
    public void SaveTokens(TokenResponse tokens)
    {
        var data = JsonConvert.SerializeObject(tokens);
        var encrypted = ProtectedData.Protect(
            Encoding.UTF8.GetBytes(data),
            null, // null = current user scope
            DataProtectionScope.CurrentUser);
        
        Directory.CreateDirectory(Path.GetDirectoryName(_configPath));
        File.WriteAllBytes(_configPath, encrypted);
    }
    
    public TokenResponse LoadTokens()
    {
        if (!File.Exists(_configPath))
            return null;
        
        var encrypted = File.ReadAllBytes(_configPath);
        var decrypted = ProtectedData.Unprotect(
            encrypted,
            null,
            DataProtectionScope.CurrentUser);
        
        var json = Encoding.UTF8.GetString(decrypted);
        return JsonConvert.DeserializeObject<TokenResponse>(json);
    }
    
    public void ClearTokens()
    {
        if (File.Exists(_configPath))
            File.Delete(_configPath);
    }
}
```

## UI Components

### Scrutineering Panel (Main UI)

WPF XAML structure:

```xml
<Window x:Class="WinPodiums.Plugin.UI.MainWindow"
        Title="WinPodiums — Scrutineering Panel"
        Width="400" Height="600"
        Background="#FAFAFA">
    <Grid>
        <!-- Header -->
        <StackPanel Background="#1A1A1A" Height="80">
            <TextBlock Text="WINPODIUMS" Foreground="#D4AF37" 
                       FontSize="24" FontWeight="Light" Margin="20,20,0,0"/>
            <TextBlock Text="Scrutineering Panel" Foreground="#FAFAFA"
                       FontSize="14" Margin="20,5,0,0"/>
        </StackPanel>
        
        <!-- Auth Status -->
        <StackPanel Margin="20,100,20,0">
            <TextBlock Text="Authentication Status" FontSize="16" FontWeight="Medium"/>
            <Border BorderBrush="#E5E4E2" BorderThickness="1" Margin="0,10,0,0" Padding="15">
                <!-- If authenticated -->
                <StackPanel x:Name="AuthenticatedPanel" Visibility="{Binding IsAuthenticated}">
                    <TextBlock Text="✓ Linked to Discord" Foreground="#D4AF37"/>
                    <TextBlock Text="{Binding DiscordUsername}" FontSize="18" Margin="0,5,0,0"/>
                </StackPanel>
                
                <!-- If not authenticated -->
                <Button x:Name="AuthButton" Content="Link to Discord" 
                        Visibility="{Binding IsNotAuthenticated}"
                        Click="OnAuthButtonClick"/>
            </Border>
        </StackPanel>
        
        <!-- Monitoring Status -->
        <StackPanel Margin="20,250,20,0">
            <TextBlock Text="Telemetry Monitoring" FontSize="16" FontWeight="Medium"/>
            <Border BorderBrush="#E5E4E2" BorderThickness="1" Margin="0,10,0,0" Padding="15">
                <StackPanel>
                    <TextBlock Text="{Binding MonitoringStatus}"/>
                    <TextBlock Text="{Binding LastRaceDate}" Margin="0,5,0,0"/>
                    <TextBlock Text="{Binding TotalPodiums}" FontSize="24" Margin="0,10,0,0"/>
                </StackPanel>
            </Border>
        </StackPanel>
        
        <!-- Plugin Health -->
        <StackPanel Margin="20,450,20,0">
            <TextBlock Text="Plugin Health" FontSize="16" FontWeight="Medium"/>
            <Grid Margin="0,10,0,0">
                <Ellipse Width="12" Height="12" Fill="{Binding HealthColor}" HorizontalAlignment="Left"/>
                <TextBlock Text="{Binding HealthStatus}" Margin="20,0,0,0"/>
            </Grid>
        </StackPanel>
    </Grid>
</Window>
```

## Dependencies

### NuGet Packages
- `Newtonsoft.Json` (^13.0) — JSON serialization
- `QRCoder` (^1.4) — QR code generation
- `System.Net.Http` (Built-in) — HTTP client

### External Dependencies
- **SimHub SDK** — Installed with SimHub, referenced via DLL
- **Discord OAuth2 API** — External REST API

## Testing Strategy

### Unit Tests
- PKCE generation (verifier, challenge)
- HMAC signing (payload integrity)
- Token encryption/decryption (DPAPI)
- Payload serialization (JSON structure)

### Integration Tests
- Loopback listener (browser auth flow)
- API endpoints (auth, verify, heartbeat)
- QR polling loop (timeout handling)

### Manual Testing
- Install on clean Windows machine
- Test all three auth methods
- Trigger podium finish in sim
- Verify telemetry submission
- Test plugin update flow

## Deployment

### Build Configuration
- **Target Framework**: .NET Framework 4.8
- **Platform**: x64 (64-bit SimHub requirement)
- **Output**: Single DLL (`WinPodiums.Plugin.dll`) + dependencies

### Installation
1. User downloads installer (generic or pre-linked) from R2
2. Installer copies DLL to `C:\Program Files (x86)\SimHub\Plugins\`
3. User restarts SimHub
4. Plugin auto-loads, shows first-launch UI

**Canonical SimHub path (this repo)**: Use `C:\Program Files (x86)\SimHub` as the SimHub install root and `C:\Program Files (x86)\SimHub\Plugins` for the plugins folder in all documentation and code references.

### Updates
- Plugin checks for updates on every heartbeat (5 minutes)
- API returns latest version number
- If update available, shows in-plugin notification
- User clicks "Update" → downloads new DLL from R2 → restarts SimHub

## Security Considerations

- **No Client Secrets**: OAuth2 PKCE flow prevents secret exposure
- **Token Encryption**: All tokens encrypted with DPAPI (user-specific)
- **Signature Verification**: HMAC-SHA256 prevents payload tampering
- **Nonce Anti-Replay**: Each submission uses unique nonce
- **Secret Rotation**: Shared HMAC secret rotates every 90 days
- **HTTPS Only**: All API communication over TLS 1.3

## Performance

- **Telemetry Processing**: <50ms to detect podium finish
- **Auth Flows**: Browser launch <5s, QR code polling <60s, manual token <10s
- **API Submission**: <500ms round-trip time (with retries)
- **UI Responsiveness**: All API calls async, UI never blocks

## Related Documentation

- [Discord Integration LLD](../integrations/discord-integration.md) — Detailed auth sequence diagrams
- [API Documentation](../../api/plugin.md) — Plugin endpoint specs
- [Deployment Guide](../../guides/deployment.md) — Release process
