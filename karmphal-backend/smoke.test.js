const { spawn } = require('child_process');
const assert = require('assert');
const jwt = require('jsonwebtoken');

let server;
const TEST_PORT = process.env.TEST_PORT || '5055';
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;
const JWT_SECRET = process.env.JWT_SECRET || 'test-mock-jwt-secret-min-32-chars-long-for-smoke-tests';

async function runTests() {
  console.log(`🚀 Starting backend server on port ${TEST_PORT} for security & test suite...`);
  server = spawn('node', ['server.js'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: TEST_PORT, JWT_SECRET, NODE_ENV: 'test', CHAT_RETENTION_LIMIT: '15' }
  });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 4000));

  try {
    // ----------------------------------------------------
    // TEST 1: Health Check
    // ----------------------------------------------------
    console.log('\n[1/8] Testing /api/health...');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    assert.strictEqual(healthRes.status, 200);
    assert.strictEqual(healthData.status, 'ok');
    console.log('✅ Health check passed (200 OK)');

    // ----------------------------------------------------
    // TEST 2: Missing Token -> Must return 401
    // ----------------------------------------------------
    console.log('\n[2/8] Testing Missing Token protection...');
    const noTokenProfileRes = await fetch(`${BASE_URL}/api/user/profile`);
    assert.strictEqual(noTokenProfileRes.status, 401, 'Expected 401 on missing token');
    const noTokenProfileData = await noTokenProfileRes.json();
    assert.strictEqual(noTokenProfileData.error, 'UNAUTHORIZED');

    const noTokenAiRes = await fetch(`${BASE_URL}/api/ai/acharya`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userMessage: 'नमस्ते' })
    });
    assert.strictEqual(noTokenAiRes.status, 401, 'Expected 401 on AI endpoint without token');
    console.log('✅ Missing token correctly rejected with 401 UNAUTHORIZED');

    // ----------------------------------------------------
    // TEST 3: Forged / Fake UUID Bearer Token -> Must return 401
    // ----------------------------------------------------
    console.log('\n[3/8] Testing Fake UUID Bearer Token rejection (the old bug)...');
    const fakeUuid = '30a8855f-1702-49d8-af0e-2a5d1d5b30a8';
    const fakeUuidRes = await fetch(`${BASE_URL}/api/user/profile`, {
      headers: { 'Authorization': `Bearer ${fakeUuid}` }
    });
    assert.strictEqual(fakeUuidRes.status, 401, 'Expected 401 on fake UUID token');
    const fakeUuidData = await fakeUuidRes.json();
    assert.strictEqual(fakeUuidData.error, 'INVALID_TOKEN');

    const fakeUuidAiRes = await fetch(`${BASE_URL}/api/ai/acharya`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${fakeUuid}`
      },
      body: JSON.stringify({ userMessage: 'test' })
    });
    assert.strictEqual(fakeUuidAiRes.status, 401, 'Expected 401 on AI with fake UUID');
    console.log('✅ Fake UUID bearer tokens strictly rejected with 401 INVALID_TOKEN');

    // ----------------------------------------------------
    // TEST 4: Forged JWT with Wrong Signature -> Must return 401
    // ----------------------------------------------------
    console.log('\n[4/8] Testing Forged JWT (wrong secret)...');
    const forgedToken = jwt.sign({ sub: 'attacker-id', role: 'admin' }, 'malicious_wrong_secret', { algorithm: 'HS256' });
    const forgedRes = await fetch(`${BASE_URL}/api/user/profile`, {
      headers: { 'Authorization': `Bearer ${forgedToken}` }
    });
    assert.strictEqual(forgedRes.status, 401, 'Expected 401 on forged JWT');
    const forgedData = await forgedRes.json();
    assert.strictEqual(forgedData.error, 'INVALID_TOKEN');
    console.log('✅ Forged JWT signature strictly rejected with 401 INVALID_TOKEN');

    // ----------------------------------------------------
    // TEST 5: Expired JWT -> Must return 401 TOKEN_EXPIRED
    // ----------------------------------------------------
    console.log('\n[5/8] Testing Expired JWT...');
    const expiredToken = jwt.sign({ sub: 'user-expired' }, JWT_SECRET, { algorithm: 'HS256', expiresIn: '-10s' });
    const expiredRes = await fetch(`${BASE_URL}/api/user/profile`, {
      headers: { 'Authorization': `Bearer ${expiredToken}` }
    });
    assert.strictEqual(expiredRes.status, 401, 'Expected 401 on expired JWT');
    const expiredData = await expiredRes.json();
    assert.strictEqual(expiredData.error, 'TOKEN_EXPIRED');
    console.log('✅ Expired JWT strictly rejected with 401 TOKEN_EXPIRED');

    // ----------------------------------------------------
    // TEST 6: Legitimate Guest Token Creation (JWT HS256, 30d)
    // ----------------------------------------------------
    console.log('\n[6/8] Creating legitimate Guest sessions for User A and User B...');
    const guestResA = await fetch(`${BASE_URL}/api/auth/guest`, { method: 'POST' });
    assert.strictEqual(guestResA.status, 201);
    const guestDataA = await guestResA.json();
    assert.ok(guestDataA.token, 'Expected JWT token for User A');
    assert.ok(guestDataA.refreshToken, 'Expected refresh token for User A');
    const tokenA = guestDataA.token;
    const userIdA = guestDataA.user.id;

    // Verify token payload structure
    const decodedA = jwt.verify(tokenA, JWT_SECRET);
    assert.strictEqual(decodedA.sub, userIdA);
    assert.strictEqual(decodedA.role, 'guest');

    // Create User B
    const guestResB = await fetch(`${BASE_URL}/api/auth/guest`, { method: 'POST' });
    const guestDataB = await guestResB.json();
    const tokenB = guestDataB.token;
    const userIdB = guestDataB.user.id;
    assert.notStrictEqual(userIdA, userIdB, 'User A and User B must have distinct IDs');
    console.log('✅ Legitimate JWT tokens generated for User A and User B');

    // ----------------------------------------------------
    // TEST 7: Enforce Ownership Isolation (User A vs User B)
    // ----------------------------------------------------
    console.log('\n[7/8] Testing Ownership Isolation: User A cannot read, modify, or delete User B...');
    // User A sets profile
    await fetch(`${BASE_URL}/api/user/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({ name: 'साधक अर्जुन', city: 'इन्द्रप्रस्थ' })
    });

    // User B sets profile
    await fetch(`${BASE_URL}/api/user/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenB}`
      },
      body: JSON.stringify({ name: 'साधक युधिष्ठिर', city: 'हस्तिनापुर' })
    });

    // User A reads profile -> Gets Arjun, NOT Yudhishthir
    const profileA = await (await fetch(`${BASE_URL}/api/user/profile`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    })).json();
    assert.strictEqual(profileA.name, 'साधक अर्जुन');
    assert.strictEqual(profileA.city, 'इन्द्रप्रस्थ');

    // User B reads profile -> Gets Yudhishthir, NOT Arjun
    const profileB = await (await fetch(`${BASE_URL}/api/user/profile`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    })).json();
    assert.strictEqual(profileB.name, 'साधक युधिष्ठिर');
    assert.strictEqual(profileB.city, 'हस्तिनापुर');

    // User A attempts to modify User B by injecting User B's ID in body
    await fetch(`${BASE_URL}/api/user/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({ id: userIdB, name: 'HACKED BY A' })
    });

    // Verify User B was NOT touched!
    const checkB = await (await fetch(`${BASE_URL}/api/user/profile`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    })).json();
    assert.strictEqual(checkB.name, 'साधक युधिष्ठिर', 'User B profile must NOT be modified by User A');

    // User A writes a chat message
    await fetch(`${BASE_URL}/api/user/chat-history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({ sender: 'user', text: 'अर्जुन का गोपनीय प्रश्न' })
    });

    // User B reads chat history -> MUST NOT see Arjun's message!
    const chatB = await (await fetch(`${BASE_URL}/api/user/chat-history`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    })).json();
    assert.strictEqual(chatB.length, 0, 'User B must have empty chat history, no leakage from User A');

    // User A deletes account
    const deleteA = await (await fetch(`${BASE_URL}/api/user/delete`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    })).json();
    assert.strictEqual(deleteA.success, true);

    // Subsequent access by User A returns 404 (user gone)
    const afterDeleteA = await fetch(`${BASE_URL}/api/user/profile`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert.strictEqual(afterDeleteA.status, 404, 'User A profile must return 404 after deletion');

    // User B remains intact!
    const afterDeleteB = await fetch(`${BASE_URL}/api/user/profile`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert.strictEqual(afterDeleteB.status, 200, 'User B must remain unaffected by User A deletion');
    console.log('✅ Ownership isolation verified: User A and B are completely isolated');

    // ----------------------------------------------------
    // TEST 8: Chat History Sender Vocabulary & Normalization
    // ----------------------------------------------------
    console.log('\n[8/9] Testing Chat History Sender Validation & Normalization...');
    
    // 1. Valid 'user' message
    const resUser = await fetch(`${BASE_URL}/api/user/chat-history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenB}` },
      body: JSON.stringify({ sender: 'user', text: 'शिष्य का प्रश्न' })
    });
    assert.strictEqual(resUser.status, 200, 'Expected 200 for sender: user');

    // 2. Valid 'model' message (canonical Acharya response)
    const resModel = await fetch(`${BASE_URL}/api/user/chat-history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenB}` },
      body: JSON.stringify({ sender: 'model', text: 'आचार्य का सप्रमाण उत्तर' })
    });
    assert.strictEqual(resModel.status, 200, 'Expected 200 for sender: model');

    // 3. Backward-compatible 'acharya' message -> must return 200 and be normalized to 'model'
    const resAcharya = await fetch(`${BASE_URL}/api/user/chat-history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenB}` },
      body: JSON.stringify({ sender: 'acharya', text: 'आचार्य का आशीर्वाद' })
    });
    assert.strictEqual(resAcharya.status, 200, 'Expected 200 for sender: acharya (deprecated alias)');

    // 4. Invalid sender -> must return 400 Bad Request
    const resInvalid = await fetch(`${BASE_URL}/api/user/chat-history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenB}` },
      body: JSON.stringify({ sender: 'hacker_bot', text: 'अमान्य प्रेषक' })
    });
    assert.strictEqual(resInvalid.status, 400, 'Expected 400 for invalid sender');
    const invalidData = await resInvalid.json();
    assert.strictEqual(invalidData.error, 'VALIDATION_ERROR');

    // 5. Verify saved rows in DB via GET /api/user/chat-history
    const historyRes = await fetch(`${BASE_URL}/api/user/chat-history`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert.strictEqual(historyRes.status, 200);
    const historyData = await historyRes.json();
    assert.strictEqual(historyData.length, 3, 'Expected 3 saved messages in DB');
    assert.strictEqual(historyData[0].sender, 'user');
    assert.strictEqual(historyData[1].sender, 'model');
    assert.strictEqual(historyData[2].sender, 'model', 'acharya must be saved as normalized model in DB');
    assert.ok(historyData[0].created_at, 'Row must include created_at timestamp');
    console.log('✅ Chat history sender validation, alias normalization (acharya -> model), and 400 error verified');

    // ----------------------------------------------------
    // TEST 9: Chat History Pagination & Cursor Verification
    // ----------------------------------------------------
    console.log('\n[9/11] Testing Chat History Pagination & Cursor...');
    // User B currently has 3 messages (IDs e.g. 2, 3, 4).
    // Test limit=2
    const paginatedRes = await fetch(`${BASE_URL}/api/user/chat-history?limit=2`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert.strictEqual(paginatedRes.status, 200);
    const paginatedData = await paginatedRes.json();
    assert.strictEqual(paginatedData.length, 2, 'Limit 2 should return 2 latest messages');
    // Test before cursor
    const oldestVisibleId = paginatedData[0].id;
    const beforeRes = await fetch(`${BASE_URL}/api/user/chat-history?limit=2&before=${oldestVisibleId}`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert.strictEqual(beforeRes.status, 200);
    const beforeData = await beforeRes.json();
    assert.strictEqual(beforeData.length, 1, 'Before cursor should return remaining older message');
    assert.strictEqual(beforeData[0].text, 'शिष्य का प्रश्न');
    console.log('✅ Chat history pagination and cursor filtering verified');

    // ----------------------------------------------------
    // TEST 10: Retention Policy & Clear Conversation (DELETE)
    // ----------------------------------------------------
    console.log('\n[10/11] Testing Retention Policy and DELETE /api/user/chat-history...');
    // Test Retention: insert 20 messages for User B (retention limit is 15 in test mode)
    for (let i = 0; i < 20; i++) {
      await fetch(`${BASE_URL}/api/user/chat-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenB}` },
        body: JSON.stringify({ sender: 'user', text: `मैसेज ${i}` })
      });
    }
    const retentionRes = await fetch(`${BASE_URL}/api/user/chat-history?limit=50`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    const retentionData = await retentionRes.json();
    assert.strictEqual(retentionData.length, 15, 'Retention policy must truncate to 15 maximum rows in test mode');

    // Test DELETE /api/user/chat-history for User B
    const deleteChatRes = await fetch(`${BASE_URL}/api/user/chat-history`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert.strictEqual(deleteChatRes.status, 200);
    const deleteChatData = await deleteChatRes.json();
    assert.strictEqual(deleteChatData.success, true);
    assert.strictEqual(deleteChatData.deletedCount, 15);

    // Verify User B history is now 0
    const emptyHistoryRes = await fetch(`${BASE_URL}/api/user/chat-history`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    const emptyHistoryData = await emptyHistoryRes.json();
    assert.strictEqual(emptyHistoryData.length, 0, 'User B chat history must be completely empty');

    // Verify User A Isolation (create User C to test cross-user isolation)
    const guestCRes = await fetch(`${BASE_URL}/api/auth/guest`, { method: 'POST' });
    const { token: tokenC } = await guestCRes.json();
    await fetch(`${BASE_URL}/api/user/chat-history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenC}` },
      body: JSON.stringify({ sender: 'user', text: 'गुप्त सन्देश यूजर सी' })
    });
    // User B fetches history: must still be 0, never sees User C
    const userBCheckRes = await fetch(`${BASE_URL}/api/user/chat-history`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    const userBCheckData = await userBCheckRes.json();
    assert.strictEqual(userBCheckData.length, 0, 'User B must NEVER see User C messages');

    // User C fetches history: sees only their 1 message
    const userCCheckRes = await fetch(`${BASE_URL}/api/user/chat-history`, {
      headers: { 'Authorization': `Bearer ${tokenC}` }
    });
    const userCCheckData = await userCCheckRes.json();
    assert.strictEqual(userCCheckData.length, 1);
    assert.strictEqual(userCCheckData[0].text, 'गुप्त सन्देश यूजर सी');
    console.log('✅ Retention policy (100 cap), Clear conversation (DELETE), and cross-user isolation verified');

    // ----------------------------------------------------
    // TEST 11: Acharya AI Chatbot End-to-End with JWT
    // ----------------------------------------------------
    console.log('\n[11/11] Testing Acharya AI chat end-to-end with verified JWT...');
    const aiRes = await fetch(`${BASE_URL}/api/ai/acharya`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenB}`
      },
      body: JSON.stringify({
        userMessage: 'धर्म और कर्म में क्या सम्बन्ध है? संक्षेप में उत्तर दें।',
        conversationHistory: []
      })
    });
    assert.strictEqual(aiRes.status, 200, 'Expected 200 OK from AI chat');
    const aiData = await aiRes.json();
    assert.ok(aiData.text && aiData.text.length > 10, 'Expected valid Acharya answer');
    console.log('✅ Acharya AI response received successfully:', aiData.text.slice(0, 90), '...');

    console.log('\n🎉 ALL 11 BACKEND SECURITY & CHAT TESTS PASSED WITH 100% SUCCESS!');
  } catch (err) {
    console.error('\n❌ Security tests failed:', err);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.kill();
    }
  }
}

runTests();
