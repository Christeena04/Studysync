import { useEffect, useState } from 'react';
import RoomList from './components/RoomList.jsx';
import StudyRoom from './components/StudyRoom.jsx';
import { auth, googleProvider } from './firebaseConfig';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { BookOpen, LogOut, LogIn } from 'lucide-react';
import './App.css';

// ---- USER TYPE FIX ----
interface UserType {
  displayName?: string;
  email?: string;
  uid?: string;
}

export default function App() {
  const [user, setUser] = useState<UserType | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          displayName: firebaseUser.displayName || "",
          email: firebaseUser.email || "",
          uid: firebaseUser.uid || "",
        });
      } else {
        setUser(null);
      }
    });
    return () => unsub();
  }, []);

  // Login
  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error(e);
    }
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
    setRoomId(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      
      {/* Navigation Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '70px'
          }}>

            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BookOpen size={24} color="white" />
              </div>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                  StudySync
                </h1>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                  Collaborative Learning
                </p>
              </div>
            </div>

            {/* User Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {user ? (
                <>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 16px',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                      {user.displayName}
                    </span>
                  </div>

                  <button
                    onClick={logout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 20px',
                      background: 'white',
                      color: '#6b7280',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={login}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  <LogIn size={18} />
                  <span>Sign in with Google</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {!roomId ? (
          <RoomList onJoin={(id: string) => setRoomId(id)} user={user} />
        ) : (
          <StudyRoom roomId={roomId} user={user} onLeave={() => setRoomId(null)} />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        background: 'white',
        borderTop: '1px solid #e5e7eb',
        marginTop: '80px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '32px 20px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: window.innerWidth < 768 ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#6b7280',
              fontSize: '14px'
            }}>
              <span style={{ fontSize: '20px' }}>❤️</span>
              <span>Built for students, by students</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              <a href="#" style={{ color: '#6b7280', textDecoration: 'none' }}>About</a>
              <a href="#" style={{ color: '#6b7280', textDecoration: 'none' }}>Privacy</a>
              <a href="#" style={{ color: '#6b7280', textDecoration: 'none' }}>Terms</a>
              <a href="#" style={{ color: '#6b7280', textDecoration: 'none' }}>Contact</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
