"use client";

import { useCallback, useState } from "react";

import { useLanguage } from "@/contexts/language-context";
import { useT } from "@/hooks/use-t";
import { recognizeAppliance } from "@/lib/api";
import { base64ToFile, HeicConversionError, resizeImageToBase64 } from "@/lib/image";
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
  const { lang } = useLanguage();
  const t = useT();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [recognitionResult, setRecognitionResult] =
    useState<ImageRecognitionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(
    async (file: File) => {
      setError(null);
      setRecognitionResult(null);
      setIsProcessing(true);

      try {
        const base64 = await resizeImageToBase64(file);
        setCapturedImage(base64);

        const compressedFile = base64ToFile(base64);
        const result = await recognizeAppliance(compressedFile, lang);

        if (!result.success) {
          setError(result.error);
          setIsProcessing(false);
          return;
        }

        setRecognitionResult(result.data);
      } catch (err) {
        console.error("Image processing error:", err);
        if (err instanceof HeicConversionError) {
          setError(t.IMAGE_ERROR_HEIC);
        } else {
          setError(t.IMAGE_ERROR_PROCESSING);
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [lang, t]
  );

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
