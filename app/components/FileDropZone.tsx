'use client';

import { useState, useRef } from 'react';

interface Props {
  onUploaded: (url: string, filename: string) => void;
  currentFilename?: string;
}

export default function FileDropZone({ onUploaded, currentFilename }: Props) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [filename, setFilename] = useState(currentFilename || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.size > 4 * 1024 * 1024) {
      setError('Fichier trop volumineux (max 4 Mo).');
      return;
    }
    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/teacher/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Échec du téléversement');

      setFilename(file.name);
      onUploaded(data.url, file.name);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Échec du téléversement. Réessayez.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? '#FFB400' : '#DCE1E8'}`,
          borderRadius: 10,
          padding: '20px 16px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? '#FFF9EC' : '#FAFAFA',
          transition: 'all .15s ease',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        {uploading ? (
          <span style={{ fontSize: 13, color: '#5A6A7A' }}>Téléversement en cours...</span>
        ) : filename ? (
          <span style={{ fontSize: 13, color: '#27500A', fontWeight: 600 }}>📎 {filename} — cliquez pour remplacer</span>
        ) : (
          <span style={{ fontSize: 13, color: '#5A6A7A' }}>
            📄 Glissez un fichier ici, ou cliquez pour parcourir<br />
            <span style={{ fontSize: 11 }}>PDF, image ou document Word — max 4 Mo</span>
          </span>
        )}
      </div>
      {error && <p style={{ fontSize: 12, color: '#C0392B', marginTop: 6 }}>{error}</p>}
    </div>
  );
}