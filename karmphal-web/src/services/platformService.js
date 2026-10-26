import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';

/**
 * Initializes native platform capabilities for Capacitor Android & iOS:
 * - Edge-to-edge transparent dark status bar for notch & safe-area insets
 * - Keyboard resize mode "body" so webview resizes cleanly above soft keyboard
 */
export async function initCapacitorPlatform() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.setBackgroundColor({ color: '#0A1005' });
  } catch (err) {
    console.warn('[PlatformService] StatusBar setup warning:', err);
  }

  try {
    await Keyboard.setResizeMode({ mode: KeyboardResize.Body });
    await Keyboard.setScroll({ isDisabled: false });
  } catch (err) {
    console.warn('[PlatformService] Keyboard setup warning:', err);
  }
}
