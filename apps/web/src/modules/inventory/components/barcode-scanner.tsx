'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onError?: (error: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onError, isOpen, onClose }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<string>('barcode-scanner-' + Date.now());

  const stopScanner = useCallback(async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
      } catch {
        // Scanner may already be stopped
      }
      setIsScanning(false);
    }
  }, [isScanning]);

  const startScanner = useCallback(async () => {
    if (scannerRef.current || isScanning) return;

    try {
      const scanner = new Html5Qrcode(containerRef.current);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.777,
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanner();
          onClose();
        },
        undefined,
      );

      setIsScanning(true);
    } catch (err: any) {
      onError?.(err?.message || 'Failed to start camera');
    }
  }, [isScanning, onScan, onError, onClose, stopScanner]);

  useEffect(() => {
    if (isOpen) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
      scannerRef.current = null;
    };
  }, [isOpen, startScanner, stopScanner]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-surface-900">Scan Barcode</h3>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="text-surface-500 hover:text-surface-900 text-xl"
          >
            &times;
          </button>
        </div>
        <div
          id={containerRef.current}
          className="w-full rounded overflow-hidden"
        />
        <p className="text-sm text-surface-600 mt-3 text-center">
          Point the camera at a barcode to scan
        </p>
      </div>
    </div>
  );
}
