using System;
using System.Security.Cryptography;
using System.Text;

namespace WinPodiums.Plugin.Auth
{
    /// <summary>
    /// PKCE code verifier and code challenge (S256) for Discord OAuth2.
    /// See TP-SPOC-002 and docs/design/integrations/discord-integration.md.
    /// </summary>
    public static class PkceHelper
    {
        /// <summary>Generate a cryptographically random code verifier (43–128 chars, base64url).</summary>
        public static string GenerateVerifier()
        {
            var bytes = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
                rng.GetBytes(bytes);
            return Base64UrlEncode(bytes);
        }

        /// <summary>Compute code challenge = base64url(SHA256(utf8(verifier))). Method S256.</summary>
        public static string GenerateChallenge(string codeVerifier)
        {
            if (string.IsNullOrEmpty(codeVerifier))
                throw new ArgumentNullException(nameof(codeVerifier));
            var bytes = Encoding.UTF8.GetBytes(codeVerifier);
            byte[] hash;
            using (var sha = SHA256.Create())
                hash = sha.ComputeHash(bytes);
            return Base64UrlEncode(hash);
        }

        /// <summary>Generate a random state string for OAuth2 CSRF protection.</summary>
        public static string GenerateState()
        {
            var bytes = new byte[16];
            using (var rng = RandomNumberGenerator.Create())
                rng.GetBytes(bytes);
            return Base64UrlEncode(bytes);
        }

        private static string Base64UrlEncode(byte[] bytes)
        {
            var base64 = Convert.ToBase64String(bytes);
            return base64.TrimEnd('=').Replace('+', '-').Replace('/', '_');
        }
    }
}
