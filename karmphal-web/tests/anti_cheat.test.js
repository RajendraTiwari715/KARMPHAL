import { describe, it, expect } from 'vitest';
import { evaluateJapaTap } from '../src/services/japaAntiCheat';

describe('Akshar Vega Rakshak - Fair Japa Anti-Cheat Unit Tests', () => {
  it('accepts natural disciplined human chanter with physiological variance', () => {
    const history = [];
    let currentTime = 1000;
    const humanDeltas = [852, 847, 855, 848, 851, 846, 853, 850, 848, 854, 849, 852, 847, 853, 850, 851];

    let allAccepted = true;
    let flaggedMechanical = false;

    humanDeltas.forEach((delta, idx) => {
      currentTime += delta;
      const coords = { x: 150 + (idx % 6), y: 300 + ((idx * 2) % 5) };
      const res = evaluateJapaTap(history, currentTime, coords, 'hi');
      if (!res.accepted) allAccepted = false;
      if (res.status === 'mechanical') flaggedMechanical = true;
    });

    expect(allAccepted).toBe(true);
    expect(flaggedMechanical).toBe(false);
  });

  it('rejects robotic auto-clicker macro with zero interval variance & zero coordinate jitter', () => {
    const history = [];
    let botTime = 1000;
    let caughtRobotic = false;

    // Simulate auto-clicker tapping at exact 200ms intervals at identical (100, 100) pixel
    for (let i = 0; i < 20; i++) {
      botTime += 200;
      const res = evaluateJapaTap(history, botTime, { x: 100, y: 100 }, 'hi');
      if (res.status === 'mechanical' && !res.accepted) {
        caughtRobotic = true;
        expect(res.notice).toContain('यांत्रिक लय संसूचित');
        break;
      }
    }

    expect(caughtRobotic).toBe(true);
  });

  it('throttles physically impossible tap velocity (<150ms delta)', () => {
    const history = [{ timestamp: 1000, delta: null, x: 100, y: 100 }];
    const res = evaluateJapaTap(history, 1100, { x: 100, y: 100 }, 'hi'); // 100ms delta

    expect(res.accepted).toBe(false);
    expect(res.status).toBe('throttled');
    expect(res.notice).toContain('अति-तीव्र वेग');
  });

  it('provides soft guidance to fast human chanters (300-380ms) without blocking the bead', () => {
    const history = [];
    let time = 1000;

    let receivedSoftGuidance = false;

    // Fast chanting around 340ms with human variance (±12ms) and finger coordinate motion
    for (let i = 0; i < 18; i++) {
      time += 340 + ((i % 3) * 6 - 6);
      const coords = { x: 150 + (i % 4), y: 200 + (i % 5) };
      const res = evaluateJapaTap(history, time, coords, 'hi');
      if (res.accepted && res.notice?.includes('वेग तीव्र है')) {
        receivedSoftGuidance = true;
      }
    }

    expect(receivedSoftGuidance).toBe(true);
  });

  it('supports English localized notices', () => {
    const history = [{ timestamp: 1000, delta: null, x: 100, y: 100 }];
    const res = evaluateJapaTap(history, 1100, { x: 100, y: 100 }, 'en');
    expect(res.notice).toContain('Velocity too rapid');
  });
});
