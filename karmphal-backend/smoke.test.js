const { spawn } = require('child_process');
const assert = require('assert');

let server;

async function runTests() {
  console.log('Starting server for smoke tests...');
  server = spawn('node', ['server.js'], { stdio: 'inherit' });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 2500));

  try {
    // 1. Health Check
    const res = await fetch('http://127.0.0.1:5000/api/health');
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.status, 'ok');
    console.log('✅ Health check passed');

    // 2. Auth Guest Session
    const authRes = await fetch('http://127.0.0.1:5000/api/auth/guest', { method: 'POST' });
    const authData = await authRes.json();
    assert.strictEqual(authRes.status, 200);
    assert.ok(authData.token, 'Expected token from guest auth');
    const token = authData.token;
    console.log('✅ Guest auth session created with token');

    // 3. User Profile Fetch with Auth
    const profileRes = await fetch('http://127.0.0.1:5000/api/user/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const profileData = await profileRes.json();
    assert.strictEqual(profileRes.status, 200);
    assert.ok(profileData.id);
    console.log('✅ User profile fetch passed with auth token');

    // 4. AI Endpoint without Auth -> Must fail with 401
    const unauthAiRes = await fetch('http://127.0.0.1:5000/api/ai/acharya', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userMessage: 'नमस्ते' })
    });
    assert.strictEqual(unauthAiRes.status, 401, 'Expected 401 for unauthenticated AI request');
    console.log('✅ AI endpoint correctly requires authentication (401 check passed)');

    // 5. AI Endpoint with Auth -> End-to-End Chatbot Test
    console.log('Testing Acharya chat end-to-end through backend with Gemini...');
    const aiRes = await fetch('http://127.0.0.1:5000/api/ai/acharya', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userMessage: 'कर्म का सिद्धान्त क्या है? संक्षेप में बताएं।',
        conversationHistory: []
      })
    });
    const aiData = await aiRes.json();
    assert.strictEqual(aiRes.status, 200, `Expected 200 OK from AI but got ${aiRes.status}: ${JSON.stringify(aiData)}`);
    assert.ok(aiData.text && aiData.text.length > 10, 'Expected valid textual response from Acharya');
    console.log('✅ Acharya chat end-to-end passed! Response preview:', aiData.text.slice(0, 100), '...');

    console.log('\n🎉 ALL BACKEND SMOKE TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Smoke tests failed:', err);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.kill();
    }
  }
}

runTests();
