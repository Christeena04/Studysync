import React, { useEffect, useState, useRef } from 'react';
import { db } from '../firebaseConfig';
import { ref, onValue, push, set, remove } from 'firebase/database';
import { Play, Clock, Trophy, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';

export default function QuizMode({ roomId, user }) {
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState({});
  const [submissions, setSubmissions] = useState({});
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const timerRef = useRef(null);

  // 🧠 Listen for real-time quiz data
  useEffect(() => {
    const quizRef = ref(db, `rooms/${roomId}/quiz`);
    const qRef = ref(db, `rooms/${roomId}/quizQuestions`);
    const subRef = ref(db, `rooms/${roomId}/quizSubmissions`);

    const unsub1 = onValue(quizRef, (snap) => {
      const data = snap.val();
      setQuiz(data);
      if (data?.timeLeft) {
        setTimeLeft(data.timeLeft);
      }
    });
    const unsub2 = onValue(qRef, (snap) => setQuestions(snap.val() || {}));
    const unsub3 = onValue(subRef, (snap) => setSubmissions(snap.val() || {}));

    return () => {
      unsub1();
      unsub2();
      unsub3();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [roomId]);

  // Timer countdown
  useEffect(() => {
    if (quiz?.currentQuestion && timeLeft > 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quiz?.currentQuestion, timeLeft]);

  // Check if current user has submitted
  useEffect(() => {
    if (quiz?.currentQuestion) {
      const currentSubmissions = submissions[quiz.currentQuestion] || {};
      const userSubmitted = Object.values(currentSubmissions).some(
        sub => sub.user === (user?.displayName || 'Anonymous')
      );
      setHasSubmitted(userSubmitted);
    } else {
      setHasSubmitted(false);
    }
  }, [quiz?.currentQuestion, submissions, user]);

  // ▶️ Host starts a question timer
  const startQuestion = async (qid, seconds = 30) => {
    await set(ref(db, `rooms/${roomId}/quiz`), {
      currentQuestion: qid,
      timeLeft: seconds,
      startedAt: Date.now()
    });
    setAnswer('');
    setHasSubmitted(false);
  };

  // ⏹️ Stop current question
  const stopQuestion = async () => {
    await set(ref(db, `rooms/${roomId}/quiz`), null);
    setAnswer('');
  };

  // 📝 Submit answer
  const submit = async () => {
    if (!quiz?.currentQuestion || !answer.trim()) return;
    const qid = quiz.currentQuestion;
    const submissionsRef = ref(db, `rooms/${roomId}/quizSubmissions/${qid}`);
    const newRef = push(submissionsRef);
    await set(newRef, {
      user: user?.displayName || 'Anonymous',
      answer: answer.trim(),
      ts: Date.now(),
    });
    setAnswer('');
    setHasSubmitted(true);
  };

  // ➕ Add a new question
  const addQuestion = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      alert('Please fill in both question and answer');
      return;
    }
    const qRef = ref(db, `rooms/${roomId}/quizQuestions`);
    const newRef = push(qRef);
    await set(newRef, {
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      createdBy: user?.displayName || 'Anonymous',
      createdAt: Date.now()
    });
    setNewQuestion('');
    setNewAnswer('');
    setShowAddQuestion(false);
  };

  // 🗑️ Delete question
  const deleteQuestion = async (qid) => {
    if (!window.confirm('Delete this question?')) return;
    await remove(ref(db, `rooms/${roomId}/quizQuestions/${qid}`));
  };

  // Check if answer is correct
  const isCorrectAnswer = (userAnswer, correctAnswer) => {
    return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
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
          marginBottom: showAddQuestion ? '24px' : '0',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              background: 'linear-gradient(135deg, #eab308 0%, #f97316 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Play size={22} color="white" />
            </div>
            <div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                Quiz Mode
              </h3>
              <p style={{
                fontSize: '13px',
                color: '#6b7280',
                margin: 0
              }}>
                {Object.keys(questions).length} question{Object.keys(questions).length !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddQuestion(!showAddQuestion)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
              background: '#eab308',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#ca8a04'}
            onMouseOut={(e) => e.currentTarget.style.background = '#eab308'}
          >
            <Plus size={18} />
            <span>Add Question</span>
          </button>
        </div>

        {/* Add Question Form */}
        {showAddQuestion && (
          <div style={{
            background: '#fefce8',
            borderRadius: '8px',
            padding: '20px',
            border: '1px solid #fde047'
          }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#854d0e',
              marginBottom: '16px',
              margin: 0
            }}>
              Create New Question
            </h4>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Question
              </label>
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="e.g., What is the capital of France?"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#eab308'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Correct Answer
              </label>
              <input
                type="text"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="e.g., Paris"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#eab308'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={addQuestion}
                disabled={!newQuestion.trim() || !newAnswer.trim()}
                style={{
                  padding: '10px 20px',
                  background: newQuestion.trim() && newAnswer.trim() ? '#eab308' : '#e5e7eb',
                  color: newQuestion.trim() && newAnswer.trim() ? 'white' : '#9ca3af',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: newQuestion.trim() && newAnswer.trim() ? 'pointer' : 'not-allowed',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => {
                  if (newQuestion.trim() && newAnswer.trim()) e.currentTarget.style.background = '#ca8a04';
                }}
                onMouseOut={(e) => {
                  if (newQuestion.trim() && newAnswer.trim()) e.currentTarget.style.background = '#eab308';
                }}
              >
                Add Question
              </button>
              <button
                onClick={() => {
                  setShowAddQuestion(false);
                  setNewQuestion('');
                  setNewAnswer('');
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

      <div style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth >= 1024 ? '1fr 1fr' : '1fr',
        gap: '24px'
      }}>
        {/* Question Bank */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #e5e7eb'
        }}>
          <h4 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px',
            margin: 0
          }}>
            Question Bank
          </h4>
          {Object.entries(questions).length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px'
            }}>
              <Trophy size={48} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>
                No questions yet
              </p>
              <p style={{ color: '#9ca3af', fontSize: '13px' }}>
                Add a question to get started!
              </p>
            </div>
          ) : (
            <div style={{ marginTop: '16px' }}>
              {Object.entries(questions).map(([id, q]) => (
                <div
                  key={id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: '16px',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    gap: '12px',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#f9fafb'}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#1f2937',
                      marginBottom: '4px'
                    }}>
                      {q.question}
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      By {q.createdBy || 'Anonymous'}
                    </p>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexShrink: 0
                  }}>
                    <button
                      onClick={() => startQuestion(id)}
                      disabled={quiz?.currentQuestion === id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '8px 16px',
                        background: quiz?.currentQuestion === id ? '#e5e7eb' : '#10b981',
                        color: quiz?.currentQuestion === id ? '#9ca3af' : 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: quiz?.currentQuestion === id ? 'not-allowed' : 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => {
                        if (quiz?.currentQuestion !== id) e.currentTarget.style.background = '#059669';
                      }}
                      onMouseOut={(e) => {
                        if (quiz?.currentQuestion !== id) e.currentTarget.style.background = '#10b981';
                      }}
                    >
                      <Play size={14} />
                      <span>Start</span>
                    </button>
                    <button
                      onClick={() => deleteQuestion(id)}
                      style={{
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
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#fecaca'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#fee2e2'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Question */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h4 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0
            }}>
              Live Question
            </h4>
            {quiz?.currentQuestion && (
              <button
                onClick={stopQuestion}
                style={{
                  padding: '6px 16px',
                  background: '#fee2e2',
                  color: '#dc2626',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#fecaca'}
                onMouseOut={(e) => e.currentTarget.style.background = '#fee2e2'}
              >
                Stop
              </button>
            )}
          </div>

          {quiz?.currentQuestion ? (
            <div>
              {/* Timer */}
              <div style={{
                background: timeLeft <= 5 ? '#fee2e2' : '#fefce8',
                borderRadius: '8px',
                padding: '16px',
                border: timeLeft <= 5 ? '1px solid #fecaca' : '1px solid #fde047',
                marginBottom: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Clock size={20} color={timeLeft <= 5 ? '#dc2626' : '#ca8a04'} />
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: timeLeft <= 5 ? '#dc2626' : '#854d0e'
                    }}>
                      Time Remaining
                    </span>
                  </div>
                  <span style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: timeLeft <= 5 ? '#dc2626' : '#ca8a04'
                  }}>
                    {timeLeft}s
                  </span>
                </div>
              </div>

              {/* Question */}
              <div style={{
                background: '#f9fafb',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '16px'
              }}>
                <p style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#1f2937',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  {questions[quiz.currentQuestion]?.question}
                </p>
              </div>

              {/* Answer Input */}
              {!hasSubmitted ? (
                <div>
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && submit()}
                    placeholder="Type your answer here..."
                    disabled={timeLeft === 0}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      marginBottom: '12px',
                      background: timeLeft === 0 ? '#f3f4f6' : 'white',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                  <button
                    onClick={submit}
                    disabled={!answer.trim() || timeLeft === 0}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: answer.trim() && timeLeft > 0 ? '#eab308' : '#e5e7eb',
                      color: answer.trim() && timeLeft > 0 ? 'white' : '#9ca3af',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: answer.trim() && timeLeft > 0 ? 'pointer' : 'not-allowed',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => {
                      if (answer.trim() && timeLeft > 0) e.currentTarget.style.background = '#ca8a04';
                    }}
                    onMouseOut={(e) => {
                      if (answer.trim() && timeLeft > 0) e.currentTarget.style.background = '#eab308';
                    }}
                  >
                    Submit Answer
                  </button>
                </div>
              ) : (
                <div style={{
                  background: '#d1fae5',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '1px solid #6ee7b7'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#065f46'
                  }}>
                    <CheckCircle size={20} />
                    <span style={{ fontWeight: '600' }}>Answer submitted!</span>
                  </div>
                </div>
              )}

              {/* Submissions */}
              {quiz.currentQuestion && submissions[quiz.currentQuestion] && (
                <div style={{
                  marginTop: '20px',
                  paddingTop: '20px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <h5 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '12px',
                    margin: 0
                  }}>
                    Submissions ({Object.keys(submissions[quiz.currentQuestion]).length})
                  </h5>
                  <div style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    marginTop: '12px'
                  }}>
                    {Object.entries(submissions[quiz.currentQuestion]).map(([subId, sub]) => {
                      const correct = isCorrectAnswer(sub.answer, questions[quiz.currentQuestion]?.answer);
                      return (
                        <div
                          key={subId}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            marginBottom: '8px',
                            background: correct ? '#d1fae5' : '#f9fafb',
                            border: correct ? '1px solid #6ee7b7' : '1px solid #e5e7eb'
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            {correct ? (
                              <CheckCircle size={16} color="#059669" />
                            ) : (
                              <XCircle size={16} color="#9ca3af" />
                            )}
                            <span style={{
                              fontWeight: '500',
                              color: '#1f2937'
                            }}>
                              {sub.user}
                            </span>
                          </div>
                          <span style={{
                            color: correct ? '#065f46' : '#6b7280'
                          }}>
                            {sub.answer}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px'
            }}>
              <Play size={56} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
              <h5 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                No Active Question
              </h5>
              <p style={{
                color: '#6b7280',
                fontSize: '14px'
              }}>
                Select a question from the bank to start the quiz
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}