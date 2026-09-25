import { useState, useRef, useCallback } from 'react';
import { Mic, Upload, X, Play, Pause, Trash2 } from 'lucide-react';
import { useThemeLang } from '@/contexts/ThemeLangContext';
import { LoadingState, ErrorMessage } from '@/components/ui';
import { ResultCard } from '@/components/ResultCard';
import { analyzeAudio, type AnalysisResult } from '@/services/analysisService';

const STEPS = ['Preparing audio...', 'Extracting speech signals...', 'Analyzing acoustic patterns...', 'Checking synthetic-speech indicators...'];
const ACCEPTED = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/m4a', 'audio/ogg', 'audio/webm', 'audio/x-m4a'];
const MAX_SIZE = 25 * 1024 * 1024;

export function AudioCheckPage() {
  const { t } = useThemeLang();
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [dragOver, setDragOver] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    const isValid = ACCEPTED.includes(f.type) || f.name.match(/\.(mp3|wav|m4a|ogg|webm)$/i);
    if (!isValid) {
      setError('Unsupported file type. Please upload MP3, WAV, M4A, OGG, or WEBM.');
      return;
    }
    if (f.size > MAX_SIZE) {
      setError('File too large. Maximum size is 25 MB.');
      return;
    }
    setError('');
    setFile(f);
    setResult(null);
    const url = URL.createObjectURL(f);
    setAudioUrl(url);

    const audio = new Audio(url);
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * duration;
  };

  const handleAnalyze = () => {
    if (!file) return;
    setError('');
    setAnalyzing(true);
    setResult(null);
    setStep(0);

    STEPS.forEach((_, i) => {
      setTimeout(() => setStep(i + 1), i * 700);
    });

    setTimeout(() => {
      const r = analyzeAudio(file, duration);
      setResult(r);
      setAnalyzing(false);
    }, STEPS.length * 700 + 300);
  };

  const handleRemove = () => {
    setFile(null);
    setAudioUrl(null);
    setResult(null);
    setError('');
    setPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
          <Mic size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('dashboard.audioCheck')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Check audio for potential synthetic or manipulated speech.</p>
        </div>
      </div>

      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
            dragOver ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30' : 'border-slate-300 dark:border-slate-700 hover:border-teal-400'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-4">
            <Upload size={32} className="text-white" />
          </div>
          <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">{t('audio.upload')}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">MP3, WAV, M4A, OGG, WEBM — max 25 MB</p>
          <span className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium">
            {t('image.browse')}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED.join(',')}
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          {/* Audio Info */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">{file.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {(file.size / 1024).toFixed(1)} KB · {formatTime(duration)} · {file.type || 'audio'}
              </p>
            </div>
            <button onClick={handleRemove} className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
              <Trash2 size={18} />
            </button>
          </div>

          {/* Waveform Visual */}
          <div className="flex items-center gap-1 h-16 px-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-orange-500 to-red-500 rounded-full"
                style={{
                  height: `${20 + Math.sin(i * 0.3) * 20 + Math.random() * 15}%`,
                  opacity: currentTime / duration > i / 50 ? 1 : 0.4,
                }}
              />
            ))}
          </div>

          {/* Player */}
          {audioUrl && (
            <>
              <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onEnded={() => setPlaying(false)}
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center hover:shadow-lg transition-all"
                >
                  {playing ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <span className="text-xs text-slate-500 dark:text-slate-400 w-10">{formatTime(currentTime)}</span>
                <div
                  className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 cursor-pointer"
                  onClick={handleSeek}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all"
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 w-10">{formatTime(duration)}</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                    if (audioRef.current) audioRef.current.volume = v;
                  }}
                  className="w-16 accent-teal-500"
                />
              </div>
            </>
          )}

          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-medium hover:shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {analyzing ? 'Analyzing...' : t('audio.analyze')}
            <Mic size={18} />
          </button>
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      {analyzing && <LoadingState steps={STEPS} currentStep={step} />}

      {result && !analyzing && (
        <ResultCard
          result={result}
          analysisType="audio"
          language="en"
          onCheckAgain={handleRemove}
        />
      )}
    </div>
  );
}
