import { describe, it, expect, vi } from 'vitest';
import React, { Profiler } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AppProvider } from '../src/context/AppContext';
import Navbar from '../src/components/Navbar';
import ProfileModal from '../src/components/ProfileModal';
import DigitalJapaMala from '../src/components/SadhanaGamification/DigitalJapaMala';
import { computePanchang } from '../src/services/ephemerisEngine';

describe('Real React Component Render-Count Verification (Non-Mocked Production Components)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 26, 12, 0, 0));
    // Mock global fetch so any background API calls in mounted components do not fail
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({})
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('proves Navbar and ProfileModal do NOT re-render on Japa Mala bead clicks', async () => {
    let navbarRenderCount = 0;
    let profileModalRenderCount = 0;
    let japaRenderCount = 0;

    const onNavbarRender = vi.fn(() => {
      navbarRenderCount++;
    });

    const onProfileModalRender = vi.fn(() => {
      profileModalRenderCount++;
    });

    const onJapaRender = vi.fn(() => {
      japaRenderCount++;
    });

    const mockSetActiveSection = vi.fn();
    const panchang = computePanchang(new Date(), 28.6139, 77.2090);

    // Mount actual production components wrapped in real AppProvider
    render(
      <AppProvider>
        {/* Actual Navbar component wrapped in React Profiler */}
        <Profiler id="navbar-profiler" onRender={onNavbarRender}>
          <Navbar
            activeSection="sadhana"
            setActiveSection={mockSetActiveSection}
            panchangData={panchang}
          />
        </Profiler>

        {/* Actual ProfileModal component wrapped in React Profiler */}
        <Profiler id="profile-modal-profiler" onRender={onProfileModalRender}>
          <ProfileModal
            isOpen={false}
            onClose={() => {}}
            initialTab="profile"
          />
        </Profiler>

        {/* Actual DigitalJapaMala component wrapped in React Profiler */}
        <Profiler id="japa-profiler" onRender={onJapaRender}>
          <DigitalJapaMala />
        </Profiler>
      </AppProvider>
    );

    // Initial mount checks
    expect(navbarRenderCount).toBe(1);
    expect(profileModalRenderCount).toBe(1);
    expect(japaRenderCount).toBe(1);

    // Locate the actual physical Bead Tap Button in the DOM
    const beadButton = screen.getByRole('button', {
      name: /मनका स्पर्श - जप आगे बढ़ाएँ/i
    });
    expect(beadButton).toBeTruthy();
    expect(beadButton.textContent).toContain('0'); // initial 0 bead count

    // Simulate clicking beads 15 times with natural human intervals (>250ms with jitter)
    for (let i = 1; i <= 15; i++) {
      act(() => {
        vi.advanceTimersByTime(850 + (i % 7) * 30);
      });
      act(() => {
        fireEvent.click(beadButton, {
          clientX: 150 + (i % 4) * 3,
          clientY: 250 + (i % 3) * 2
        });
      });
    }

    // Verify bead count updated inside JapaMala
    expect(beadButton.textContent).toContain('15');

    // PROOF 1: DigitalJapaMala re-rendered on state changes
    expect(japaRenderCount).toBeGreaterThanOrEqual(16); // 1 initial + 15 clicks

    // PROOF 2: Navbar render count MUST REMAIN EXACTLY 1 (ZERO re-renders on bead clicks)
    expect(navbarRenderCount).toBe(1);

    // PROOF 3: ProfileModal render count MUST REMAIN EXACTLY 1 (ZERO re-renders on bead clicks)
    expect(profileModalRenderCount).toBe(1);

    // Double check onRender callbacks were only called once for Navbar and ProfileModal
    expect(onNavbarRender).toHaveBeenCalledTimes(1);
    expect(onProfileModalRender).toHaveBeenCalledTimes(1);
  });
});
