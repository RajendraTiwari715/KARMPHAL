import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../src/components/ErrorBoundary';
import { languageService } from '../src/services/languageService';

function FaultyChild({ shouldThrow }) {
  if (shouldThrow) {
    throw new Error('सिम्युलेटेड साधना त्रुटि (Simulated Section Crash)');
  }
  return <div data-testid="peaceful-child">साधना अविरल चल रही है।</div>;
}

describe('ErrorBoundary Section Isolation & Resilient Fallback Tests', () => {
  beforeEach(() => {
    languageService.setLang('hi');
    vi.restoreAllMocks();
    // Silence React's internal console.error output during intentional error boundary tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children normally when no error occurs', () => {
    render(
      <ErrorBoundary section="guru">
        <FaultyChild shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('peaceful-child')).toBeTruthy();
    expect(screen.getByText('साधना अविरल चल रही है।')).toBeTruthy();
  });

  it('catches runtime exception in child component and renders spiritual Hindi fallback card', () => {
    const mockGoHome = vi.fn();

    render(
      <ErrorBoundary section="sadhana" onGoHome={mockGoHome}>
        <FaultyChild shouldThrow={true} />
      </ErrorBoundary>
    );

    // Fallback card header
    expect(screen.getByText(/ॐ शान्ति - कुछ त्रुटि हुई/i)).toBeTruthy();

    // Section label
    expect(screen.getByText(/SADHANA/i)).toBeTruthy();

    // Error description
    expect(screen.getByText(/सिम्युलेटेड साधना त्रुटि/i)).toBeTruthy();

    // Retry and Go Home buttons
    const retryBtn = screen.getByRole('button', { name: /पुनः प्रयास करें/i });
    const goHomeBtn = screen.getByRole('button', { name: /मुख्य पृष्ठ/i });
    expect(retryBtn).toBeTruthy();
    expect(goHomeBtn).toBeTruthy();

    // Clicking Go Home invokes onGoHome callback
    fireEvent.click(goHomeBtn);
    expect(mockGoHome).toHaveBeenCalledTimes(1);
  });

  it('renders English fallback messages when language is set to English', () => {
    languageService.setLang('en');

    render(
      <ErrorBoundary section="jyotish">
        <FaultyChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Om Shanti - An Unexpected Issue Occurred/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Retry \/ Refresh/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Go Home/i })).toBeTruthy();
  });

  it('renders Sanskrit fallback messages when language is set to Sanskrit', () => {
    languageService.setLang('sa');

    render(
      <ErrorBoundary section="gyan">
        <FaultyChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/ॐ शान्तिः - काचित् त्रुटिः सञ्जाता/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /पुनः प्रयतताम्/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /मुख्य-पृष्ठम्/i })).toBeTruthy();
  });

  it('renders full-screen global fallback card when isGlobal is true', () => {
    render(
      <ErrorBoundary isGlobal>
        <FaultyChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/ॐ शान्ति - कुछ त्रुटि हुई/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /पुनः प्रयास करें/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /मुख्य पृष्ठ/i })).toBeTruthy();
  });
});
