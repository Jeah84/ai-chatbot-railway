'use client';

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid'; // fixed: was "v4: uuidv4" (syntax error)

export default function ChatPage() {
  const [conversationId, setConversationId] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize conversation on mount
  useEffect(() => {
    const initChat = async () => {
      const id = sessionId || uuidv4();
      setSessionId(id);

      try {
        const res = await fetch('/api/chat/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: id }),
        });
        const data = await res.json();
        setConversationId(data.conversationId);

        // Load history
        const historyRes = await fetch(`/api/chat/history/${data.conversationId}`);
        const history = await historyRes.json();
        setMessages(history);
      } catch (error) {
        console.error('Init error:', error);
      }
    };

    if (!conversationId) initChat();
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !conversationId || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    setIsStreaming(true);

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: userMessage,
          sessionId,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let addedMessage = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              assistantMessage += parsed.content;

              if (!addedMessage) {
                setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
                addedMessage = true;
              }

              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: assistantMessage,
                };
                return updated;
              });
            } catch (e) {
              // Skip parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Send error:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Customer Support Chat</h1>
        <p className="mt-1 text-sm text-gray-600">
          Ask about products, orders, or shipping
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h2 className="mb-2 text-xl font-semibold text-gray-900">👋 Welcome!</h2>
              <p className="text-gray-600">How can we help you today?</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs rounded-lg px-4 py-3 ${
                msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="mb-4 flex justify-start">
            <div className="rounded-lg bg-gray-200 px-4 py-3">
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-gray-600 animate-bounce"></div>
                <div className="h-2 w-2 rounded-full bg-gray-600 animate-bounce delay-100"></div>
                <div className="h-2 w-2 rounded-full bg-gray-600 animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            disabled={loading}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
