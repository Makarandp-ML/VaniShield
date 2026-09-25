import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera as CameraIcon, RefreshCw, X, AlertCircle } from 'lucide-react';
import { useThemeLang } from '@/contexts/ThemeLangContext';
import { LoadingState, ErrorMessage } from '@/components/ui';
import { ResultCard } from '@/components/ResultCard';
import { analyzeImage, type AnalysisResult } from '@/services/analysisService';

const STEPS = ['Preparing image...', 'Inspecting available metadata...', 'Analyzing visual signals...', 'Checking synthetic-image indicators...'];

export function CameraCapturePage() {
  const { t } = useThemeLang();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setError('');
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(t('camera.unsupported'));
        return;
      }
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = s;
      setStream(s);
      setCameraActive(true);
      setPreview(null);
      setCapturedFile(null);
      setResult(null);
    } catch (err) {
      const e = err as Error;
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setError(t('camera.denied'));
      } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
        setError(t('camera.unavailable'));
      } else {
        setError(`Camera error: ${e.message}`);
      }
    }
  };

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((tr) => tr.stop());
        streamRef.current = null;
      }
    };
  }, [stream]);

  const capture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPreview(dataUrl);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setCapturedFile(file);
      }
    }, 'image/jpeg', 0.9);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const retake = () => {
    setPreview(null);
    setCapturedFile(null);
    setResult(null);
    startCamera();
  };

  const handleAnalyze = () => {
    if (!capturedFile) return;
    setError('');
    setAnalyzing(true);
    setResult(null);
    setStep(0);

    STEPS.forEach((_, i) => {
      setTimeout(() => setStep(i + 1), i * 700);
    });

    setTimeout(() => {
      const r = analyzeImage(capturedFile);
      setResult(r);
      setAnalyzing(false);
    }, STEPS.length * 700 + 300);
  };

  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setPreview(null);
    setCapturedFile(null);
    setResult(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
          <CameraIcon size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('dashboard.liveImage')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Capture an image using your camera.</p>
        </div>
      </div>

      {!cameraActive && !preview && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 sm:p-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
            <CameraIcon size={40} className="text-white" />
          </div>
          <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">Camera is ready</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Click below to open your camera and capture an image for analysis.</p>
          <button
            onClick={startCamera}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-medium hover:shadow-lg hover:shadow-teal-500/30 transition-all inline-flex items-center gap-2"
          >
            <CameraIcon size={18} />
            {t('camera.open')}
          </button>
        </div>
      )}

      {cameraActive && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <button
            onClick={capture}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-medium hover:shadow-lg hover:shadow-teal-500/30 transition-all flex items-center justify-center gap-2"
          >
            <CameraIcon size={18} />
            {t('camera.capture')}
          </button>
        </div>
      )}

      {preview && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900">
            <img src={preview} alt="Captured" className="w-full max-h-96 object-contain" />
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={retake}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <RefreshCw size={16} />
              {t('camera.retake')}
            </button>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-medium hover:shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {analyzing ? 'Analyzing...' : t('common.analyze')}
              <CameraIcon size={18} />
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {analyzing && <LoadingState steps={STEPS} currentStep={step} />}

      {result && !analyzing && (
        <ResultCard
          result={result}
          analysisType="camera"
          language="en"
          onCheckAgain={retake}
        />
      )}
    </div>
  );
}
