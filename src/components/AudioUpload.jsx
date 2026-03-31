import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2, FileAudio, Pause, Play, RotateCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AI_API_BASE_URL, apiJson } from '@/utils/api';
import '@/components/AudioUpload.css';

export default function AudioUpload({ onTranscription }) {
  const { token } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const shouldProcessOnStopRef = useRef(true);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        if (!shouldProcessOnStopRef.current) {
          audioChunksRef.current = [];
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        processAudio(audioBlob);
      };

      shouldProcessOnStopRef.current = true;
      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
    } catch (err) {
      alert("Erro ao acessar microfone. Permita o uso do microfone no navegador.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && (mediaRecorderRef.current.state === 'recording' || mediaRecorderRef.current.state === 'paused')) {
      shouldProcessOnStopRef.current = true;
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const togglePauseRecording = () => {
    if (!mediaRecorderRef.current) return;

    if (mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    } else if (mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const resetRecording = () => {
    if (!mediaRecorderRef.current) return;

    shouldProcessOnStopRef.current = false;
    if (mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    setIsRecording(false);
    setIsPaused(false);

    if (!isProcessing) {
      alert('Gravacao resetada com sucesso.');
    }
  };

  const processAudio = async (blob) => {
    setIsProcessing(true);
    const fd = new FormData();
    fd.append('file', blob, 'audio.wav');

    try {
      const result = await apiJson('/transcrever', {
        method: 'POST',
        token,
        body: fd
      }, {
        baseUrl: AI_API_BASE_URL
      });

      if (result.sucesso) {
        onTranscription(result);
      } else {
        throw new Error('A IA não retornou um resultado válido.');
      }
    } catch (err) {
      alert(err.message || 'Erro ao processar áudio com IA.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="audio-uploader card">
      <div className="audio-uploader-head">
        <div className="audio-uploader-icon" aria-hidden="true">
          <FileAudio size={18} />
        </div>
        <div>
          <h3>Gravador Inteligente</h3>
          <p>A IA preenche o prontuario automaticamente durante a consulta.</p>
        </div>
      </div>

      <div className="audio-uploader-actions">
        {!isRecording ? (
          <>
            <button onClick={startRecording} className="audio-btn audio-btn-record" disabled={isProcessing}>
              <Mic size={16} /> Iniciar Gravacao
            </button>

            <label className={`audio-btn audio-btn-upload ${isProcessing ? 'is-disabled' : ''}`}>
              <input
                type="file" 
                accept="audio/*,video/mp4,video/quicktime,audio/x-m4a,audio/m4a" 
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) processAudio(file);
                }}
                disabled={isProcessing}
                title="Clique para escolher um arquivo de áudio ou vídeo"
              />

              <span className="audio-btn-content">
                <FileAudio size={16} /> Enviar arquivo pronto
              </span>
            </label>
          </>
        ) : (
          <>
            <button onClick={stopRecording} className="audio-btn audio-btn-finalize">
              <Square size={16} /> Finalizar e Extrair
            </button>

            <button onClick={togglePauseRecording} className="audio-btn audio-btn-neutral">
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
              {isPaused ? 'Continuar' : 'Pausar'}
            </button>

            <button onClick={resetRecording} className="audio-btn audio-btn-reset">
              <RotateCcw size={16} /> Resetar gravacao
            </button>
          </>
        )}

        {isRecording && (
          <div className={`audio-status ${isPaused ? 'is-paused' : 'is-recording'}`}>
            {isPaused ? 'Gravacao pausada' : 'Gravando ao vivo'}
          </div>
        )}

        {isProcessing && (
          <div className="audio-status is-processing">
            <Loader2 className="audio-spin" size={14} /> Analisando audio...
          </div>
        )}
      </div>
    </div>
  );
}
