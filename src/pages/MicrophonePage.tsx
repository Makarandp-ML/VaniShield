import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, RefreshCw, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { useThemeLang } from '@/contexts/ThemeLangContext';
import { LoadingState, ErrorMessage } from '@/components/ui';
import { ResultCard } from '@/components/ResultCard';
import { analyzeAudio, type AnalysisResult } from '@/services/analysisService';
import { getMicExamples } from '@/data/rotatingExamples';
import { ExampleSection } from '@/components/ExampleSection';

const STEPS = ['Preparing audio...', 'Extracting speech signals...', 'Analyzing acoustic patterns...', 'Checking synthetic-speech indicators...'];

export function MicrophonePage() {
  const { t } = useThemeLang();
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [playing, setPlaying] = useState(false);
  const [micExamples, setMicExamples] = useState(() => getMicExamples());
  const [showExamples, setShowExamples] = useState(false);
  const refreshExamples = () => setMicExamples(getMicExamples());

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((tr) => tr.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    setError('');
    setResult(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(t('mic.denied'));
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((tr) => tr.stop());
          streamRef.current = null;
        }
      };

      mr.start();
      setRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      const e = err as Error;
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setError(t('mic.denied'));
      } else if (e.name === 'NotFoundError') {
        setError(t('mic.unavailable'));
      } else {
        setError(e.message);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    setDuration(recordingTime);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const handleAnalyze = async () => {
    if (!audioBlob) return;
    setError('');
    setAnalyzing(true);
    setResult(null);
    setStep(0);

    STEPS.forEach((_, i) => {
      setTimeout(() => setStep(i + 1), i * 600);
    });

    try {
      const file = new File([audioBlob], `recording-${Date.now()}.webm`, { type: audioBlob.type || 'audio/webm' });
      const r = await analyzeAudio(file, duration);
      setResult(r);
    } catch {
      setError('Analysis failed. Please try again.');
    }
    setAnalyzing(false);
  };

  const handleDelete = () => {
    setAudioUrl(null);
    setAudioBlob(null);
    setResult(null);
    setDuration(0);
    setRecordingTime(0);
    setPlaying(false);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
          <Mic size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('mic.title')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.liveAudioDesc')}</p>
        </div>
      </div>

      {!recording && !audioUrl && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 sm:p-12 text-center">
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mx-auto mb-4 ${recording ? 'animate-pulse' : ''}`}>
            <Mic size={40} className="text-white" />
          </div>
          <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">{t('mic.readyToRecord')}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{t('mic.permission')}</p>
          <button
            onClick={startRecording}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-medium hover:shadow-lg hover:shadow-rose-500/30 transition-all inline-flex items-center gap-2"
          >
            <Mic size={18} />
            {t('mic.startRecording')}
          </button>
        </div>
      )}

      {recording && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Mic size={40} className="text-white" />
          </div>
          <p className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">{t('mic.recording')}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mb-6 tabular-nums">{formatTime(recordingTime)}</p>
          <div className="flex items-center justify-center gap-1 h-12 mb-6">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-rose-500 rounded-full animate-pulse"
                style={{ height: `${10 + Math.random() * 30}px`, animationDelay: `${i * 0.05}s` }}
              />
            ))}
          </div>
          <button
            onClick={stopRecording}
            className="px-6 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-all inline-flex items-center gap-2"
          >
            <Square size={18} />
            {t('mic.stop')}
          </button>
        </div>
      )}

      {audioUrl && !recording && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">{t('mic.title')}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{formatTime(duration)} · WebM</p>
            </div>
            <button onClick={handleDelete} className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
              <Trash2 size={18} />
            </button>
          </div>

          <div className="flex items-center gap-1 h-16 px-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
            {[...Array(50)].map((_, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-rose-500 to-pink-500 rounded-full" style={{ height: `${20 + Math.sin(i * 0.3) * 20 + Math.random() * 15}%` }} />
            ))}
          </div>

          <audio ref={audioRef} src={audioUrl} onEnded={() => setPlaying(false)} />
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white flex items-center justify-center hover:shadow-lg transition-all">
              {playing ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400">{formatTime(duration)}</span>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              <RefreshCw size={16} />
              {t('mic.recordAgain')}
            </button>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-medium hover:shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {analyzing ? t('common.analyzing') : t('mic.analyze')}
              <Mic size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <button
          onClick={() => setShowExamples(!showExamples)}
          className="w-full flex items-center justify-between text-left"
        >
          <span className="text-sm font-bold text-slate-900 dark:text-white">{t('examples.title')}</span>
          {showExamples ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </button>
        {showExamples && (
          <div className="mt-4">
            <ExampleSection examples={micExamples} onNew={refreshExamples} />
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {analyzing && <LoadingState steps={STEPS} currentStep={step} />}
      {result && !analyzing && (
        <ResultCard result={result} analysisType="recording" language="en" onCheckAgain={handleDelete} />
      )}
    </div>
  );
}
