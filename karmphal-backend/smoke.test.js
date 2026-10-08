const { spawn } = require('child_process');
const assert = require('assert');

let server;

async function runTests() {
  console.log('Starting server for smoke tests...');
  server = spawn('node', ['server.js'], { stdio: 'inherit' });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    const res = await fetch('http://127.0.0.1:5000/api/health');
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.status, 'ok');
    console.log('✅ Health check passed');

    const profileRes = await fetch('http://127.0.0.1:5000/api/user/profile');
    const profileData = await profileRes.json();
    assert.strictEqual(profileRes.status, 200);
    assert.ok(profileData.id);
    console.log('✅ User profile fetch passed');
    
    console.log('All smoke tests passed!');
  } catch (err) {
    console.error('Smoke tests failed:', err);
    process.exitCode = 1;
  } finally {
    server.kill();
  }
}

runTests();
