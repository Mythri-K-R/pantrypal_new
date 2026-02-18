import { useRef, useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface DetectedDates {
  mfd?: string;
  exp?: string;
  rawText?: string;
}

interface UseDateScannerOptions {
  onDetected: (dates: DetectedDates) => void;
}

const DATE_PATTERNS = [
  /(?:MFG|MFD|Mfg|Mfd|Manufacturing|Mfg\.?\s*Date|Mfd\.?\s*Date|PKD|Packed)[\s:.\-]*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i,
  /(?:EXP|Exp|Expiry|Use\s*By|Best\s*Before|BB|Exp\.?\s*Date|Use\s*Before)[\s:.\-]*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i,
  /(?:MFG|MFD|Mfg|Mfd|Manufacturing|PKD|Packed)[\s:.\-]*(\d{1,2}[\s\-]\w{3,9}[\s\-]\d{2,4})/i,
  /(?:EXP|Exp|Expiry|Use\s*By|Best\s*Before|BB)[\s:.\-]*(\d{1,2}[\s\-]\w{3,9}[\s\-]\d{2,4})/i,
  /(?:MFG|MFD|PKD)[\s:.\-]*(\w{3,9}[\s\-]\d{2,4})/i,
  /(?:EXP|Expiry|BB|Use\s*By)[\s:.\-]*(\w{3,9}[\s\-]\d{2,4})/i,
];

function parseDate(str: string): string | null {
  // Try month name formats first (e.g. "12 Jan 2025", "Jan 2025")
  const monthNames: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    january: 0, february: 1, march: 2, april: 3, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
  };

  // "12 Jan 2025" or "Jan 2025"
  const monthNameMatch = str.match(/(\d{1,2})?\s*[-\s]?\s*([A-Za-z]{3,9})\s*[-\s]?\s*(\d{2,4})/);
  if (monthNameMatch) {
    const day = monthNameMatch[1] ? parseInt(monthNameMatch[1]) : 1;
    const monthKey = monthNameMatch[2].toLowerCase();
    let year = parseInt(monthNameMatch[3]);
    if (year < 100) year += 2000;
    const month = monthNames[monthKey];
    if (month !== undefined) {
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];
    }
  }

  // Numeric formats: DD/MM/YYYY, MM/DD/YYYY
  const parts = str.replace(/\//g, '-').split('-').map(s => s.trim()).filter(Boolean);
  if (parts.length === 3) {
    let [d, m, y] = parts.map(Number);
    if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
    if (y < 100) y += 2000;
    if (m > 12) [d, m] = [m, d];
    const date = new Date(y, m - 1, d);
    return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
  }

  return null;
}

export function useDateScanner({ onDetected }: UseDateScannerOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const workerRef = useRef<any>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveText, setLiveText] = useState('');
  const [detectedDates, setDetectedDates] = useState<DetectedDates>({});
  const { toast } = useToast();

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setScanning(false);
    setLiveText('');
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setLoading(true);
    setDetectedDates({});
    try {
      // Initialize Tesseract worker
      const Tesseract = await import('tesseract.js');
      const worker = await Tesseract.createWorker('eng');
      workerRef.current = worker;

      // Start camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setLoading(false);
      setScanning(true);

      // Process frames every 1.5 seconds
      intervalRef.current = setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2 || !workerRef.current) return;

        const canvas = canvasRef.current || document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);

        try {
          const { data: { text } } = await workerRef.current.recognize(canvas);
          setLiveText(text.trim());

          // Try to extract dates
          const found: DetectedDates = { rawText: text };
          for (let i = 0; i < DATE_PATTERNS.length; i++) {
            const match = text.match(DATE_PATTERNS[i]);
            if (match) {
              const parsed = parseDate(match[1]);
              if (parsed) {
                // Even indices = MFD patterns, odd indices = EXP patterns
                if (i % 2 === 0 && !found.mfd) found.mfd = parsed;
                if (i % 2 === 1 && !found.exp) found.exp = parsed;
              }
            }
          }

          if (found.mfd || found.exp) {
            setDetectedDates(found);
          }
        } catch { /* frame processing error, continue */ }
      }, 1500);
    } catch (e: any) {
      setError(e.message || 'Camera access denied');
      setLoading(false);
    }
  }, []);

  const confirm = useCallback(() => {
    onDetected(detectedDates);
    stop();
  }, [detectedDates, onDetected, stop]);

  useEffect(() => {
    return () => {
      stop();
      workerRef.current?.terminate();
    };
  }, [stop]);

  return { videoRef, canvasRef, scanning, loading, error, liveText, detectedDates, start, stop, confirm };
}
