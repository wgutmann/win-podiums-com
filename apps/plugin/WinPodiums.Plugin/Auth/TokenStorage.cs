using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace WinPodiums.Plugin.Auth
{
    /// <summary>
    /// DPAPI-protected storage for access token and Discord ID.
    /// See discord-authentication skill and docs/design/integrations/discord-integration.md.
    /// </summary>
    public static class TokenStorage
    {
        private static readonly byte[] Entropy = Encoding.UTF8.GetBytes("WinPodiums.Plugin.v1");

        public static string GetConfigPath()
        {
            var localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            var dir = Path.Combine(localAppData, "WinPodiums");
            if (!Directory.Exists(dir))
                Directory.CreateDirectory(dir);
            return Path.Combine(dir, "config.dat");
        }

        public static void Save(string accessToken, string discordId)
        {
            if (string.IsNullOrEmpty(accessToken) || string.IsNullOrEmpty(discordId))
                throw new ArgumentException("Access token and Discord ID are required.");
            var payload = $"{discordId}\n{accessToken}";
            var bytes = Encoding.UTF8.GetBytes(payload);
            var protectedBytes = ProtectedData.Protect(bytes, Entropy, DataProtectionScope.CurrentUser);
            File.WriteAllBytes(GetConfigPath(), protectedBytes);
        }

        public static (string? AccessToken, string? DiscordId) Load()
        {
            var path = GetConfigPath();
            if (!File.Exists(path))
                return (null, null);
            try
            {
                var protectedBytes = File.ReadAllBytes(path);
                var bytes = ProtectedData.Unprotect(protectedBytes, Entropy, DataProtectionScope.CurrentUser);
                var payload = Encoding.UTF8.GetString(bytes);
                var parts = payload.Split(new[] { '\n' }, 2);
                if (parts.Length != 2)
                    return (null, null);
                return (parts[1], parts[0]);
            }
            catch
            {
                return (null, null);
            }
        }

        public static void Clear()
        {
            var path = GetConfigPath();
            if (File.Exists(path))
                File.Delete(path);
        }
    }
}
