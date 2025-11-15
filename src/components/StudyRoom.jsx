import React, { useEffect, useState } from 'react';
import Flashcards from './Flashcards';
import Notes from './Notes';
import DiscussionBoard from './DiscussionBoard';
import QuizMode from './QuizMode';
import ReferenceMaterials from './ReferenceMaterials';
import { db } from '../firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { Home, LogOut, Brain, FileText, Archive, MessageSquare, Play } from 'lucide-react';

export default function StudyRoom({ roomId, user, onLeave }) {
  const [roomMeta, setRoomMeta] = useState(null);
  const [activeTab, setActiveTab] = useState('flashcards');

  useEffect(() => {
    const metaRef = ref(db, `rooms/${roomId}`);
    const unsub = onValue(metaRef, (snap) => {
      setRoomMeta(snap.val());
    });
    return () => unsub();
  }, [roomId]);

  const tabs = [
    { id: 'flashcards', label: 'Flashcards', icon: Brain },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'materials', label: 'Materials', icon: Archive },
    { id: 'discussion', label: 'Discussion', icon: MessageSquare },
    { id: 'quiz', label: 'Quiz', icon: Play }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Room Header */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px 24px',
        marginBottom: '24px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: window.innerWidth < 768 ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: window.innerWidth < 768 ? 'flex-start' : 'center',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={onLeave}
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#e5e7eb'}
              onMouseOut={(e) => e.currentTarget.style.background = '#f3f4f6'}
              title="Back to rooms"
            >
              <Home size={18} color="#6b7280" />
            </button>
            <div>
              <h2 style={{
                fontSize: '22px',
                fontWeight: '700',
                color: '#1f2937',
                margin: 0
              }}>
                {roomMeta?.name || 'Loading...'}
              </h2>
              <p style={{
                fontSize: '13px',
                color: '#6b7280',
                margin: '4px 0 0 0'
              }}>
                Collaborative workspace
              </p>
            </div>
          </div>
          <button
            onClick={onLeave}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
              background: '#f3f4f6',
              color: '#4b5563',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#e5e7eb'}
            onMouseOut={(e) => e.currentTarget.style.background = '#f3f4f6'}
          >
            <LogOut size={16} />
            <span>Leave Room</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '8px',
        marginBottom: '24px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        overflowX: 'auto'
      }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          minWidth: 'fit-content'
        }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: isActive ? '#667eea' : 'transparent',
                  color: isActive ? 'white' : '#6b7280',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => {
                  if (!isActive) e.currentTarget.style.background = '#f3f4f6';
                }}
                onMouseOut={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div style={{ minHeight: '400px' }}>
        {activeTab === 'flashcards' && <Flashcards roomId={roomId} user={user} />}
        {activeTab === 'notes' && <Notes roomId={roomId} user={user} />}
        {activeTab === 'materials' && <ReferenceMaterials roomId={roomId} user={user} />}
        {activeTab === 'discussion' && <DiscussionBoard roomId={roomId} user={user} />}
        {activeTab === 'quiz' && <QuizMode roomId={roomId} user={user} />}
      </div>
    </div>
  );
}