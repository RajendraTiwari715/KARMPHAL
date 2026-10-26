import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export const BACK_PRIORITY = {
  MODAL: 100,
  PDF_READER: 50,
  SUB_VIEW: 30,
  NAVIGATION: 10
};

class BackButtonService {
  constructor() {
    this.handlers = [];
    this.lastBackPressTime = 0;
    this.navigationHandler = null;
    this.isHomeChecker = null;
    this.exitToastCallback = null;
    this.appListenerAdded = false;
  }

  /**
   * Register a back button action handler.
   * Higher priority handlers are evaluated first.
   * Equal priority handlers execute LIFO (most recently registered first).
   *
   * @param {() => boolean} handler Function returning true if it consumed the event
   * @param {number} priority Priority level from BACK_PRIORITY
   * @returns {() => void} Unregister cleanup function
   */
  register(handler, priority = BACK_PRIORITY.MODAL) {
    const entry = {
      id: Math.random().toString(36).substring(2, 9),
      handler,
      priority,
      createdAt: Date.now()
    };

    this.handlers.push(entry);

    // Sort descending by priority, and descending by createdAt for LIFO within same priority
    this.handlers.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return b.createdAt - a.createdAt;
    });

    return () => {
      this.handlers = this.handlers.filter(h => h.id !== entry.id);
    };
  }

  /**
   * Set navigation handler and home screen checker
   */
  configureNavigation({ isHome, popNavigation, showExitNotice, exitApp }) {
    this.isHomeChecker = isHome;
    this.navigationHandler = popNavigation;
    this.exitToastCallback = showExitNotice;
    this.exitAppHandler = exitApp || (() => {
      if (Capacitor.isNativePlatform()) {
        App.exitApp();
      }
    });
  }

  /**
   * Central Back Button Processor.
   * Evaluates handlers in priority order:
   * 1. Top-most modal / dialog (Priority >= 100)
   * 2. PDF reader (Priority 50)
   * 3. Sub-views / Screen navigation (Priority < 50)
   * 4. Double-press within 2s on Home screen to exit
   *
   * @returns {Promise<'MODAL_CLOSED' | 'PDF_CLOSED' | 'NAVIGATED_BACK' | 'EXIT_PROMPTED' | 'EXITED' | 'UNHANDLED'>}
   */
  async handleBackButton() {
    // 1. Iterate through registered handlers (top modal, PDF reader, sub-views)
    for (const entry of [...this.handlers]) {
      try {
        const handled = entry.handler();
        if (handled) {
          if (entry.priority >= BACK_PRIORITY.MODAL) return 'MODAL_CLOSED';
          if (entry.priority >= BACK_PRIORITY.PDF_READER) return 'PDF_CLOSED';
          return 'NAVIGATED_BACK';
        }
      } catch (err) {
        console.error('[BackButtonService] Handler execution error:', err);
      }
    }

    // 2. Tab / screen history navigation
    if (this.navigationHandler) {
      const navigated = this.navigationHandler();
      if (navigated) {
        return 'NAVIGATED_BACK';
      }
    }

    // 3. Home Screen double-press within 2s check
    const isHome = this.isHomeChecker ? this.isHomeChecker() : true;
    if (isHome) {
      const now = Date.now();
      const timeSinceLastPress = now - this.lastBackPressTime;

      if (timeSinceLastPress < 2000) {
        // Double-press within 2s confirmed -> exit
        if (this.exitAppHandler) {
          this.exitAppHandler();
        }
        return 'EXITED';
      } else {
        // First press on home screen -> record time and show prompt
        this.lastBackPressTime = now;
        if (this.exitToastCallback) {
          this.exitToastCallback();
        } else if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(
            new CustomEvent('karmphal:toast', {
              detail: {
                type: 'info',
                title: 'कर्मफल',
                message: 'बाहर निकलने के लिए पुनः दबाएं (Press again to exit)',
                duration: 2000
              }
            })
          );
        }
        return 'EXIT_PROMPTED';
      }
    }

    return 'UNHANDLED';
  }

  /**
   * Initialize native backButton listener with Capacitor App plugin
   */
  initNativeListener() {
    if (this.appListenerAdded) return;
    if (Capacitor.isNativePlatform()) {
      App.addListener('backButton', () => {
        this.handleBackButton();
      });
      this.appListenerAdded = true;
    }
  }
}

export const backButtonService = new BackButtonService();
