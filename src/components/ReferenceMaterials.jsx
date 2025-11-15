import React, { useEffect, useState } from "react";
import { db, storage } from "../firebaseConfig";
import { ref as dbRef, onValue, push, set, remove } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { Archive, Upload, Download, Trash2, FileText, Image as ImageIcon, File } from "lucide-react";

export default function ReferenceMaterials({ roomId, user }) {
  const [materials, setMaterials] = useState({});
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // 🔄 Fetch all uploaded materials in real time
  useEffect(() => {
    const materialsRef = dbRef(db, `rooms/${roomId}/materials`);
    const unsubscribe = onValue(materialsRef, (snap) => {
      setMaterials(snap.val() || {});
    });
    return () => unsubscribe();
  }, [roomId]);

  // 📤 Upload a new reference file
  const uploadMaterial = async () => {
    if (!file) return alert("Please choose a file to upload.");

    try {
      setUploading(true);
      const filePath = `rooms/${roomId}/materials/${Date.now()}_${file.name}`;
      const fileRef = storageRef(storage, filePath);

      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      const materialsRef = dbRef(db, `rooms/${roomId}/materials`);
      const newRef = push(materialsRef);
      await set(newRef, {
        fileName: file.name,
        fileUrl: url,
        uploadedBy: user?.displayName || "Anonymous",
        uploadedAt: Date.now(),
        fileType: file.type,
        fileSize: file.size
      });

      setFile(null);
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed! Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  // 🗑️ Delete material
  const deleteMaterial = async (id) => {
    if (!window.confirm("Delete this file?")) return;
    try {
      await remove(dbRef(db, `rooms/${roomId}/materials/${id}`));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete file.");
    }
  };

  // 🧠 Helper: Get an icon based on file type
  const getFileIcon = (material) => {
    const { fileType, fileName } = material;
    if (!fileType) return <File size={24} color="#9ca3af" />;

    if (fileType.startsWith("image/")) {
      return <ImageIcon size={24} color="#3b82f6" />;
    } else if (fileType.includes("pdf")) {
      return <FileText size={24} color="#ef4444" />;
    } else if (fileType.includes("presentation") || fileName.endsWith(".pptx")) {
      return <FileText size={24} color="#f97316" />;
    } else if (fileType.includes("word") || fileName.endsWith(".docx")) {
      return <FileText size={24} color="#2563eb" />;
    } else {
      return <File size={24} color="#9ca3af" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
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
          marginBottom: '20px'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Archive size={22} color="white" />
          </div>
          <div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0
            }}>
              Reference Materials
            </h3>
            <p style={{
              fontSize: '13px',
              color: '#6b7280',
              margin: 0
            }}>
              {Object.keys(materials).length} file{Object.keys(materials).length !== 1 ? 's' : ''} uploaded
            </p>
          </div>
        </div>

        {/* Upload Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{
            border: dragActive ? '2px dashed #3b82f6' : '2px dashed #d1d5db',
            borderRadius: '8px',
            padding: '32px',
            background: dragActive ? '#eff6ff' : '#f9fafb',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <Upload size={40} color="#9ca3af" style={{ margin: '0 auto 16px' }} />
            {file ? (
              <div style={{ marginBottom: '16px' }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#1f2937',
                  marginBottom: '4px'
                }}>
                  {file.name}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  {formatFileSize(file.size)}
                </p>
              </div>
            ) : (
              <>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  marginBottom: '8px'
                }}>
                  Drag and drop your file here, or click to browse
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#9ca3af'
                }}>
                  Supported: PDF, DOC, DOCX, PPT, PPTX, JPG, PNG
                </p>
              </>
            )}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginTop: '16px'
            }}>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.png,.jpeg"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ display: 'none' }}
                id="file-input"
              />
              <label
                htmlFor="file-input"
                style={{
                  padding: '10px 20px',
                  background: '#e5e7eb',
                  color: '#374151',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  display: 'inline-block'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#d1d5db'}
                onMouseOut={(e) => e.currentTarget.style.background = '#e5e7eb'}
              >
                Choose File
              </label>
              <button
                onClick={uploadMaterial}
                disabled={!file || uploading}
                style={{
                  padding: '10px 20px',
                  background: file && !uploading ? '#3b82f6' : '#e5e7eb',
                  color: file && !uploading ? 'white' : '#9ca3af',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: file && !uploading ? 'pointer' : 'not-allowed',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => {
                  if (file && !uploading) e.currentTarget.style.background = '#2563eb';
                }}
                onMouseOut={(e) => {
                  if (file && !uploading) e.currentTarget.style.background = '#3b82f6';
                }}
              >
                {uploading ? "Uploading..." : "Upload File"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Materials List */}
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
          Uploaded Files
        </h4>
        {Object.entries(materials).length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px'
          }}>
            <Archive size={48} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>
              No files uploaded yet
            </p>
            <p style={{ color: '#9ca3af', fontSize: '13px' }}>
              Upload your first reference material above
            </p>
          </div>
        ) : (
          <div style={{ marginTop: '16px' }}>
            {Object.entries(materials)
              .sort((a, b) => b[1].uploadedAt - a[1].uploadedAt)
              .map(([id, mat]) => (
                <div
                  key={id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    transition: 'background 0.2s',
                    gap: '12px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#f9fafb'}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    flex: 1,
                    minWidth: 0
                  }}>
                    <div style={{ flexShrink: 0 }}>
                      {getFileIcon(mat)}
                    </div>
                    <div style={{
                      flex: 1,
                      minWidth: 0
                    }}>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#1f2937',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {mat.fileName}
                      </p>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginTop: '4px',
                        fontSize: '12px',
                        color: '#6b7280',
                        flexWrap: 'wrap'
                      }}>
                        <span>By {mat.uploadedBy}</span>
                        <span>•</span>
                        <span>{new Date(mat.uploadedAt).toLocaleDateString()}</span>
                        {mat.fileSize && (
                          <>
                            <span>•</span>
                            <span>{formatFileSize(mat.fileSize)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexShrink: 0
                  }}>
                    <a
                      href={mat.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        background: '#3b82f6',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
                    >
                      <Download size={14} />
                      <span>View</span>
                    </a>
                    <button
                      onClick={() => deleteMaterial(id)}
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
    </div>
  );
}