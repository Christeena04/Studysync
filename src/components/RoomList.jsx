import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { ref, onValue, push, set } from 'firebase/database';
import { Users, BookOpen, Plus, Clock, ChevronRight } from 'lucide-react';

export default function RoomList({ onJoin, user }) {
  const [rooms, setRooms] = useState({});
  const [roomName, setRoomName] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  // 🧩 Listen to rooms in real-time
  useEffect(() => {
    const roomsRef = ref(db, 'rooms');
    const unsub = onValue(roomsRef, (snap) => {
      setRooms(snap.val() || {});
    });
    return () => unsub();
  }, []);

  // ➕ Create new room
  const createRoom = async () => {
    if (!roomName.trim()) return;
    const roomsRef = ref(db, 'rooms');
    const newRoomRef = push(roomsRef);
    await set(newRoomRef, {
      name: roomName,
      createdBy: user?.displayName || 'Anonymous',
      createdAt: Date.now(),
      members: 0
    });
    setRoomName('');
    setShowCreate(false);
    onJoin(newRoomRef.key);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '60px 40px',
        marginBottom: '48px',
        color: 'white',
        boxShadow: '0 10px 40px rgba(102, 126, 234, 0.2)'
      }}>
        <div style={{ maxWidth: '600px' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            marginBottom: '16px',
            lineHeight: '1.2'
          }}>
            Welcome to StudySync
          </h1>
          <p style={{
            fontSize: '20px',
            marginBottom: '32px',
            opacity: '0.95',
            lineHeight: '1.6'
          }}>
            Create or join study rooms to collaborate with your peers, share notes, and learn together.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              background: 'white',
              color: '#667eea',
              padding: '14px 32px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Plus size={20} />
            <span>Create Study Room</span>
          </button>
        </div>
      </div>

      {/* Create Room Form */}
      {showCreate && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '32px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '20px',
            color: '#1f2937'
          }}>
            Create New Study Room
          </h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name (e.g., Computer Science 101)"
              onKeyPress={(e) => e.key === 'Enter' && createRoom()}
              autoFocus
              style={{
                flex: '1',
                minWidth: '300px',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
            <button
              onClick={createRoom}
              disabled={!roomName.trim()}
              style={{
                padding: '12px 28px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: roomName.trim() ? 'pointer' : 'not-allowed',
                opacity: roomName.trim() ? '1' : '0.5',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => {
                if (roomName.trim()) e.currentTarget.style.background = '#5568d3';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#667eea';
              }}
            >
              Create Room
            </button>
            <button
              onClick={() => {
                setShowCreate(false);
                setRoomName('');
              }}
              style={{
                padding: '12px 28px',
                background: '#f3f4f6',
                color: '#4b5563',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#e5e7eb'}
              onMouseOut={(e) => e.currentTarget.style.background = '#f3f4f6'}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Active Rooms Section */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '8px'
            }}>
              Active Study Rooms
            </h2>
            <p style={{ color: '#6b7280', fontSize: '15px' }}>
              {Object.entries(rooms).length} room{Object.entries(rooms).length !== 1 ? 's' : ''} available
            </p>
          </div>
          {!showCreate && (
            <button
              onClick={() => setShowCreate(true)}
              style={{
                padding: '10px 24px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#5568d3'}
              onMouseOut={(e) => e.currentTarget.style.background = '#667eea'}
            >
              <Plus size={18} />
              <span>New Room</span>
            </button>
          )}
        </div>

        {Object.entries(rooms).length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '80px 40px',
            textAlign: 'center',
            border: '2px dashed #e5e7eb'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: '#f3f4f6',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <BookOpen size={36} color="#9ca3af" />
            </div>
            <h3 style={{
              fontSize: '22px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '12px'
            }}>
              No study rooms yet
            </h3>
            <p style={{
              color: '#6b7280',
              marginBottom: '28px',
              fontSize: '15px'
            }}>
              Create the first study room and invite others to join
            </p>
            <button
              onClick={() => setShowCreate(true)}
              style={{
                padding: '12px 28px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#5568d3'}
              onMouseOut={(e) => e.currentTarget.style.background = '#667eea'}
            >
              <Plus size={20} />
              <span>Create First Room</span>
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {Object.entries(rooms).map(([id, room]) => (
              <div
                key={id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BookOpen size={24} color="white" />
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    background: '#f3f4f6',
                    color: '#6b7280',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '500',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Users size={14} />
                    {room.members || 0}
                  </span>
                </div>

                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '8px',
                  lineHeight: '1.4'
                }}>
                  {room.name}
                </h3>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {room.createdBy?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <span style={{
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    {room.createdBy}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '16px',
                  borderTop: '1px solid #f3f4f6'
                }}>
                  <span style={{
                    fontSize: '13px',
                    color: '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Clock size={14} />
                    {new Date(room.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => onJoin(id)}
                    style={{
                      padding: '8px 20px',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.stopPropagation();
                      e.currentTarget.style.background = '#5568d3';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = '#667eea';
                    }}
                  >
                    <span>Join</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}