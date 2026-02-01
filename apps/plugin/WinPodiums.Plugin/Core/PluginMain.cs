using System;
using System.Threading.Tasks;
using System.Windows.Media;
using GameReaderCommon;
using SimHub.Plugins;
using WinPodiums.Plugin.Auth;
using WinPodiums.Plugin.Services;

namespace WinPodiums.Plugin.Core
{
    /// <summary>
    /// SimHub plugin entry point. Phase 1: manual token auth + one heartbeat API call.
    /// Implements IPlugin and IDataPlugin so SimHub loads the DLL. See docs/design/components/simhub-plugin.md.
    /// </summary>
    [PluginName("WinPodiums")]
    [PluginDescription("WinPodiums telemetry verification and podium submission.")]
    [PluginAuthor("WinPodiums")]
    public class PluginMain : IPlugin, IDataPlugin
    {
        private ApiClient? _apiClient;
        private string _apiBaseUrl = "https://winpodiums.com";

        /// <summary>Instance of the current plugin manager (set by SimHub).</summary>
        public PluginManager PluginManager { get; set; } = null!;

        /// <summary>Left menu icon (24x24). Null uses default.</summary>
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
            _apiBaseUrl = baseUrl?.TrimEnd('/') ?? "https://winpodiums.com";
            _apiClient = new ApiClient(_apiBaseUrl);
        }

        /// <summary>
        /// Whether the plugin has a stored session (Discord ID + access token).
        /// </summary>
        public bool IsAuthenticated
        {
            get
            {
                var (token, _) = TokenStorage.Load();
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
                var (_, discordId) = TokenStorage.Load();
                return discordId;
            }
        }

        /// <summary>
        /// Authenticate using a one-time token from the website (manual flow).
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
                TokenStorage.Save(result.AccessToken!, result.DiscordId!);
                return true;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Send a heartbeat to the API (one verification flow). Uses stored access token.
        /// </summary>
        /// <param name="pluginVersion">Plugin version string (e.g. 1.0.0).</param>
        /// <returns>True if heartbeat was accepted.</returns>
        public async Task<bool> SendHeartbeatAsync(string pluginVersion = "1.0.0")
        {
            var (accessToken, _) = TokenStorage.Load();
            if (string.IsNullOrEmpty(accessToken) || _apiClient == null)
                return false;
            try
            {
                await _apiClient.HeartbeatAsync(accessToken!, pluginVersion);
                return true;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Clear stored tokens (logout).
        /// </summary>
        public void Logout()
        {
            TokenStorage.Clear();
        }
    }
}
