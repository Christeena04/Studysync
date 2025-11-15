import React, { useEffect, useState, useRef } from 'react';
import { db } from '../firebaseConfig';
import { ref, onValue, push, set, remove } from 'firebase/database';
import { MessageSquare, Send } from 'lucide-react';

export default function DiscussionBoard({ roomId, user }) {
  const [messages, setMessages] = useState({});
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // 🧠 Listen for new messages in real time
  useEffect(() => {
    const msgRef = ref(db, `rooms/${roomId}/discussions`);
    const unsubscribe = onValue(msgRef, (snap) => {
      setMessages(snap.val() || {});
    });
    return () => unsubscribe();
  }, [roomId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 📩 Send message
  const send = async () => {
    if (!text.trim()) return;
    const msgRef = ref(db, `rooms/${roomId}/discussions`);
    const newRef = push(msgRef);
    await set(newRef, {
      user: user?.displayName || 'Anonymous',
      email: user?.email || null,      // Added email for identification
      text: text.trim(),
      ts: Date.now(),
    });
    setText('');
    inputRef.current?.focus();
  };

  // 🗑 Delete message
  const deleteMessage = async (msgId) => {
    const deleteRef = ref(db, `rooms/${roomId}/discussions/${msgId}`);
    await remove(deleteRef);
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Get user initials
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get avatar color
  const getAvatarColor = (name) => {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
      'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
      'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      'linear-gradient(135deg, #eab308 0%, #f97316 100%)'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <div style={{ padding: '24px' }}>

      {/* Header */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <MessageSquare size={22} color="white" />
          </div>
          <div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0
            }}>
              Discussion Board
            </h3>
            <p style={{
              fontSize: '13px',
              color: '#6b7280',
              margin: 0
            }}>
              {Object.keys(messages).length} message{Object.keys(messages).length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Guidelines */}
        <div style={{
          background: '#fff7ed',
          borderRadius: '8px',
          padding: '16px',
          border: '1px solid #fed7aa'
        }}>
          <h4 style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#9a3412',
            margin: 0
          }}>
            💬 Discussion Guidelines:
          </h4>
          <ul style={{
            fontSize: '13px',
            color: '#c2410c',
            margin: '8px 0 0 0',
            paddingLeft: '20px',
            lineHeight: '1.6'
          }}>
            <li>Be respectful and constructive</li>
            <li>Ask questions and share insights</li>
            <li>Help others understand difficult concepts</li>
          </ul>
        </div>
      </div>

      {/* Messages Container */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        <div style={{
          background: '#f9fafb',
          padding: '12px 20px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <p style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            margin: 0
          }}>
            Live Discussion
          </p>
        </div>

        <div style={{
          height: '500px',
          overflowY: 'auto',
          padding: '20px'
        }}>
          {Object.entries(messages).length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center'
            }}>
              <MessageSquare size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
              <h4 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                No messages yet
              </h4>
              <p style={{
                color: '#6b7280',
                fontSize: '14px'
              }}>
                Start the conversation by sending the first message!
              </p>
            </div>
          ) : (
            <>
              {Object.entries(messages)
                .sort((a, b) => a[1].ts - b[1].ts)
                .map(([id, msg]) => {
                  const isCurrentUser = msg.email && user?.email && msg.email === user.email;

                  return (
                    <div
                      key={id}
                      style={{
                        display: 'flex',
                        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                        marginBottom: '16px'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        maxWidth: '70%',
                        flexDirection: isCurrentUser ? 'row-reverse' : 'row'
                      }}>

                        {/* Avatar */}
                        <div style={{
                          width: '36px',
                          height: '36px',
                          background: getAvatarColor(msg.user),
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '13px',
                          fontWeight: '600',
                          flexShrink: 0
                        }}>
                          {getInitials(msg.user)}
                        </div>

                        {/* Message Content */}
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isCurrentUser ? 'flex-end' : 'flex-start'
                        }}>
                          <div style={{
                            borderRadius: '12px',
                            padding: '12px 16px',
                            background: isCurrentUser ? '#667eea' : '#f3f4f6',
                            color: isCurrentUser ? 'white' : '#1f2937',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                          }}>
                            {!isCurrentUser && (
                              <p style={{
                                fontSize: '12px',
                                fontWeight: '600',
                                margin: '0 0 4px 0',
                                opacity: 0.8
                              }}>
                                {msg.user}
                              </p>
                            )}
                            <p style={{
                              fontSize: '14px',
                              lineHeight: '1.5',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              margin: 0
                            }}>
                              {msg.text}
                            </p>
                          </div>

                          {/* Timestamp */}
                          <span style={{
                            fontSize: '11px',
                            color: '#9ca3af',
                            marginTop: '4px',
                            padding: '0 8px'
                          }}>
                            {formatTime(msg.ts)}
                          </span>

                          {/* Delete Button */}
                          {isCurrentUser && (
                            <button
                              onClick={() => deleteMessage(id)}
                              style={{
                                marginTop: '4px',
                                fontSize: '11px',
                                color: '#ef4444',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              Delete
                            </button>
                          )}

                        </div>

                      </div>
                    </div>
                  );
                })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div style={{
          background: '#f9fafb',
          padding: '16px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '12px'
          }}>
            <div style={{ flex: 1 }}>
              <textarea
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (Press Enter to send)"
                rows={2}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'none',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
            <button
              onClick={send}
              disabled={!text.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '12px 24px',
                background: text.trim() ? '#667eea' : '#e5e7eb',
                color: text.trim() ? 'white' : '#9ca3af',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: text.trim() ? 'pointer' : 'not-allowed',
                height: '56px',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => {
                if (text.trim()) e.currentTarget.style.background = '#5568d3';
              }}
              onMouseOut={(e) => {
                if (text.trim()) e.currentTarget.style.background = '#667eea';
              }}
            >
              <Send size={18} />
              <span>Send</span>
            </button>
          </div>

          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            marginTop: '8px',
            margin: '8px 0 0 0'
          }}>
            Press <kbd style={{
              padding: '2px 6px',
              background: '#e5e7eb',
              borderRadius: '4px',
              fontSize: '11px',
              fontFamily: 'monospace'
            }}>Enter</kbd> to send, <kbd style={{
              padding: '2px 6px',
              background: '#e5e7eb',
              borderRadius: '4px',
              fontSize: '11px',
              fontFamily: 'monospace'
            }}>Shift+Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  );
}
