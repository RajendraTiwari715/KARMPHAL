import React, { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../services/apiClient';
import { geminiService } from '../services/geminiService';
import { ChatContext } from './chatContextDef';

const DEFAULT_MESSAGE = {
  id: 'default-greeting',
  sender: 'model',
  text: 'ॐ नमो नारायणाय । कल्याणमस्तु वत्स। आप धर्म, कर्म, कुण्डली, जीवन के कष्ट अथवा शास्त्र सम्बन्धी कोई भी प्रश्न पूछें, मैं आपको सप्रमाण व सटीक मार्गदर्शन प्रदान करूँगा।'
};

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const isInitialLoadedRef = useRef(false);

  // Initial load of history on mount
  const fetchInitialHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.get('/api/user/chat-history?limit=50');
      if (Array.isArray(data) && data.length > 0) {
        setMessages(
          data.map((m) => ({
            id: m.id || Date.now() + Math.random(),
            sender: m.sender === 'user' ? 'user' : 'model',
            text: m.text,
            timestamp: m.timestamp || m.created_at || new Date().toISOString()
          }))
        );
        setHasMore(data.length >= 50);
      } else {
        setMessages([DEFAULT_MESSAGE]);
        setHasMore(false);
      }
    } catch (err) {
      console.warn('[ChatProvider] Failed to fetch chat history:', err.message);
      setMessages([DEFAULT_MESSAGE]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      isInitialLoadedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!isInitialLoadedRef.current) {
      fetchInitialHistory();
    }
  }, [fetchInitialHistory]);

  // Load older messages on pagination (scroll up)
  const loadOlderMessages = useCallback(async () => {
    if (isLoadingOlder || !hasMore || messages.length === 0) return;

    // Find the oldest message with a valid DB ID
    const oldestMsg = messages.find((m) => typeof m.id === 'number');
    if (!oldestMsg) {
      setHasMore(false);
      return;
    }

    setIsLoadingOlder(true);
    try {
      const olderData = await apiClient.get(
        `/api/user/chat-history?limit=30&before=${oldestMsg.id}`
      );
      if (Array.isArray(olderData) && olderData.length > 0) {
        const formatted = olderData.map((m) => ({
          id: m.id,
          sender: m.sender === 'user' ? 'user' : 'model',
          text: m.text,
          timestamp: m.timestamp || m.created_at
        }));
        setMessages((prev) => [...formatted, ...prev]);
        setHasMore(olderData.length >= 30);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.warn('[ChatProvider] Failed to load older messages:', err.message);
    } finally {
      setIsLoadingOlder(false);
    }
  }, [isLoadingOlder, hasMore, messages]);

  // Send message to Acharya and persist to backend
  const sendMessage = useCallback(
    async (query, panchangData) => {
      if (!query?.trim() || isSending) return;

      const userText = query.trim();
      const userMsg = {
        id: Date.now(),
        sender: 'user',
        text: userText,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsSending(true);

      // Save user message to backend
      apiClient
        .post('/api/user/chat-history', { sender: 'user', text: userText })
        .catch((err) =>
          console.warn('[ChatProvider] Failed to persist user message:', err.message)
        );

      try {
        const result = await geminiService.generateResponse(
          userText,
          messages,
          panchangData
        );

        const acharyaMsg = {
          id: Date.now() + 1,
          sender: 'model',
          text: result.text,
          timestamp: new Date().toISOString()
        };

        setMessages((prev) => [...prev, acharyaMsg]);
        apiClient
          .post('/api/user/chat-history', { sender: 'model', text: result.text })
          .catch((err) =>
            console.warn('[ChatProvider] Failed to persist acharya message:', err.message)
          );
      } catch (error) {
        console.error('[ChatProvider] Acharya generation error:', error);
        
        let errorText;
        if (error?.status === 429 || error?.code === 'RATE_LIMIT' || error?.code === 'DAILY_QUOTA_EXCEEDED') {
          errorText = error.message || 'AI चैट अनुरोध सीमा पूर्ण हो चुकी है। कृपया कुछ समय बाद पुनः प्रयास करें।';
        } else if (error?.status === 503 || error?.code === 'GLOBAL_DAILY_LIMIT_REACHED') {
          errorText = error.message || 'सर्वर पर दैनिक AI सीमा पूर्ण हो चुकी है। कृपया कल पुनः प्रयास करें।';
        } else {
          errorText = 'कर्म का नियम सनातन और अटल है। श्रीमद्भगवद्गीता (२.४७) के अनुसार निष्काम कर्म और सात्विक पुरुषार्थ से चित्त की शुद्धि होती है। कृपया नेटवर्क की जाँच कर पुनः प्रयास करें।';
        }

        const fallbackMsg = {
          id: Date.now() + 1,
          sender: 'model',
          text: errorText,
          timestamp: new Date().toISOString()
        };
        setMessages((prev) => [...prev, fallbackMsg]);
        // Note: Do NOT persist transient errors to DB chat history
      } finally {
        setIsSending(false);
      }
    },
    [isSending, messages]
  );

  // Clear entire conversation history
  const clearConversation = useCallback(async () => {
    try {
      await apiClient.delete('/api/user/chat-history');
      setMessages([DEFAULT_MESSAGE]);
      setHasMore(false);
    } catch (err) {
      console.error('[ChatProvider] Failed to clear conversation:', err);
      throw err;
    }
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoading,
        isLoadingOlder,
        hasMore,
        isSending,
        sendMessage,
        loadOlderMessages,
        clearConversation
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
