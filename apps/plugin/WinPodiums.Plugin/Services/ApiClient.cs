using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace WinPodiums.Plugin.Services
{
    /// <summary>
    /// WinPodiums API client: token exchange (manual auth) and heartbeat.
    /// Base URL: https://winpodiums.com or http://localhost:8787 for dev.
    /// </summary>
    public class ApiClient
    {
        private readonly string _baseUrl;
        private readonly HttpClient _http;

        public ApiClient(string baseUrl = "https://winpodiums.com")
        {
            _baseUrl = baseUrl.TrimEnd('/');
            _http = new HttpClient { Timeout = TimeSpan.FromSeconds(15) };
            _http.DefaultRequestHeaders.TryAddWithoutValidation("Accept", "application/json");
        }

        /// <summary>
        /// Exchange a one-time manual token for Discord ID and access token.
        /// </summary>
        public async Task<TokenExchangeResult> TokenExchangeAsync(string tokenCode)
        {
            var url = $"{_baseUrl}/api/auth/token-exchange";
            var body = new JObject { ["token"] = tokenCode?.Trim() };
            var content = new StringContent(body.ToString(), Encoding.UTF8, "application/json");
            var res = await _http.PostAsync(url, content);
            var json = await res.Content.ReadAsStringAsync();
            if (!res.IsSuccessStatusCode)
            {
                var err = TryParseError(json);
                throw new ApiException(err ?? $"HTTP {(int)res.StatusCode}", (int)res.StatusCode);
            }
            var obj = JObject.Parse(json);
            var data = obj["data"];
            if (data == null)
                throw new ApiException("Invalid response: missing data", 200);
            return new TokenExchangeResult
            {
                DiscordId = data["discordId"]?.ToString(),
                AccessToken = data["access_token"]?.ToString(),
                ExpiresIn = data["expires_in"]?.Value<int>() ?? 0
            };
        }

        /// <summary>
        /// Send plugin heartbeat (Bearer token).
        /// </summary>
        public async Task HeartbeatAsync(string accessToken, string pluginVersion = "1.0.0")
        {
            var url = $"{_baseUrl}/api/plugin/heartbeat";
            using var req = new HttpRequestMessage(HttpMethod.Post, url);
            req.Headers.TryAddWithoutValidation("Authorization", "Bearer " + accessToken);
            req.Content = new StringContent(
                JsonConvert.SerializeObject(new { version = pluginVersion }),
                Encoding.UTF8,
                "application/json");
            var res = await _http.SendAsync(req);
            if (!res.IsSuccessStatusCode)
            {
                var json = await res.Content.ReadAsStringAsync();
                var err = TryParseError(json);
                throw new ApiException(err ?? $"HTTP {(int)res.StatusCode}", (int)res.StatusCode);
            }
        }

        private static string? TryParseError(string json)
        {
            try
            {
                var obj = JObject.Parse(json);
                return obj["message"]?.ToString();
            }
            catch
            {
                return null;
            }
        }
    }

    public class TokenExchangeResult
    {
        public string? DiscordId { get; set; }
        public string? AccessToken { get; set; }
        public int ExpiresIn { get; set; }
    }

    public class ApiException : Exception
    {
        public int StatusCode { get; }

        public ApiException(string message, int statusCode) : base(message)
        {
            StatusCode = statusCode;
        }
    }
}
