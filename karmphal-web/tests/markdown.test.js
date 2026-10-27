import assert from 'node:assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import AcharyaMarkdown from '../src/components/TheologicalChatbot/AcharyaMarkdown.jsx';

console.log('--- Acharya Markdown Rendering Tests ---');

// Test 1: Hindi script with headings, bold, lists, and quotes
const hindiInput = `### सनातन धर्म विचार

सनातन धर्म में **निष्काम कर्म** ही आत्मशुद्धि का मूल है।

1. **प्रथम**: सत्य का आचरण
2. **द्वितीय**: स्वाध्याय एवं साधना

*महत्वपूर्ण श्लोक:*
> कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।

अधिक जानकारी हेतु [वेबसाइट](https://example.com) देखें।`;

const hindiHtml = renderToString(React.createElement(AcharyaMarkdown, { content: hindiInput }));

assert.ok(!hindiHtml.includes('###'), 'Literal ### must NOT remain in rendered HTML');
assert.ok(!hindiHtml.includes('**'), 'Literal ** must NOT remain in rendered HTML');
assert.ok(hindiHtml.includes('<h3'), 'H3 element must be generated');
assert.ok(hindiHtml.includes('सनातन धर्म विचार'), 'Heading text must be preserved');
assert.ok(hindiHtml.includes('<strong'), 'Strong element must be generated');
assert.ok(hindiHtml.includes('निष्काम कर्म'), 'Bold text must be inside strong tag');
assert.ok(hindiHtml.includes('<ol') && hindiHtml.includes('<li'), 'Ordered list and list items must be generated');
assert.ok(hindiHtml.includes('<blockquote'), 'Blockquote must be generated');
assert.ok(hindiHtml.includes('rel="noopener noreferrer"'), 'Links must contain safe rel="noopener noreferrer"');
assert.ok(hindiHtml.includes('target="_blank"'), 'Links must open in target="_blank"');
console.log('✅ Hindi Markdown (headings, bold, lists, quotes, safe links) correctly rendered');

// Test 2: English script with headings, bullets, and bold
const englishInput = `### Theological Core

The law of **Karma** is immutable and eternal.

- **Dharma**: Righteous duty
- **Satya**: Ultimate truth
`;

const englishHtml = renderToString(React.createElement(AcharyaMarkdown, { content: englishInput }));

assert.ok(!englishHtml.includes('###'), 'Literal ### must NOT remain in English output');
assert.ok(!englishHtml.includes('**'), 'Literal ** must NOT remain in English output');
assert.ok(englishHtml.includes('<h3'), 'H3 element must be generated for English');
assert.ok(englishHtml.includes('<strong') && englishHtml.includes('Karma'), 'Bold Karma must be rendered in strong tag');
assert.ok(englishHtml.includes('<ul') && englishHtml.includes('<li'), 'Unordered list must be rendered for English');
console.log('✅ English Markdown (headings, bold, bullet points) correctly rendered');

// Test 3: Raw HTML sanitization (rehype-sanitize test)
const maliciousInput = `**सुरक्षित सन्देश** <script>alert("hacked")</script> <img src=x onerror="alert(1)">`;
const sanitizedHtml = renderToString(React.createElement(AcharyaMarkdown, { content: maliciousInput }));

assert.ok(!sanitizedHtml.includes('<script>'), 'Raw <script> tags must be sanitized');
assert.ok(!sanitizedHtml.includes('onerror='), 'Malicious event handlers must be stripped');
assert.ok(sanitizedHtml.includes('<strong') && sanitizedHtml.includes('सुरक्षित सन्देश'), 'Safe bold content preserved');
console.log('✅ HTML Sanitization (rehype-sanitize) strictly verified');

console.log('🎉 ALL ACHARYA MARKDOWN TESTS PASSED SUCCESSFULLY!');
