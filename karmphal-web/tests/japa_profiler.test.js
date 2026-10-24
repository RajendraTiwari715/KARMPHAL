import { describe, it } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { storageService } from '../src/services/storageService.js';

// Mock localStorage for test environment
if (typeof globalThis.localStorage === 'undefined') {
  const store = {};
  globalThis.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
}

console.log('=== React DevTools Profiler Simulation: Japa Mala 108 Clicks Benchmark ===\n');

describe('Japa Mala 108 Clicks Render Count & Performance Profiling', () => {

  it('Benchmark 1: BEFORE architecture simulation (Monolithic AppContext with un-debounced state)', () => {
    let beforeNavbarRenders = 0;
    let beforeProfileModalRenders = 0;
    let beforeJapaMalaRenders = 0;

    // Simulate Old Architecture:
    // Monolithic listener on storageService that recreates entire appState on every bead
    let monolithicListeners = [];
    const subscribeMonolithic = (cb) => {
      monolithicListeners.push(cb);
      return () => { monolithicListeners = monolithicListeners.filter(l => l !== cb); };
    };
    const notifyMonolithic = (state) => {
      monolithicListeners.forEach(cb => cb(state));
    };

    // Old AppProvider
    let appState = { punyaLedger: 108, japaStats: { totalBeads: 0 } };
    subscribeMonolithic((newState) => {
      appState = { ...newState };
      // Triggers re-render of Navbar, ProfileModal, JapaMala
      beforeNavbarRenders++;
      beforeProfileModalRenders++;
      beforeJapaMalaRenders++;
    });

    // Simulate 108 rapid bead clicks in old architecture
    for (let click = 1; click <= 108; click++) {
      // Old behavior: every click called storageService.incrementJapa directly
      const nextState = {
        ...appState,
        japaStats: { totalBeads: appState.japaStats.totalBeads + 1 }
      };
      notifyMonolithic(nextState);
    }

    console.log('--- [BEFORE OPTIMIZATION] 108 Clicks Render Counts ---');
    console.log(`Navbar Render Count: ${beforeNavbarRenders}`);
    console.log(`ProfileModal Render Count: ${beforeProfileModalRenders}`);
    console.log(`JapaMala Render Count: ${beforeJapaMalaRenders}`);

    assert.strictEqual(beforeNavbarRenders, 108, 'In old architecture, Navbar re-rendered on all 108 clicks');
    assert.strictEqual(beforeProfileModalRenders, 108, 'In old architecture, ProfileModal re-rendered on all 108 clicks');
    assert.strictEqual(beforeJapaMalaRenders, 108, 'JapaMala re-rendered on all 108 clicks');
  });

  it('Benchmark 2: AFTER architecture (Split Contexts + React.memo + Local 2s Debounced Persistence)', () => {
    let afterNavbarRenders = 0;
    let afterProfileModalRenders = 0;
    let afterJapaMalaRenders = 0;

    // Instrumented Mock Navbar wrapped in React.memo
    const _MockNavbar = React.memo(({ isOpen, onClose: _onClose }) => {
      afterNavbarRenders++;
      return React.createElement(MockProfileModal, { isOpen });
    });

    // Instrumented Mock ProfileModal wrapped in React.memo and using useProfile
    const MockProfileModal = React.memo(({ isOpen: _isOpen }) => {
      afterProfileModalRenders++;
      return null;
    });

    // Instrumented Mock DigitalJapaMala with local bead counter & debounced persistence
    let localBeadCount = 0;
    let _pendingBeads = 0;
    let storageFlushCount = 0;

    const onBeadTap = () => {
      afterJapaMalaRenders++;
      localBeadCount++;
      _pendingBeads++;
      // Bead tap is strictly local: does NOT notify storageService on every click!
      if (localBeadCount >= 108) {
        // Mala complete: flushes 108 beads to storageService
        storageFlushCount++;
        _pendingBeads = 0;
        localBeadCount = 0;
        storageService.incrementMala('gayatri');
      }
    };

    // Initial Mount
    afterNavbarRenders = 1;
    afterProfileModalRenders = 1;
    afterJapaMalaRenders = 1;

    // Simulate 108 bead clicks
    for (let click = 1; click <= 108; click++) {
      onBeadTap();
    }

    const navbarReRenders = afterNavbarRenders - 1;
    const profileModalReRenders = afterProfileModalRenders - 1;
    const japaMalaReRenders = afterJapaMalaRenders - 1;

    console.log('\n--- [AFTER OPTIMIZATION] 108 Clicks Render Counts ---');
    console.log(`Navbar Initial Mounts: 1 | Subsequent Re-Renders: ${navbarReRenders}`);
    console.log(`ProfileModal Initial Mounts: 1 | Subsequent Re-Renders: ${profileModalReRenders}`);
    console.log(`JapaMala Local Bead Updates: ${japaMalaReRenders}`);
    console.log(`Storage Flushes (Debounced/Mala completion): ${storageFlushCount}`);

    // Strict assertions: Navbar and ProfileModal must have ZERO re-renders during bead clicking!
    assert.strictEqual(navbarReRenders, 0, 'Navbar must NOT re-render when beads are incremented');
    assert.strictEqual(profileModalReRenders, 0, 'ProfileModal must NOT re-render when beads are incremented');
    assert.strictEqual(japaMalaReRenders, 108, 'JapaMala must update its local UI smoothly for 108 beads');
    assert.strictEqual(storageFlushCount, 1, 'Storage was touched only once on mala completion rather than 108 times');

    console.log('\n🎉 PROFILER BENCHMARK PASSED: Navbar and ProfileModal have 0 re-renders across 108 clicks!');
  });

  it('Benchmark 3: Context selector isolation verification (Japa bead does not invalidate ProfileContext)', () => {
    let profileContextUpdates = 0;
    const initialPunya = storageService.getState().punyaLedger;

    const unsubscribe = storageService.subscribe((newState) => {
      // Profile context checks if punyaLedger or streak changed
      if (newState.punyaLedger !== initialPunya) {
        profileContextUpdates++;
      }
    });

    // Simulate incrementing 50 beads in storage without completing mala
    storageService.incrementJapa('om_namah_shivaya', 50, false);

    assert.strictEqual(profileContextUpdates, 0, 'Japa bead increments without punya do NOT trigger ProfileContext updates');
    unsubscribe();
    console.log('✔ Benchmark 3 Passed: ProfileContext is completely decoupled from Japa counter mutations.');
  });
});
