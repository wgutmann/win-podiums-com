using System;
using System.Diagnostics;
using System.Windows;
using System.Windows.Controls;

namespace WinPodiums.Plugin.UI
{
    /// <summary>
    /// SimHub settings panel: status, API URL, Link to Discord, manual token, Send heartbeat, Log out.
    /// </summary>
    public partial class SettingsControl : UserControl
    {
        private readonly Core.PluginMain _plugin;

        public SettingsControl(Core.PluginMain plugin)
        {
            InitializeComponent();
            _plugin = plugin ?? throw new ArgumentNullException(nameof(plugin));
            Loaded += OnLoaded;
        }

        private void OnLoaded(object sender, RoutedEventArgs e)
        {
            RefreshStatus();
            ApiUrlBox.Text = _plugin.ApiBaseUrl ?? "https://winpodiums.com";
        }

        private void RefreshStatus()
        {
            if (_plugin.IsAuthenticated)
            {
                var id = _plugin.DiscordId;
                StatusText.Text = string.IsNullOrEmpty(id) ? "Linked" : $"Linked (Discord ID: {id})";
                LinkDiscordButton.Visibility = Visibility.Collapsed;
                LogoutButton.Visibility = Visibility.Visible;
                HeartbeatButton.IsEnabled = true;
            }
            else
            {
                StatusText.Text = "Not linked";
                LinkDiscordButton.Visibility = Visibility.Visible;
                LogoutButton.Visibility = Visibility.Visible;
                HeartbeatButton.IsEnabled = false;
            }
        }

        private void SaveUrlButton_Click(object sender, RoutedEventArgs e)
        {
            var url = ApiUrlBox.Text?.Trim();
            if (string.IsNullOrEmpty(url)) return;
            _plugin.SetApiBaseUrl(url!);
            try { _plugin.PluginManager.SetPropertyValue<Core.PluginMain>("WinPodiums.ApiBaseUrl", url); } catch { /* persist optional */ }
            RefreshStatus();
        }

        private void LinkDiscordButton_Click(object sender, RoutedEventArgs e)
        {
            var url = ApiUrlBox.Text?.Trim() ?? "https://winpodiums.com";
            var baseUrl = url.TrimEnd('/');
            try
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = baseUrl + "/auth/discord",
                    UseShellExecute = true
                });
                StatusText.Text = "Log in in the browser, then paste the token below.";
            }
            catch (Exception)
            {
                StatusText.Text = "Could not open browser. Open " + baseUrl + "/auth/discord in your browser.";
            }
        }

        private async void PasteTokenButton_Click(object sender, RoutedEventArgs e)
        {
            var code = TokenBox.Text?.Trim();
            if (string.IsNullOrEmpty(code))
            {
                HeartbeatStatus.Text = "Enter token first.";
                return;
            }
            HeartbeatStatus.Text = "Checking token...";
            var ok = await _plugin.AuthenticateWithManualTokenAsync(code!);
            HeartbeatStatus.Text = ok ? "Token accepted." : "Token invalid or expired.";
            if (ok) RefreshStatus();
        }

        private async void HeartbeatButton_Click(object sender, RoutedEventArgs e)
        {
            HeartbeatStatus.Text = "Sending...";
            var ok = await _plugin.SendHeartbeatAsync("1.0.0");
            HeartbeatStatus.Text = ok ? "Heartbeat OK" : "Heartbeat failed";
        }

        private void LogoutButton_Click(object sender, RoutedEventArgs e)
        {
            _plugin.Logout();
            RefreshStatus();
            HeartbeatStatus.Text = "";
        }
    }
}
