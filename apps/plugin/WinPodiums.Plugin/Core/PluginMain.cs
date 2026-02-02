using System;
using System.Diagnostics;
using System.Net;
using System.Threading.Tasks;
using System.Windows.Controls;
using System.Windows.Media;
using GameReaderCommon;
using SimHub.Plugins;
using Newtonsoft.Json.Linq;
using WinPodiums.Plugin.Auth;
using WinPodiums.Plugin.Services;
using WinPodiums.Plugin.UI;

namespace WinPodiums.Plugin.Core
{
    /// <summary>
    /// SimHub plugin entry point. Phase 1: browser PKCE primary; manual token debug-only; one heartbeat API call.
    /// Implements IPlugin and IDataPlugin so SimHub loads the DLL. See docs/design/components/simhub-plugin.md.
    /// </summary>
    [PluginName("WinPodiums")]
    [PluginDescription("WinPodiums telemetry verification and podium submission.")]
    [PluginAuthor("WinPodiums")]
    public class PluginMain : IPlugin, IDataPlugin, IWPFSettingsV2
    {
        private ApiClient? _apiClient;
        private string _apiBaseUrl = "http://localhost:8787";

        /// <summary>Instance of the current plugin manager (set by SimHub).</summary>
        public PluginManager PluginManager { get; set; } = null!;

        /// <summary>Left menu icon (24x24). Null uses SimHub default; optional 24x24 bitmap can be set for POC+.</summary>
        public ImageSource? PictureIcon => null;

        /// <summary>Short title in SimHub left menu.</summary>
        public string LeftMenuTitle => "WinPodiums";

        /// <summary>Called once after plugin startup. Keeps existing Init logic.</summary>
        public void Init(PluginManager pluginManager)
        {
            PluginManager = pluginManager;
            _apiClient = new ApiClient(_apiBaseUrl);
        }

        /// <summary>Called every game data update. No-op for POC (position detection deferred).</summary>
        public void DataUpdate(PluginManager pluginManager, ref GameData data)
        {
            // Phase 1: no telemetry processing; heartbeat is triggered separately.
        }

        /// <summary>Called at plugin manager stop. Keeps existing End logic.</summary>
        public void End(PluginManager pluginManager)
        {
            _apiClient = null;
        }

        /// <summary>
        /// Set API base URL (e.g. https://winpodiums.com or http://localhost:8787 for dev).
        /// </summary>
        public void SetApiBaseUrl(string baseUrl)
        {
            _apiBaseUrl = baseUrl?.TrimEnd('/') ?? "http://localhost:8787";
            _apiClient = new ApiClient(_apiBaseUrl);
        }

        /// <summary>
        /// Whether the plugin has a stored session (Discord ID + access token).
        /// </summary>
        public bool IsAuthenticated
        {
            get
            {
                var (token, _, _) = TokenStorage.Load();
                return !string.IsNullOrEmpty(token);
            }
        }

        /// <summary>
        /// Current Discord ID if authenticated, otherwise null.
        /// </summary>
        public string? DiscordId
        {
            get
            {
                var (_, discordId, _) = TokenStorage.Load();
                return discordId;
            }
        }

        /// <summary>
        /// Set when session expired (refresh failed). UI should show "Session expired – please log in again".
        /// Cleared when user logs in or on next successful operation.
        /// </summary>
        public bool SessionExpired { get; private set; }

        /// <summary>
        /// Authenticate using browser-launched Discord OAuth (PKCE). Primary auth per PRD-001.
        /// Opens browser; user signs in with Discord; callback returns to plugin; tokens stored with DPAPI.
        /// </summary>
        /// <returns>True if auth succeeded and tokens were stored.</returns>
        public async Task<bool> AuthenticateWithBrowserAsync()
        {
            if (_apiClient == null)
                return false;

            const int callbackPort = 54321;
            var redirectUri = $"http://127.0.0.1:{callbackPort}/callback";

            // #region agent log
            try
            {
                var logPath = @"c:\Users\winth\dev\win-podiums-com\.cursor\debug.log";
                var logObj = new JObject
                {
                    ["location"] = "PluginMain.cs:AuthenticateWithBrowserAsync",
                    ["message"] = "redirect_uri built for Discord",
                    ["data"] = new JObject { ["redirectUri"] = redirectUri, ["callbackPort"] = callbackPort },
                    ["timestamp"] = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                    ["sessionId"] = "debug-session",
                    ["hypothesisId"] = "H1"
                };
                System.IO.File.AppendAllText(logPath, logObj.ToString() + "\n");
            }
            catch { }
            // #endregion

            AuthConfigResult config;
            try
            {
                config = await _apiClient.GetAuthConfigAsync();
            }
            catch
            {
                return false;
            }

            if (string.IsNullOrEmpty(config.DiscordClientId))
                return false;

            var state = PkceHelper.GenerateState();
            var codeVerifier = PkceHelper.GenerateVerifier();
            var codeChallenge = PkceHelper.GenerateChallenge(codeVerifier);

            var authUrl =
                "https://discord.com/api/oauth2/authorize?" +
                $"client_id={Uri.EscapeDataString(config.DiscordClientId)}" +
                $"&redirect_uri={Uri.EscapeDataString(redirectUri)}" +
                "&response_type=code" +
                "&scope=identify" +
                $"&state={Uri.EscapeDataString(state)}" +
                $"&code_challenge={Uri.EscapeDataString(codeChallenge)}" +
                "&code_challenge_method=S256";

            var listener = new HttpListener();
            listener.Prefixes.Add($"http://127.0.0.1:{callbackPort}/callback/");
            listener.Start();

            try
            {
                Process.Start(new ProcessStartInfo(authUrl) { UseShellExecute = true });

                var getContextTask = listener.GetContextAsync();
                var delayTask = Task.Delay(TimeSpan.FromMinutes(5));
                var completed = await Task.WhenAny(getContextTask, delayTask).ConfigureAwait(false);

                if (completed == delayTask)
                {
                    listener.Stop();
                    return false;
                }

                var context = await getContextTask.ConfigureAwait(false);
                var query = context.Request.QueryString;
                var receivedState = query["state"];
                var code = query["code"];

                var responseHtml = "<!DOCTYPE html><html><head><meta charset=\"utf-8\"/><title>WinPodiums</title></head><body><p>Success, you can close this window.</p></body></html>";
                var responseBytes = System.Text.Encoding.UTF8.GetBytes(responseHtml);
                context.Response.ContentType = "text/html; charset=utf-8";
                context.Response.ContentLength64 = responseBytes.Length;
                await context.Response.OutputStream.WriteAsync(responseBytes, 0, responseBytes.Length).ConfigureAwait(false);
                context.Response.OutputStream.Close();

                if (receivedState != state || string.IsNullOrEmpty(code))
                {
                    listener.Stop();
                    return false;
                }

                listener.Stop();

                var result = await _apiClient.DiscordExchangeAsync(code, codeVerifier, redirectUri).ConfigureAwait(false);
                if (string.IsNullOrEmpty(result.AccessToken) || string.IsNullOrEmpty(result.DiscordId))
                    return false;

                SessionExpired = false;
                var expiresAt = result.ExpiresIn > 0
                    ? DateTime.UtcNow.AddSeconds(result.ExpiresIn).ToString("o")
                    : null;
                TokenStorage.Save(result.AccessToken!, result.DiscordId!, expiresAt);
                return true;
            }
            catch
            {
                try { listener.Stop(); } catch { }
                return false;
            }
        }

