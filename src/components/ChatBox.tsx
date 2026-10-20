/**
 * Interactive Assistant Chat component.
 * Executes deterministic number modifications ('reduce budget 20%', 'increase guests to 150')
 * directly via chatIntent engine, and invokes conversational Gemini for advice.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Check, Send, Sparkles, User } from 'lucide-react';
import { ChatMessage, EventPlanInput } from '../types.ts';
import { parseChatIntent } from '../planner/chatIntent.ts';
import { fetchChatResponse } from '../ai/gemini.ts';

interface ChatBoxProps {
  currentPlan: EventPlanInput;
  onApplyPlanUpdate: (updatedPlan: EventPlanInput) => void;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ currentPlan, onApplyPlanUpdate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Hello! I'm your Celebration Assistant. You can ask me creative questions (e.g. signature cocktails or seating etiquette) or give direct adjustment commands like "reduce budget 15%", "set guests to 120", or "switch to outdoor venue" and I will instantly recalculate your master plan!`,
      timestamp: Date.now(),
      source: 'rule-engine',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isProcessing) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);

    try {
      // Step 1: Check deterministic intent parser first
      const intentResult = parseChatIntent(trimmed, currentPlan);

      if (intentResult.matched) {
        // Intent matched: apply deterministic mutations directly to the plan
        let updatedPlan: EventPlanInput = { ...currentPlan };

        if (intentResult.newBudget !== undefined) {
          updatedPlan.budget = intentResult.newBudget;
        }
        if (intentResult.newGuestCount !== undefined) {
          updatedPlan.guestCount = intentResult.newGuestCount;
        }
        if (intentResult.newVenueType !== undefined) {
          updatedPlan.venueType = intentResult.newVenueType;
        }
        if (intentResult.addedPriority !== undefined) {
          if (!updatedPlan.priorities.includes(intentResult.addedPriority)) {
            updatedPlan.priorities = [...updatedPlan.priorities, intentResult.addedPriority];
          }
        }

        onApplyPlanUpdate(updatedPlan);

        const replyMessage: ChatMessage = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: `${intentResult.summary} Your budget split, timeline milestones, and vendor checklists have been automatically updated!`,
          timestamp: Date.now(),
          appliedIntent: intentResult.type,
          source: 'rule-engine',
        };

        setMessages((prev) => [...prev, replyMessage]);
      } else {
        // Step 2: Query contextual assistant for creative ideas or planning advice
        const response = await fetchChatResponse(trimmed, currentPlan);

        const replyMessage: ChatMessage = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: response.text,
          timestamp: Date.now(),
          source: response.source,
        };

        setMessages((prev) => [...prev, replyMessage]);
      }
    } catch {
      const errorMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: 'I encountered an issue processing that query. Please try rephrasing or using one of the quick suggestions below.',
        timestamp: Date.now(),
        source: 'fallback',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const quickPrompts = [
    '✂️ Cut budget 15%',
    '👥 Increase guests to 150',
    '🏡 Switch to home venue',
    '📸 Prioritize photography',
    '🍷 Suggest signature cocktail ideas',
  ];

  return (
    <section className="card chat-card" aria-labelledby="chat-heading">
      <div className="card-header">
        <div>
          <h2 id="chat-heading" className="card-title">
            Planning Assistant & Smart Adjuster
          </h2>
          <p className="card-subtitle">
            Chat to ask questions or give commands like &quot;cut budget 20%&quot; to adapt your plan dynamically.
          </p>
        </div>
      </div>

      {/* Message history */}
      <div
        className="chat-history"
        role="log"
        aria-live="polite"
        aria-label="Conversation with event assistant"
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`chat-bubble-row ${isUser ? 'chat-row-user' : 'chat-row-assistant'}`}
            >
              <div className="chat-avatar" aria-hidden="true">
                {isUser ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`chat-bubble ${isUser ? 'bubble-user' : 'bubble-assistant'}`}>
                <div className="chat-bubble-header">
                  <span className="chat-author">{isUser ? 'You' : 'Planner Assistant'}</span>
                  {msg.source && !isUser && (
                    <span className="chat-badge-source">
                      {msg.source === 'rule-engine' ? (
                        <>
                          <Check size={11} aria-hidden="true" />
                          <span>Rule Engine</span>
                        </>
                      ) : msg.source === 'ai' ? (
                        <>
                          <Sparkles size={11} aria-hidden="true" />
                          <span>Gemini AI</span>
                        </>
                      ) : (
                        <span>Offline Guide</span>
                      )}
                    </span>
                  )}
                </div>
                <p className="chat-text">{msg.text}</p>
                {msg.appliedIntent && (
                  <div className="intent-badge">
                    <span>⚡ Model Updated: {msg.appliedIntent.replace(/_/g, ' ')}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isProcessing && (
          <div className="chat-bubble-row chat-row-assistant">
            <div className="chat-avatar" aria-hidden="true">
              <Bot size={16} />
            </div>
            <div className="chat-bubble bubble-assistant">
              <div className="typing-indicator" aria-label="Assistant is thinking">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="quick-prompts-bar" role="group" aria-label="Suggested prompt shortcuts">
        <span className="quick-prompts-label">Quick Prompts:</span>
        <div className="quick-prompts-chips">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="btn btn-sm btn-outline"
              disabled={isProcessing}
              onClick={() => handleSendMessage(prompt.replace(/^[^\w\s]+/, '').trim())}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <form onSubmit={handleFormSubmit} className="chat-input-bar">
        <label htmlFor="chat-user-input" className="sr-only">
          Ask a planning question or adjust your numbers
        </label>
        <input
          id="chat-user-input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder='Ask a question or type "cut budget 20%" / "set guests to 120"...'
          disabled={isProcessing}
          maxLength={400}
          className="form-input chat-input-field"
        />
        <button
          type="submit"
          disabled={isProcessing || !inputText.trim()}
          className="btn btn-primary chat-submit-btn"
          aria-label="Send message to assistant"
        >
          <Send size={16} aria-hidden="true" />
          <span>Send</span>
        </button>
      </form>
    </section>
  );
};
