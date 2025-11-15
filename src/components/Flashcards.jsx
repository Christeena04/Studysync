import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { ref, onValue, push, set, remove } from "firebase/database";
import { Brain, Plus, Trash2, RotateCw } from "lucide-react";

export default function Flashcards({ roomId, user }) {
  const [cards, setCards] = useState({});
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [flipped, setFlipped] = useState({});
  const [showForm, setShowForm] = useState(false);

  // 🔄 Load flashcards in real time
  useEffect(() => {
    const cardsRef = ref(db, `rooms/${roomId}/flashcards`);
    const unsubscribe = onValue(cardsRef, (snap) => {
      setCards(snap.val() || {});
    });
    return () => unsubscribe();
  }, [roomId]);

  // ➕ Add a new flashcard
  const addCard = async () => {
    if (!q.trim() || !a.trim()) return;

    const cardsRef = ref(db, `rooms/${roomId}/flashcards`);
    const newRef = push(cardsRef);

    await set(newRef, {
      question: q,
      answer: a,
      createdBy: user?.displayName || "Anonymous",
      createdAt: Date.now()
    });

    setQ("");
    setA("");
    setShowForm(false);
  };

  // ❌ Delete a flashcard
  const delCard = async (id) => {
    if (!window.confirm("Delete this flashcard?")) return;
    await remove(ref(db, `rooms/${roomId}/flashcards/${id}`));
  };

  // 🔄 Toggle flip
  const toggleFlip = (id) => {
    setFlipped({ ...flipped, [id]: !flipped[id] });
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
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: showForm ? '24px' : '0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              background: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Brain size={22} color="white" />
            </div>
            <div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                Flashcards
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: 0
              }}>
                {Object.keys(cards).length} card{Object.keys(cards).length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#5568d3'}
            onMouseOut={(e) => e.currentTarget.style.background = '#667eea'}
          >
            <Plus size={18} />
            <span>Add Card</span>
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <div style={{
            background: '#f9fafb',
            borderRadius: '8px',
            padding: '20px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Question
              </label>
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="e.g., What is the capital of France?"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Answer
              </label>
              <textarea
                value={a}
                onChange={(e) => setA(e.target.value)}
                placeholder="e.g., Paris"
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '15px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={addCard}
                disabled={!q.trim() || !a.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 20px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: q.trim() && a.trim() ? 'pointer' : 'not-allowed',
                  opacity: q.trim() && a.trim() ? 1 : 0.5,
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => {
                  if (q.trim() && a.trim()) e.currentTarget.style.background = '#5568d3';
                }}
                onMouseOut={(e) => e.currentTarget.style.background = '#667eea'}
              >
                <Plus size={16} />
                <span>Add Flashcard</span>
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setQ("");
                  setA("");
                }}
                style={{
                  padding: '10px 20px',
                  background: '#e5e7eb',
                  color: '#4b5563',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#d1d5db'}
                onMouseOut={(e) => e.currentTarget.style.background = '#e5e7eb'}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Flashcards Grid */}
      {Object.entries(cards).length === 0 ? (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '60px 40px',
          textAlign: 'center',
          border: '2px dashed #e5e7eb'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: '#f3f4f6',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Brain size={32} color="#9ca3af" />
          </div>
          <h4 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            No flashcards yet
          </h4>
          <p style={{
            color: '#6b7280',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            Create your first flashcard to start studying!
          </p>
          <button
            onClick={() => setShowForm(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 24px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#5568d3'}
            onMouseOut={(e) => e.currentTarget.style.background = '#667eea'}
          >
            <Plus size={18} />
            <span>Add Flashcard</span>
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {Object.entries(cards)
            .sort((a, b) => (b[1].createdAt || 0) - (a[1].createdAt || 0))
            .map(([id, card]) => (
              <div
                key={id}
                style={{
                  position: 'relative'
                }}
              >
                <div
                  onClick={() => toggleFlip(id)}
                  style={{
                    background: flipped[id] ? 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)' : 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    border: flipped[id] ? 'none' : '1px solid #e5e7eb',
                    cursor: 'pointer',
                    minHeight: '180px',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                  }}
                >
                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      delCard(id);
                    }}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      opacity: 0,
                      transition: 'opacity 0.2s, background 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#fecaca';
                      e.currentTarget.style.opacity = '1';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = '#fee2e2';
                    }}
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* Flip Icon */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    opacity: 0.4
                  }}>
                    <RotateCw size={16} color={flipped[id] ? 'white' : '#9ca3af'} />
                  </div>

                  {/* Card Content */}
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    paddingTop: '12px'
                  }}>
                    {!flipped[id] ? (
                      <>
                        <div style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          color: '#a78bfa',
                          marginBottom: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Question
                        </div>
                        <p style={{
                          fontSize: '16px',
                          fontWeight: '500',
                          color: '#1f2937',
                          lineHeight: '1.5',
                          margin: 0
                        }}>
                          {card.question}
                        </p>
                      </>
                    ) : (
                      <>
                        <div style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          color: 'rgba(255,255,255,0.8)',
                          marginBottom: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Answer
                        </div>
                        <p style={{
                          fontSize: '16px',
                          color: 'white',
                          lineHeight: '1.5',
                          margin: 0
                        }}>
                          {card.answer}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Footer */}
                  <div style={{
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: flipped[id] ? '1px solid rgba(255,255,255,0.2)' : '1px solid #f3f4f6'
                  }}>
                    <p style={{
                      fontSize: '12px',
                      color: flipped[id] ? 'rgba(255,255,255,0.8)' : '#6b7280',
                      margin: 0
                    }}>
                      By <span style={{ fontWeight: '500' }}>{card.createdBy}</span>
                    </p>
                  </div>
                </div>
                
                {/* Hover effect for delete button */}
                <style>
                  {`
                    div:hover button[style*="opacity: 0"] {
                      opacity: 1 !important;
                    }
                  `}
                </style>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}