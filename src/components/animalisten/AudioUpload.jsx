import { useState, useRef } from 'react';
import { Mic, MicOff, Upload, FileAudio, X, Play, Pause, Send, Loader } from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000';

export default function AudioUpload({ onTranscription }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionDone, setTranscriptionDone] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);
  const fileInputRef = useRef(null);

  const startRecording = async () => {
    try {
      setError(null);
      setTranscriptionDone(false);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioFile(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert('Não foi possível acessar o microfone. Verifique as permissões.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setError(null);
      setTranscriptionDone(false);
      const url = URL.createObjectURL(file);
      setAudioFile(file);
      setAudioUrl(url);
    }
  };

  const removeAudio = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioFile(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setTranscriptionDone(false);
    setError(null);
  };

  const togglePlay = () => {
    if (audioPlayerRef.current) {
      if (isPlaying) {
        audioPlayerRef.current.pause();
      } else {
        audioPlayerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTranscribe = async () => {
    if (!audioFile) return;

    setIsTranscribing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', audioFile, audioFile.name || 'gravacao.webm');

      const response = await fetch(`${API_URL}/transcrever`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erro do servidor: ${response.status}`);
      }

      const data = await response.json();

      if (data.sucesso && onTranscription) {
        onTranscription(data);
        setTranscriptionDone(true);
      } else {
        throw new Error('A resposta do servidor não contém dados válidos.');
      }
    } catch (err) {
      console.error('Erro na transcrição:', err);
      setError(err.message || 'Erro ao transcrever o áudio. Verifique se o servidor está rodando.');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="card">
      <div className="section-header">
        <div className="section-icon blue">
          <Mic size={18} />
        </div>
        <h3>Captura de Áudio</h3>
      </div>

      {/* Botão de Gravação */}
      <div className="text-center mb-4">
        <button
          className={`mic-btn ${isRecording ? 'recording' : ''}`}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isTranscribing}
          style={{ margin: '0 auto' }}
        >
          {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
        </button>
        <p className="text-sm mt-2" style={{ color: isRecording ? '#ef4444' : 'var(--text-muted)', fontWeight: 600 }}>
          {isRecording ? '🔴 Gravando... clique para parar' : 'Clique para gravar'}
        </p>
      </div>

      {/* Divisor */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        <span className="text-xs" style={{ color: 'var(--text-muted)', fontWeight: 600 }}>OU</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      {/* Upload de Arquivo */}
      <div
        className="audio-zone"
        onClick={() => !isTranscribing && fileInputRef.current?.click()}
        style={{ opacity: isTranscribing ? 0.5 : 1, cursor: isTranscribing ? 'not-allowed' : 'pointer' }}
      >
        <Upload size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
        <p className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
          Enviar arquivo de áudio
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
          .mp3, .wav, .webm, .ogg
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </div>

      {/* Audio Player */}
      {audioUrl && (
        <div className="mt-4" style={{
          background: 'var(--background-alt)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <button className="btn btn-icon btn-outline" onClick={togglePlay} disabled={isTranscribing}>
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <div style={{ flex: 1 }}>
            <div className="flex items-center gap-2">
              <FileAudio size={14} style={{ color: 'var(--primary)' }} />
              <span className="text-sm font-bold">
                {audioFile?.name || 'Gravação'}
              </span>
            </div>
            <audio
              ref={audioPlayerRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
            />
          </div>
          <button className="btn btn-icon btn-ghost" onClick={removeAudio} disabled={isTranscribing} style={{ color: 'var(--danger)' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Botão Confirmar e Transcrever */}
      {audioUrl && !transcriptionDone && (
        <button
          className="btn btn-primary btn-transcribe"
          onClick={handleTranscribe}
          disabled={isTranscribing}
          style={{ width: '100%', marginTop: '16px', justifyContent: 'center', gap: '8px' }}
        >
          {isTranscribing ? (
            <>
              <Loader size={18} className="spin-animation" />
              Transcrevendo...
            </>
          ) : (
            <>
              <Send size={18} />
              Confirmar e Transcrever
            </>
          )}
        </button>
      )}

      {/* Sucesso */}
      {transcriptionDone && (
        <div className="transcription-success" style={{ marginTop: '12px' }}>
          <p className="text-sm" style={{ color: 'var(--secondary)', fontWeight: 700, textAlign: 'center' }}>
            ✅ Transcrição concluída! Dados preenchidos no prontuário.
          </p>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div style={{
          marginTop: '12px',
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
        }}>
          <p className="text-sm" style={{ color: '#ef4444', fontWeight: 600 }}>
            ⚠️ {error}
          </p>
        </div>
      )}
    </div>
  );
}
