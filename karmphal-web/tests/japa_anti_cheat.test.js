import { describe, it } from 'node:test';
import assert from 'node:assert';
import { evaluateJapaTap } from '../src/services/japaAntiCheat.js';

describe('Akshar Vega Rakshak - Fair Anti-Cheat Japa Evaluation', () => {

  it('Steady real human japa rhythm must NOT be flagged as a bot', () => {
    const history = [];
    let currentTime = 1000;
    // Simulate a disciplined sadhaka chanting Gayatri Mantra with steady cadence:
    // mean around 850ms with typical human physiological motor variance (±15ms)
    // and slight pointer movement between taps
    const steadyHumanDeltas = [
      852, 847, 855, 848, 851, 846, 853, 850, 848, 854,
      849, 852, 847, 853, 850, 851, 848, 854, 849, 852
    ];

    let allAccepted = true;
    let anyMechanical = false;

    steadyHumanDeltas.forEach((delta, index) => {
      currentTime += delta;
      // Human finger has slight natural touch coordinate variance
      const coords = { x: 150 + (index % 5), y: 300 + ((index * 2) % 6) };
      const res = evaluateJapaTap(history, currentTime, coords, 'hi');

      if (!res.accepted) allAccepted = false;
      if (res.status === 'mechanical') anyMechanical = true;
    });

    assert.strictEqual(allAccepted, true, 'Disciplined steady human taps must all be accepted');
    assert.strictEqual(anyMechanical, false, 'Disciplined steady human must NEVER be flagged as mechanical/bot');
    assert.strictEqual(history.length >= 15, true, 'History recorded taps');
  });

  it('Auto-clicker with perfect zero-variance intervals & fixed coordinates is detected and rejected', () => {
    const history = [];
    let botTime = 1000;
    let botDetected = false;

    // Simulate an auto-clicker clicking at exact 200ms interval (0ms variance) at exact same pixel
    for (let i = 0; i < 20; i++) {
      botTime += 200;
      const coords = { x: 100, y: 100 }; // Zero coordinate variance
      const res = evaluateJapaTap(history, botTime, coords, 'hi');

      if (res.status === 'mechanical' && !res.accepted) {
        botDetected = true;
        assert.ok(res.notice.includes('यांत्रिक लय'), 'Notice informs user of automated cadence');
        break;
      }
    }

    assert.strictEqual(botDetected, true, 'Auto-clicker with 0ms variance must be flagged as mechanical');
  });

  it('Impossible speed (<150ms) is throttled with a gentle notice', () => {
    const history = [{ timestamp: 1000, delta: null, x: 100, y: 100 }];
    const res = evaluateJapaTap(history, 1100, { x: 100, y: 100 }, 'hi'); // 100ms delta

    assert.strictEqual(res.accepted, false, 'Tap faster than 150ms must be rejected');
    assert.strictEqual(res.status, 'throttled', 'Status must be throttled');
    assert.ok(res.notice.includes('अति-तीव्र वेग'), 'Guidance asks chanter to slow down');
  });

  it('Fast human chanter (300-380ms) receives soft guidance while bead is still counted', () => {
    const history = [];
    let time = 1000;
    let receivedSoftGuidance = false;

    // Human chanting briskly with natural human jitter
    const briskHumanDeltas = [
      360, 340, 370, 350, 355, 345, 365, 350, 340, 360,
      355, 345, 365, 350, 340, 360, 350, 345, 355, 350
    ];

    let lastResult = null;
    briskHumanDeltas.forEach((delta, idx) => {
      time += delta;
      const coords = { x: 200 + (idx % 7), y: 350 + (idx % 9) };
      lastResult = evaluateJapaTap(history, time, coords, 'hi');
      if (lastResult.notice && lastResult.notice.includes('एकाग्रता एवं सात्विक शान्ति')) {
        receivedSoftGuidance = true;
      }
    });

    assert.strictEqual(lastResult.accepted, true, 'Brisk human taps must be accepted, not blocked');
    assert.strictEqual(receivedSoftGuidance, true, 'User receives gentle reminder to slow down without blocking');
  });

});
