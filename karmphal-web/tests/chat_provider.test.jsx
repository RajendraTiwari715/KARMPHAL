import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { ChatProvider } from '../src/context/ChatProvider';
import { useChat } from '../src/context/useChat';
import { apiClient } from '../src/services/apiClient';
import { geminiService } from '../src/services/geminiService';

function TestConsumer({ onState }) {
  const chat = useChat();
  React.useEffect(() => {
    if (onState) onState(chat);
  }, [chat, onState]);

  return (
    <div>
      <div data-testid="msg-count">{chat.messages.length}</div>
      <div data-testid="loading-state">{chat.isLoading ? 'loading' : 'idle'}</div>
      <div data-testid="sending-state">{chat.isSending ? 'sending' : 'idle'}</div>
      <button onClick={() => chat.sendMessage('धर्म क्या है?')}>Send</button>
      <button onClick={() => chat.loadOlderMessages()}>Older</button>
      <button onClick={() => chat.clearConversation()}>Clear</button>
    </div>
  );
}

describe('ChatProvider State Machine & Integration Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with default greeting when backend history is empty', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue([]);

    let chatState = null;
    render(
      <ChatProvider>
        <TestConsumer onState={(s) => { chatState = s; }} />
      </ChatProvider>
    );

    await waitFor(() => {
      expect(chatState.isLoading).toBe(false);
    });

    expect(chatState.messages.length).toBe(1);
    expect(chatState.messages[0].sender).toBe('model');
    expect(chatState.messages[0].text).toContain('ॐ नमो नारायणाय');
  });

  it('loads existing chat history from backend on mount', async () => {
    const mockHistory = [
      { id: 1, sender: 'user', text: 'प्रणाम', timestamp: '2026-10-26T10:00:00Z' },
      { id: 2, sender: 'model', text: 'कल्याणमस्तु', timestamp: '2026-10-26T10:01:00Z' }
    ];

    vi.spyOn(apiClient, 'get').mockResolvedValue(mockHistory);

    let chatState = null;
    render(
      <ChatProvider>
        <TestConsumer onState={(s) => { chatState = s; }} />
      </ChatProvider>
    );

    await waitFor(() => {
      expect(chatState.isLoading).toBe(false);
    });

    expect(chatState.messages.length).toBe(2);
    expect(chatState.messages[0].text).toBe('प्रणाम');
    expect(chatState.messages[1].text).toBe('कल्याणमस्तु');
  });

  it('sends message, updates state, and persists to backend', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue([]);
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({ success: true, id: 99 });
    vi.spyOn(geminiService, 'generateResponse').mockResolvedValue({
      text: 'श्रीमद्भगवद्गीता के अनुसार निष्काम कर्म ही धर्म है।'
    });

    let chatState = null;
    render(
      <ChatProvider>
        <TestConsumer onState={(s) => { chatState = s; }} />
      </ChatProvider>
    );

    await waitFor(() => {
      expect(chatState.isLoading).toBe(false);
    });

    await act(async () => {
      await chatState.sendMessage('धर्म क्या है?');
    });

    expect(chatState.messages.length).toBe(3); // default greeting + user message + acharya reply
    expect(chatState.messages[1].sender).toBe('user');
    expect(chatState.messages[1].text).toBe('धर्म क्या है?');
    expect(chatState.messages[2].sender).toBe('model');
    expect(chatState.messages[2].text).toContain('निष्काम कर्म ही धर्म है');

    // Both user message and model reply persisted
    expect(postSpy).toHaveBeenCalledTimes(2);
  });

  it('gracefully handles gemini service errors with dharmik fallback solace', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue([]);
    vi.spyOn(apiClient, 'post').mockResolvedValue({ success: true });
    vi.spyOn(geminiService, 'generateResponse').mockRejectedValue(new Error('Network offline'));

    let chatState = null;
    render(
      <ChatProvider>
        <TestConsumer onState={(s) => { chatState = s; }} />
      </ChatProvider>
    );

    await waitFor(() => {
      expect(chatState.isLoading).toBe(false);
    });

    await act(async () => {
      await chatState.sendMessage('कष्ट निवारण का उपाय?');
    });

    expect(chatState.messages.length).toBe(3);
    const fallbackMsg = chatState.messages[2];
    expect(fallbackMsg.sender).toBe('model');
    expect(fallbackMsg.text).toContain('कर्म का नियम सनातन और अटल है');
    expect(fallbackMsg.text).toContain('श्रीमद्भगवद्गीता');
  });

  it('clears conversation history and resets to default greeting', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue([
      { id: 1, sender: 'user', text: 'सन्देश १' },
      { id: 2, sender: 'model', text: 'उत्तर १' }
    ]);
    const deleteSpy = vi.spyOn(apiClient, 'delete').mockResolvedValue({ success: true });

    let chatState = null;
    render(
      <ChatProvider>
        <TestConsumer onState={(s) => { chatState = s; }} />
      </ChatProvider>
    );

    await waitFor(() => {
      expect(chatState.messages.length).toBe(2);
    });

    await act(async () => {
      await chatState.clearConversation();
    });

    expect(deleteSpy).toHaveBeenCalledWith('/api/user/chat-history');
    expect(chatState.messages.length).toBe(1);
    expect(chatState.messages[0].id).toBe('default-greeting');
  });
});