        /// <summary>
        /// Authenticate using a one-time token from the website (manual flow). Debug only, feature-flagged.
        /// Call after user pastes token from https://winpodiums.com/auth/token.
        /// </summary>
        /// <param name="tokenCode">The 8-character token from the website.</param>
        /// <returns>True if auth succeeded and tokens were stored.</returns>
        public async Task<bool> AuthenticateWithManualTokenAsync(string tokenCode)
        {
            if (_apiClient == null || string.IsNullOrWhiteSpace(tokenCode))
                return false;
            try
            {
                var result = await _apiClient.TokenExchangeAsync(tokenCode);
                if (string.IsNullOrEmpty(result.AccessToken) || string.IsNullOrEmpty(result.DiscordId))
                    return false;
                SessionExpired = false;
                var expiresAt = result.ExpiresIn > 0
                    ? DateTime.UtcNow.AddSeconds(result.ExpiresIn).ToString("o")
                    : null;
                TokenStorage.Save(result.AccessToken!, result.DiscordId!, expiresAt);
                return true;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Execute a protected API call with 401→refresh→retry. On refresh failure, clears storage and sets SessionExpired.
        /// </summary>
        private async Task<bool> CallWithAuthAsync(Func<string, Task> apiCall)
        {
            var (accessToken, discordId, _) = TokenStorage.Load();
            if (string.IsNullOrEmpty(accessToken) || _apiClient == null)
                return false;
            try
            {
                await apiCall(accessToken!);
                SessionExpired = false;
                return true;
            }
            catch (ApiException ex) when (ex.StatusCode == 401)
            {
                var refreshResult = await _apiClient.RefreshAsync(accessToken!);
                if (refreshResult == null || string.IsNullOrEmpty(refreshResult.AccessToken))
                {
                    TokenStorage.Clear();
                    SessionExpired = true;
                    return false;
                }
                var newExpiresAt = refreshResult.ExpiresIn > 0
                    ? DateTime.UtcNow.AddSeconds(refreshResult.ExpiresIn).ToString("o")
                    : null;
                TokenStorage.Save(
                    refreshResult.AccessToken!,
                    refreshResult.DiscordId ?? discordId ?? "",
                    newExpiresAt);
                try
                {
                    await apiCall(refreshResult.AccessToken!);
                    return true;
                }
                catch
                {
                    TokenStorage.Clear();
                    SessionExpired = true;
                    return false;
                }
            }
        }

        /// <summary>
        /// Send a heartbeat to the API (one verification flow). Uses stored access token.
        /// On 401, attempts refresh and retries. On refresh failure, clears storage and sets SessionExpired.
        /// </summary>
        /// <param name="pluginVersion">Plugin version string (e.g. 1.0.0).</param>
        /// <returns>True if heartbeat was accepted.</returns>
        public async Task<bool> SendHeartbeatAsync(string pluginVersion = "1.0.0")
        {
            return await CallWithAuthAsync(token =>
                _apiClient!.HeartbeatAsync(token, pluginVersion));
        }

        /// <summary>
        /// Clear stored tokens (logout).
        /// </summary>
        public void Logout()
        {
            TokenStorage.Clear();
            SessionExpired = false;
        }

        /// <summary>
        /// Return the WPF settings control for SimHub (Login with Discord, Send heartbeat, status). TP-SPOC-004.
        /// </summary>
        public Control GetWPFSettingsControl(PluginManager pluginManager)
        {
            return new WinPodiumsSettingsControl(this);
        }
    }
}
