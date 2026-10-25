import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ErrorBoundary } from '../src/components/ErrorBoundary.jsx';
import { languageService } from '../src/services/languageService.js';

console.log('--- Testing ErrorBoundary Section Isolation and Fallbacks ---');

const sections = ['guru', 'gyan', 'sadhana', 'jyotish', 'karma'];
const testError = new Error('Intentional crash in section for resilience verification');

// 1. Verify getDerivedStateFromError
const derivedState = ErrorBoundary.getDerivedStateFromError(testError);
assert.equal(derivedState.hasError, true, 'getDerivedStateFromError must set hasError to true');
assert.equal(derivedState.error, testError, 'getDerivedStateFromError must retain the error object');
console.log('✓ ErrorBoundary.getDerivedStateFromError verified');

// 2. Test fallback rendering for each section in Hindi
languageService.setLang('hi');
for (const section of sections) {
  // Create an ErrorBoundary pre-configured in error state
  const boundaryInstance = new ErrorBoundary({ section, onGoHome: () => {} });
  boundaryInstance.state = {
    hasError: true,
    error: new Error(`Simulated crash in ${section}`),
    lang: 'hi'
  };

  const html = renderToStaticMarkup(boundaryInstance.render());

  assert.ok(html.includes('ॐ शान्ति - कुछ त्रुटि हुई'), `Section '${section}' fallback must include Hindi Om Shanti header`);
  assert.ok(html.includes('पुनः प्रयास करें'), `Section '${section}' fallback must include 'पुनः प्रयास करें' (Retry)`);
  assert.ok(html.includes('मुख्य पृष्ठ'), `Section '${section}' fallback must include 'मुख्य पृष्ठ' (Go Home)`);
  assert.ok(html.includes(section.toUpperCase()), `Section '${section}' fallback must display section isolation label`);
  assert.ok(html.includes(`Simulated crash in ${section}`), `Section '${section}' fallback must display error description`);
  console.log(`✓ Section '${section}' renders resilient isolated fallback card in Hindi`);
}

// 3. Test language switching in ErrorBoundary (English & Sanskrit)
languageService.setLang('en');
const enBoundary = new ErrorBoundary({ section: 'guru', onGoHome: () => {} });
enBoundary.state = {
  hasError: true,
  error: new Error('Network timeout'),
  lang: 'en'
};
const enHtml = renderToStaticMarkup(enBoundary.render());
assert.ok(enHtml.includes('Om Shanti - An Unexpected Issue Occurred'), 'English fallback header rendered');
assert.ok(enHtml.includes('Retry / Refresh'), 'English retry button rendered');
assert.ok(enHtml.includes('Go Home'), 'English go home button rendered');
console.log('✓ ErrorBoundary English localization verified');

languageService.setLang('sa');
const saBoundary = new ErrorBoundary({ section: 'sadhana', onGoHome: () => {} });
saBoundary.state = {
  hasError: true,
  error: new Error('Mala buffer error'),
  lang: 'sa'
};
const saHtml = renderToStaticMarkup(saBoundary.render());
assert.ok(saHtml.includes('ॐ शान्तिः - काचित् त्रुटिः सञ्जाता'), 'Sanskrit fallback header rendered');
assert.ok(saHtml.includes('पुनः प्रयतताम्'), 'Sanskrit retry button rendered');
assert.ok(saHtml.includes('मुख्य-पृष्ठम्'), 'Sanskrit go home button rendered');
console.log('✓ ErrorBoundary Sanskrit localization verified');

// 4. Test Global App-level Fallback
const globalBoundary = new ErrorBoundary({ isGlobal: true });
globalBoundary.state = {
  hasError: true,
  error: new Error('Critical root crash'),
  lang: 'hi'
};
const globalHtml = renderToStaticMarkup(globalBoundary.render());
assert.ok(globalHtml.includes('min-h-screen'), 'Global fallback must be full-screen styled');
assert.ok(globalHtml.includes('ॐ शान्ति - कुछ त्रुटि हुई'), 'Global fallback must have spiritual header');
assert.ok(globalHtml.includes('पुनः प्रयास करें'), 'Global fallback must include retry button');
assert.ok(globalHtml.includes('मुख्य पृष्ठ'), 'Global fallback must include go home button');
console.log('✓ Global App-level fallback verified');

// Reset language back to Hindi default
languageService.setLang('hi');

console.log('🎉 All ErrorBoundary section and global tests passed successfully!');
