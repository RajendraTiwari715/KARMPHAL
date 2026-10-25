/**
 * Akshar Vega Rakshak - Fair Anti-Cheat Japa Evaluation
 * Combines interval gates, streak constancy, standard deviation, and pointer jitter
 * to distinguish disciplined human chanters from automated clickers/macros.
 */

export function evaluateJapaTap(history, now, coords = null, lang = 'hi') {
  const isEn = lang === 'en';
  const lastTap = history.length > 0 ? history[history.length - 1] : null;

  if (lastTap) {
    const delta = now - lastTap.timestamp;

    // 1. Physically impossible speed gate (<150ms = >400 beads/minute)
    if (delta < 150) {
      return {
        accepted: false,
        status: 'throttled',
        notice: isEn
          ? 'Velocity too rapid. Please chant gently and mindfully.'
          : 'अति-तीव्र वेग: कृपया मन्द एवं एकाग्र गति से जप करें।'
      };
    }

    history.push({
      timestamp: now,
      delta,
      x: coords ? coords.x : null,
      y: coords ? coords.y : null
    });

    if (history.length > 35) {
      history.shift();
    }
  } else {
    history.push({
      timestamp: now,
      delta: null,
      x: coords ? coords.x : null,
      y: coords ? coords.y : null
    });
    return { accepted: true, status: 'pure', notice: null };
  }

  const validDeltas = history.filter(t => t.delta !== null).map(t => t.delta);

  // Require at least 15 intervals to accurately analyze statistical patterns
  if (validDeltas.length >= 15) {
    const recentDeltas = validDeltas.slice(-15);
    const mean = recentDeltas.reduce((a, b) => a + b, 0) / recentDeltas.length;
    const variance = recentDeltas.reduce((acc, d) => acc + Math.pow(d - mean, 2), 0) / recentDeltas.length;
    const stdDev = Math.sqrt(variance);

    // Pointer jitter analysis (if coordinates provided)
    const recentCoords = history.slice(-15).filter(t => t.x !== null && t.y !== null);
    let zeroPointerVariance = false;
    if (recentCoords.length >= 15) {
      const firstX = recentCoords[0].x;
      const firstY = recentCoords[0].y;
      const allSamePixel = recentCoords.every(c => c.x === firstX && c.y === firstY);
      if (allSamePixel) {
        zeroPointerVariance = true;
      }
    }

    // Streak constancy check: absolute difference between min and max delta
    const minDelta = Math.min(...recentDeltas);
    const maxDelta = Math.max(...recentDeltas);
    const deltaSpread = maxDelta - minDelta;

    // TRUE BOT / MACRO SIGNALS COMBINED:
    // Signal A: Machine-level clock constancy (stdDev < 2ms AND spread <= 4ms over 15+ taps)
    // Signal B: Very fast artificial cadence with 0 pointer movement (mean < 350ms AND zeroPointerVariance)
    // Signal C: Ultra-low variance (<1.5ms) at rapid pace (<500ms)
    const isMacroClicker = 
      (stdDev < 2.0 && deltaSpread <= 4 && (zeroPointerVariance || recentCoords.length === 0)) ||
      (mean < 350 && zeroPointerVariance && stdDev < 4.0) ||
      (stdDev < 1.5 && mean < 500);

    if (isMacroClicker) {
      return {
        accepted: false,
        status: 'mechanical',
        notice: isEn
          ? 'Automated cadence detected. Please chant naturally at a steady, peaceful pace.'
          : 'यांत्रिक लय संसूचित: कृपया स्वयं सात्विक भाव से मन्द गति में जप करें।'
      };
    }

    // Soft "slow down gently" guidance for humans chanting unusually fast (>2.5 beads/sec)
    // Note: The bead IS accepted, not blocked! Only soft guidance is shown.
    if (mean < 380) {
      return {
        accepted: true,
        status: 'pure',
        notice: isEn
          ? 'Chanting fast. Slow down gently for deeper devotional concentration.'
          : 'वेग तीव्र है। एकाग्रता एवं सात्विक शान्ति हेतु गति मन्द करें।'
      };
    }
  }

  return { accepted: true, status: 'pure', notice: null };
}
