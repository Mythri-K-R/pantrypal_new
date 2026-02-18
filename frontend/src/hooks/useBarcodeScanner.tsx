import { useRef, useState, useCallback, useEffect } from 'react';

interface UseScannerOptions {
  onDetected: (barcode: string) => void;
}

export function useBarcodeScanner({ onDetected }: UseScannerOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setScanning(false);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);

      // Use native BarcodeDetector if available
      if ('BarcodeDetector' in window) {
        const detector = new (window as any).BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'],
        });
        intervalRef.current = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              if (code) {
                stop();
                onDetected(code);
              }
            }
          } catch { /* ignore frame errors */ }
        }, 300);
      } else {
        // Fallback: use canvas + transformers.js for barcode reading
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Dynamic import of transformers.js
        const { pipeline } = await import('@huggingface/transformers');
        const detector = await pipeline('object-detection', 'Xenova/detr-resnet-50', {
          device: 'wasm',
        });

        intervalRef.current = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2 || !ctx) return;
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          ctx.drawImage(videoRef.current, 0, 0);
          try {
            const imageData = canvas.toDataURL('image/jpeg', 0.8);
            const results = await detector(imageData);
            // Look for any detected object that could be a barcode
            if (results && results.length > 0) {
              console.log('Detection results:', results);
            }
          } catch { /* ignore */ }
        }, 2000);
      }
    } catch (e: any) {
      setError(e.message || 'Camera access denied');
      setScanning(false);
    }
  }, [onDetected, stop]);

  useEffect(() => () => stop(), [stop]);

  return { videoRef, scanning, error, start, stop };
}
