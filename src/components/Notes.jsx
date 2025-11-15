import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { ref, onValue, set } from 'firebase/database';
import { FileText, Save, RefreshCw } from 'lucide-react';

export default function Notes({ roomId, user }) {
  const [notes, setNotes] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // 🧩 Listen for shared notes in real time
  useEffect(() => {
    const notesRef = ref(db, `rooms/${roomId}/notes`);
    const unsubscribe = onValue(notesRef, (snap) => {
      const data = snap.val();
      if (data) {
        setNotes(data.content || '');
        setLastSaved(data.lastSaved || null);
        setHasChanges(false);
      }
    });
    return () => unsubscribe();
  }, [roomId]);

  // 💾 Save notes
  const save = async () => {
    try {
      setSaving(true);
      await set(ref(db, `rooms/${roomId}/notes`), {
        content: notes,
        lastSaved: Date.now(),
        lastEditedBy: user?.displayName || 'Anonymous'
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save notes:', error);
      alert('Failed to save notes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle text change
  const handleChange = (e) => {
    setNotes(e.target.value);
    setHasChanges(true);
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
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <FileText size={22} color="white" />
            </div>
            <div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                Shared Notes
              </h3>
              <p style={{
                fontSize: '13px',
                color: '#6b7280',
                margin: 0
              }}>
                {lastSaved 
                  ? `Last saved ${new Date(lastSaved).toLocaleString()}`
                  : 'Not saved yet'
                }
              </p>
            </div>
          </div>
          <button
            onClick={save}
            disabled={!hasChanges || saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
              background: hasChanges && !saving ? '#10b981' : '#e5e7eb',
              color: hasChanges && !saving ? 'white' : '#9ca3af',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: hasChanges && !saving ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => {
              if (hasChanges && !saving) e.currentTarget.style.background = '#059669';
            }}
            onMouseOut={(e) => {
              if (hasChanges && !saving) e.currentTarget.style.background = '#10b981';
            }}
          >
            {saving ? (
              <>
                <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Notes</span>
              </>
            )}
          </button>
        </div>

        {/* Tips */}
        <div style={{
          background: '#f0fdf4',
          borderRadius: '8px',
          padding: '16px',
          border: '1px solid #bbf7d0',
          marginBottom: '20px'
        }}>
          <h4 style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#166534',
            marginBottom: '8px',
            margin: 0
          }}>
            💡 Tips for effective note-taking:
          </h4>
          <ul style={{
            fontSize: '13px',
            color: '#15803d',
            margin: '8px 0 0 0',
            paddingLeft: '20px',
            lineHeight: '1.6'
          }}>
            <li>Use headings with # for organization (e.g., # Main Topic)</li>
            <li>Create bullet points with - or *</li>
            <li>All changes are shared with everyone in the room</li>
            <li>Remember to save your work frequently</li>
          </ul>
        </div>

        {/* Notes Editor */}
        <div style={{ position: 'relative' }}>
          {hasChanges && (
            <div style={{
              position: 'absolute',
              top: '-8px',
              right: '8px',
              padding: '4px 12px',
              background: '#fef3c7',
              color: '#92400e',
              fontSize: '12px',
              fontWeight: '500',
              borderRadius: '12px',
              border: '1px solid #fde68a'
            }}>
              Unsaved changes
            </div>
          )}
          <textarea
            value={notes}
            onChange={handleChange}
            rows={20}
            placeholder="Start taking notes...

You can use markdown syntax:
# Heading
## Subheading
- Bullet point
**bold text**
*italic text*"
            style={{
              width: '100%',
              padding: '14px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'Monaco, Consolas, "Courier New", monospace',
              resize: 'vertical',
              outline: 'none',
              lineHeight: '1.6',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '8px',
            fontSize: '12px',
            color: '#6b7280'
          }}>
            <span>{notes.length} characters</span>
            <span>Press Ctrl+S or Cmd+S to save quickly</span>
          </div>
        </div>
      </div>

      {/* Preview Section */}
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
          Preview
        </h4>
        <div style={{
          fontSize: '14px',
          lineHeight: '1.8',
          color: '#374151',
          whiteSpace: 'pre-wrap',
          marginTop: '16px'
        }}>
          {notes || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Your notes will appear here...</span>}
        </div>
      </div>
      
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}