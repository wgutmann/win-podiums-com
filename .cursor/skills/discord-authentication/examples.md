# Examples (C# / .NET Framework 4.8)

These snippets are minimal building blocks for a SimHub plugin using Discord OAuth2 with PKCE and a loopback redirect. Adjust names and error handling for your plugin.

## PKCE + State Generation

```csharp
using System;
using System.Security.Cryptography;
using System.Text;

static string Base64Url(byte[] data)
{
    return Convert.ToBase64String(data)
        .TrimEnd('=')
        .Replace('+', '-')
        .Replace('/', '_');
}

static string CreateCodeVerifier()
{
    var bytes = new byte[32];
    using (var rng = RandomNumberGenerator.Create())
    {
        rng.GetBytes(bytes);
    }
    return Base64Url(bytes);
}

static string CreateCodeChallenge(string codeVerifier)
{
    using (var sha = SHA256.Create())
    {
        var hash = sha.ComputeHash(Encoding.ASCII.GetBytes(codeVerifier));
        return Base64Url(hash);
    }
}

static string CreateState()
{
    var bytes = new byte[16];
    using (var rng = RandomNumberGenerator.Create())
    {
        rng.GetBytes(bytes);
    }
    return Base64Url(bytes);
}
```

## Build Discord Authorization URL

```csharp
using System;
using System.Web;

static string BuildAuthorizeUrl(string clientId, string redirectUri, string scope, string state, string codeChallenge)
{
    var qs = HttpUtility.ParseQueryString(string.Empty);
    qs["response_type"] = "code";
    qs["client_id"] = clientId;
    qs["redirect_uri"] = redirectUri;
    qs["scope"] = scope; // e.g., "identify"
    qs["state"] = state;
    qs["code_challenge"] = codeChallenge;
    qs["code_challenge_method"] = "S256";
    return "https://discord.com/oauth2/authorize?" + qs.ToString();
}
```

## Loopback Listener (Receive Code)

```csharp
using System;
using System.Net;
using System.Text;
using System.Threading.Tasks;

static async Task<(string Code, string State)> ListenForRedirectAsync(string redirectUri)
{
    var listener = new HttpListener();
    listener.Prefixes.Add(redirectUri.EndsWith("/") ? redirectUri : redirectUri + "/");
    listener.Start();

    var context = await listener.GetContextAsync();
    var request = context.Request;
    var response = context.Response;

    var code = request.QueryString["code"];
    var state = request.QueryString["state"];

    var html = "<html><body>You may close this window.</body></html>";
    var buffer = Encoding.UTF8.GetBytes(html);
    response.ContentLength64 = buffer.Length;
    await response.OutputStream.WriteAsync(buffer, 0, buffer.Length);
    response.OutputStream.Close();

    listener.Stop();
    return (code, state);
}
```

## Exchange Code for Tokens

```csharp
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;

static async Task<string> ExchangeCodeAsync(
    string clientId,
    string redirectUri,
    string code,
    string codeVerifier)
{
    using (var http = new HttpClient())
    {
        var body = new Dictionary<string, string>
        {
            { "client_id", clientId },
            { "grant_type", "authorization_code" },
            { "code", code },
            { "redirect_uri", redirectUri },
            { "code_verifier", codeVerifier }
        };
        var res = await http.PostAsync("https://discord.com/api/oauth2/token",
            new FormUrlEncodedContent(body));
        res.EnsureSuccessStatusCode();
        return await res.Content.ReadAsStringAsync(); // JSON with access_token, refresh_token, expires_in
    }
}
```

## Refresh Token

```csharp
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;

static async Task<string> RefreshTokenAsync(string clientId, string redirectUri, string refreshToken)
{
    using (var http = new HttpClient())
    {
        var body = new Dictionary<string, string>
        {
            { "client_id", clientId },
            { "grant_type", "refresh_token" },
            { "refresh_token", refreshToken },
            { "redirect_uri", redirectUri }
        };
        var res = await http.PostAsync("https://discord.com/api/oauth2/token",
            new FormUrlEncodedContent(body));
        res.EnsureSuccessStatusCode();
        return await res.Content.ReadAsStringAsync();
    }
}
```

## Secure Token Storage (DPAPI)

```csharp
using System;
using System.Security.Cryptography;
using System.Text;

static byte[] Protect(string plaintext)
{
    var data = Encoding.UTF8.GetBytes(plaintext);
    return ProtectedData.Protect(data, null, DataProtectionScope.CurrentUser);
}

static string Unprotect(byte[] cipher)
{
    var data = ProtectedData.Unprotect(cipher, null, DataProtectionScope.CurrentUser);
    return Encoding.UTF8.GetString(data);
}
```

## Minimal Scopes

```
identify
```
