using System;
using System.Windows;
using System.Windows.Controls;
using WinPodiums.Plugin.Core;

namespace WinPodiums.Plugin.UI
{
    /// <summary>
    /// Minimal SimHub settings panel: Link to Discord, Send heartbeat, status (TP-SPOC-004).
    /// </summary>
    public partial class WinPodiumsSettingsControl : UserControl
    {
        private readonly PluginMain _plugin;

        public WinPodiumsSettingsControl(PluginMain plugin)
        {
            InitializeComponent();
            _plugin = plugin ?? throw new ArgumentNullException(nameof(plugin));
            Loaded += (_, __) => RefreshStatus();
        }

        private void RefreshStatus()
        {
            var linked = _plugin.IsAuthenticated;
            AuthStatusText.Text = linked ? $"Linked" + (string.IsNullOrEmpty(_plugin.DiscordId) ? "" : $" ({_plugin.DiscordId})") : "Not linked";
            LinkButton.Visibility = linked ? Visibility.Collapsed : Visibility.Visible;
            UnlinkButton.Visibility = linked ? Visibility.Visible : Visibility.Collapsed;
            UnlinkButton.IsEnabled = linked;
            HeartbeatButton.IsEnabled = linked;
        }

        private async void LinkButton_Click(object sender, RoutedEventArgs e)
        {
            LinkButton.IsEnabled = false;
            AuthStatusText.Text = "Linking…";
            try
            {
                var ok = await _plugin.AuthenticateWithBrowserAsync().ConfigureAwait(true);
                if (ok)
                {
                    AuthStatusText.Text = "Linked" + (string.IsNullOrEmpty(_plugin.DiscordId) ? "" : $" ({_plugin.DiscordId})");
                    LinkButton.Visibility = Visibility.Collapsed;
                    UnlinkButton.Visibility = Visibility.Visible;
                    UnlinkButton.IsEnabled = true;
                    HeartbeatButton.IsEnabled = true;
                }
                else
                {
                    AuthStatusText.Text = "Link failed";
                }
            }
            catch
            {
                AuthStatusText.Text = "Link failed";
            }
            finally
            {
                LinkButton.IsEnabled = true;
            }
        }

        private void UnlinkButton_Click(object sender, RoutedEventArgs e)
        {
            _plugin.Logout();
            RefreshStatus();
        }

        private async void HeartbeatButton_Click(object sender, RoutedEventArgs e)
        {
            HeartbeatButton.IsEnabled = false;
            HeartbeatStatusText.Text = "Sending…";
            try
            {
                var ok = await _plugin.SendHeartbeatAsync("1.0.0").ConfigureAwait(true);
                HeartbeatStatusText.Text = ok ? "Heartbeat OK" : "Heartbeat failed";
            }
            catch
            {
                HeartbeatStatusText.Text = "Heartbeat failed";
            }
            finally
            {
                HeartbeatButton.IsEnabled = true;
            }
        }
    }
}
