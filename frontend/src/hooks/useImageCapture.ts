"use client";

import { useCallback, useState } from "react";

import { recognizeAppliance } from "@/lib/api";
import { IMAGE_LABELS } from "@/lib/image-constants";
import { base64ToFile, resizeImageToBase64 } from "@/lib/image";
import type { ImageRecognitionResult } from "@/lib/types";

interface UseImageCaptureReturn {
  capturedImage: string | null;
  recognitionResult: ImageRecognitionResult | null;
  isProcessing: boolean;
  error: string | null;
  handleFileSelect: (file: File) => Promise<void>;
  clear: () => void;
}

export function useImageCapture(): UseImageCaptureReturn {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [recognitionResult, setRecognitionResult] =
    useState<ImageRecognitionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    setRecognitionResult(null);
    setIsProcessing(true);

    try {
      const base64 = await resizeImageToBase64(file);
      setCapturedImage(base64);

      const compressedFile = base64ToFile(base64);
      const result = await recognizeAppliance(compressedFile);

      if (!result.success) {
        setError(result.error);
        setIsProcessing(false);
        return;
      }

      setRecognitionResult(result.data);
    } catch {
      setError(IMAGE_LABELS.ERROR_PROCESSING);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const clear = useCallback(() => {
    setCapturedImage(null);
    setRecognitionResult(null);
    setIsProcessing(false);
    setError(null);
  }, []);

  return {
    capturedImage,
    recognitionResult,
    isProcessing,
    error,
    handleFileSelect,
    clear,
  };
}
