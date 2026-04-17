"use client";

import { Camera, Loader2, RotateCcw } from "lucide-react";
import { useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { useT } from "@/hooks/use-t";
import { useImageCapture } from "@/hooks/useImageCapture";
import {
  ACCEPTED_CAMERA_TYPES,
  CONFIDENCE_LEVEL_HIGH,
  CONFIDENCE_LEVEL_MEDIUM,
} from "@/lib/image-constants";
import type { Translations } from "@/lib/translations";
import type { ImageRecognitionResult } from "@/lib/types";

interface ImageCaptureButtonProps {
  onResult: (result: ImageRecognitionResult) => void;
  className?: string;
}

type ConfidenceLevel = ImageRecognitionResult["confidence"];

function getConfidenceLabel(confidence: ConfidenceLevel, t: Translations): string {
  if (confidence === CONFIDENCE_LEVEL_HIGH) {
    return t.IMAGE_CONFIDENCE_HIGH;
  }
  if (confidence === CONFIDENCE_LEVEL_MEDIUM) {
    return t.IMAGE_CONFIDENCE_MEDIUM;
  }
  return t.IMAGE_CONFIDENCE_LOW;
}

function getConfidenceColor(confidence: ConfidenceLevel): string {
  if (confidence === CONFIDENCE_LEVEL_HIGH) {
    return "bg-primary text-primary-foreground";
  }
  if (confidence === CONFIDENCE_LEVEL_MEDIUM) {
    return "bg-accent text-white";
  }
  return "bg-destructive text-destructive-foreground";
}

const WATTAGE_SUFFIX = "W";

export function ImageCaptureButton({
  onResult,
  className,
}: ImageCaptureButtonProps) {
  const t = useT();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    capturedImage,
    recognitionResult,
    isProcessing,
    error,
    handleFileSelect,
    clear,
  } = useImageCapture();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const firstFileIndex = 0;
    const file = e.target.files?.[firstFileIndex];
    if (!file) {
      return;
    }
    handleFileSelect(file);
    e.target.value = "";
  }

  function handleUseResult() {
    if (!recognitionResult) {
      return;
    }
    onResult(recognitionResult);
    clear();
  }

  function handleRetry() {
    clear();
    fileInputRef.current?.click();
  }

  if (capturedImage || isProcessing || recognitionResult || error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex flex-col gap-3 p-3">
          {capturedImage && (
            <div className="relative overflow-hidden rounded-md">
              {/* eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image cannot optimize */}
              <img
                src={`data:image/jpeg;base64,${capturedImage}`}
                alt="Captured appliance"
                className="h-32 w-full object-cover"
              />
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-xs text-white">
                    {t.IMAGE_PROCESSING}
                  </span>
                </div>
              )}
            </div>
          )}

          {recognitionResult && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">
                  {recognitionResult.name}
                </span>
                <Badge
                  className={cn(
                    "text-[10px]",
                    getConfidenceColor(recognitionResult.confidence)
                  )}
                >
                  {getConfidenceLabel(recognitionResult.confidence, t)}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>
                  {recognitionResult.estimatedWattage}
                  {WATTAGE_SUFFIX}
                </span>
                {recognitionResult.brand && (
                  <span>
                    {t.IMAGE_BRAND_LABEL}: {recognitionResult.brand}
                  </span>
                )}
                {recognitionResult.model && (
                  <span>
                    {t.IMAGE_MODEL_LABEL}: {recognitionResult.model}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleRetry}
                >
                  <RotateCcw className="mr-1 h-3 w-3" />
                  {t.IMAGE_RETRY}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleUseResult}
                >
                  {t.IMAGE_USE_RESULT}
                </Button>
              </div>
            </div>
          )}

          {error && !recognitionResult && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-destructive">{error}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRetry}
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                {t.IMAGE_RETRY}
              </Button>
            </div>
          )}
        </CardContent>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_CAMERA_TYPES}
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
        />
      </Card>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        className={cn("shrink-0", className)}
        aria-label={t.IMAGE_CAMERA_BUTTON}
      >
        <Camera className="h-4 w-4 text-primary" />
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_CAMERA_TYPES}
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />
    </>
  );
}
