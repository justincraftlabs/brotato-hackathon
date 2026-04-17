"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bath,
  Bed,
  Camera,
  CookingPot,
  Loader2,
  Monitor,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Sofa,
  Sparkles,
} from "lucide-react";
import type { ComponentType } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { estimateAppliance } from "@/lib/api";
import { useT } from "@/hooks/use-t";
import { useImageCapture } from "@/hooks/useImageCapture";
import { cn } from "@/lib/cn";
import {
  ACCEPTED_CAMERA_TYPES,
  CONFIDENCE_LEVEL_HIGH,
  CONFIDENCE_LEVEL_MEDIUM,
  IMAGE_LABELS,
} from "@/lib/image-constants";
import {
  APPLIANCE_PRESETS,
  DEFAULT_DAILY_HOURS,
  DEFAULT_STANDBY_WATTAGE,
  SLIDER_MAX,
  SLIDER_MIN,
  SLIDER_STEP,
  type ApplianceType,
} from "@/lib/setup-constants";
import type { Appliance, Room, RoomType } from "@/lib/types";

import { ApplianceCard } from "./ApplianceCard";
import { VoiceInputButton } from "./VoiceInputButton";

interface ApplianceFormProps {
  rooms: Room[];
  appliancesByRoom: Record<string, Appliance[]>;
  onAddAppliance: (roomId: string, appliance: Omit<Appliance, "id" | "roomId" | "monthlyKwh" | "monthlyCost">) => void;
  onEditAppliance: (roomId: string, applianceId: string, updates: Omit<Appliance, "id" | "roomId" | "monthlyKwh" | "monthlyCost">) => void;
  onDeleteAppliance: (roomId: string, applianceId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const ICON_MAP: Record<RoomType, ComponentType<{ className?: string }>> = {
  bedroom: Bed,
  living_room: Sofa,
  kitchen: CookingPot,
  bathroom: Bath,
  office: Monitor,
  other: MoreHorizontal,
};

const FIRST_TAB_INDEX = 0;

interface FormState {
  name: string;
  type: ApplianceType;
  wattage: string;
  dailyUsageHours: number;
  standbyWattage: string;
  usageHabit: string;
}

const INITIAL_FORM_STATE: FormState = {
  name: "",
  type: "other",
  wattage: "",
  dailyUsageHours: DEFAULT_DAILY_HOURS,
  standbyWattage: "",
  usageHabit: "",
};

type ConfidenceLevel = "high" | "medium" | "low";

function getConfidenceLabel(confidence: ConfidenceLevel): string {
  if (confidence === CONFIDENCE_LEVEL_HIGH) return IMAGE_LABELS.CONFIDENCE_HIGH;
  if (confidence === CONFIDENCE_LEVEL_MEDIUM) return IMAGE_LABELS.CONFIDENCE_MEDIUM;
  return IMAGE_LABELS.CONFIDENCE_LOW;
}

function getConfidenceColor(confidence: ConfidenceLevel): string {
  if (confidence === CONFIDENCE_LEVEL_HIGH) return "bg-primary text-primary-foreground";
  if (confidence === CONFIDENCE_LEVEL_MEDIUM) return "bg-accent text-white";
  return "bg-destructive text-destructive-foreground";
}

export function ApplianceFormStep({
  rooms,
  appliancesByRoom,
  onAddAppliance,
  onEditAppliance,
  onDeleteAppliance,
  onNext,
  onBack,
}: ApplianceFormProps) {
  const t = useT();
  const APPLIANCE_TYPES = Object.keys(t.APPLIANCE_TYPE_LABELS) as ApplianceType[];

  const [activeTab, setActiveTab] = useState(rooms[FIRST_TAB_INDEX]?.id ?? "");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogRoomId, setDialogRoomId] = useState("");
  const [editingApplianceId, setEditingApplianceId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const {
    capturedImage,
    recognitionResult,
    isProcessing: isCapturing,
    error: captureError,
    handleFileSelect,
    clear: clearCapture,
  } = useImageCapture();

  useEffect(() => {
    if (!dialogOpen) {
      clearCapture();
    }
  }, [dialogOpen, clearCapture]);

  const allRoomsHaveAppliances = rooms.every(
    (room) => (appliancesByRoom[room.id]?.length ?? 0) > 0
  );

  const isEditMode = editingApplianceId !== null;

  function openAddDialog(roomId: string) {
    setDialogRoomId(roomId);
    setEditingApplianceId(null);
    setForm(INITIAL_FORM_STATE);
    setAiSuggestion(null);
    setDialogOpen(true);
  }

  function openEditDialog(roomId: string, appliance: Appliance) {
    setDialogRoomId(roomId);
    setEditingApplianceId(appliance.id);
    setForm({
      name: appliance.name,
      type: appliance.type as ApplianceType,
      wattage: String(appliance.wattage),
      dailyUsageHours: appliance.dailyUsageHours,
      standbyWattage: String(appliance.standbyWattage ?? ""),
      usageHabit: appliance.usageHabit ?? "",
    });
    setAiSuggestion(null);
    setDialogOpen(true);
  }

  function handlePreset(preset: typeof APPLIANCE_PRESETS[number]) {
    setForm({
      ...form,
      name: preset.name,
      type: preset.type,
      wattage: String(preset.wattage),
      dailyUsageHours: preset.dailyHours,
    });
    setAiSuggestion(null);
  }

  const handleNameBlur = useCallback(async () => {
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setIsEstimating(true);
    const result = await estimateAppliance(trimmedName);
    setIsEstimating(false);

    if (!result.success) {
      return;
    }

    const estimate = result.data;
    setAiSuggestion(`${estimate.estimatedWattage}W`);

    setForm((prev) => ({
      ...prev,
      ...(prev.wattage
        ? {}
        : {
            wattage: String(estimate.estimatedWattage),
            type: (APPLIANCE_TYPES.includes(estimate.type as ApplianceType)
              ? estimate.type
              : "other") as ApplianceType,
          }),
      ...(prev.usageHabit || !estimate.suggestedUsageHabit
        ? {}
        : { usageHabit: estimate.suggestedUsageHabit }),
    }));
  }, [form.name, APPLIANCE_TYPES]);

  function handleCameraFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const firstFileIndex = 0;
    const file = e.target.files?.[firstFileIndex];
    if (!file) {
      return;
    }
    handleFileSelect(file);
    e.target.value = "";
  }

  async function handleUseDetectedResult() {
    if (!recognitionResult) {
      return;
    }

    const applianceType = APPLIANCE_TYPES.includes(recognitionResult.type as ApplianceType)
      ? (recognitionResult.type as ApplianceType)
      : "other";

    setForm((prev) => ({
      ...prev,
      name: recognitionResult.name,
      type: applianceType,
      wattage: String(recognitionResult.estimatedWattage),
      standbyWattage: String(recognitionResult.estimatedStandbyWattage),
    }));

    setIsEstimating(true);
    const estimate = await estimateAppliance(recognitionResult.name);
    setIsEstimating(false);

    if (estimate.success) {
      setAiSuggestion(`${estimate.data.estimatedWattage}W`);
      setForm((prev) => ({
        ...prev,
        ...(prev.usageHabit || !estimate.data.suggestedUsageHabit
          ? {}
          : { usageHabit: estimate.data.suggestedUsageHabit }),
      }));
    }

    clearCapture();
  }

  function handleRetryCapture() {
    clearCapture();
    cameraInputRef.current?.click();
  }

  function handleSave() {
    const wattageNum = Number(form.wattage);
    if (!form.name.trim() || !wattageNum || wattageNum <= 0) {
      return;
    }

    const applianceData = {
      name: form.name.trim(),
      type: form.type,
      wattage: wattageNum,
      dailyUsageHours: form.dailyUsageHours,
      standbyWattage: Number(form.standbyWattage) || DEFAULT_STANDBY_WATTAGE,
      usageHabit: form.usageHabit.trim(),
    };

    if (isEditMode && editingApplianceId) {
      onEditAppliance(dialogRoomId, editingApplianceId, applianceData);
    } else {
      onAddAppliance(dialogRoomId, applianceData);
    }

    setDialogOpen(false);
    setForm(INITIAL_FORM_STATE);
    setAiSuggestion(null);
    setEditingApplianceId(null);
  }

  const isFormValid =
    form.name.trim().length > 0 &&
    Number(form.wattage) > 0;

  const showCaptureCard = capturedImage || isCapturing || recognitionResult || captureError;

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-full overflow-x-auto">
          {rooms.map((room) => {
            const Icon = ICON_MAP[room.type];
            const applianceCount = appliancesByRoom[room.id]?.length ?? 0;
            return (
              <TabsTrigger
                key={room.id}
                value={room.id}
                className="flex items-center gap-1.5 whitespace-nowrap"
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{t.ROOM_TYPE_LABELS[room.type]}</span>
                {applianceCount > 0 && (
                  <Badge variant="secondary" className="h-4 min-w-4 px-1 text-[10px]">
                    {applianceCount}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {rooms.map((room) => {
          const roomAppliances = appliancesByRoom[room.id] ?? [];
          return (
            <TabsContent key={room.id} value={room.id}>
              <div className="flex flex-col gap-3 pt-2">
                {roomAppliances.length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    {t.LABEL_NO_APPLIANCE_WARNING}
                  </p>
                )}

                {roomAppliances.map((appliance) => (
                  <ApplianceCard
                    key={appliance.id}
                    appliance={appliance}
                    onDelete={(applianceId) =>
                      onDeleteAppliance(room.id, applianceId)
                    }
                    onEdit={(a) => openEditDialog(room.id, a)}
                  />
                ))}

                <Button
                  variant="outline"
                  className="h-12 w-full border-dashed"
                  onClick={() => openAddDialog(room.id)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t.BUTTON_ADD_APPLIANCE}
                </Button>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? t.BUTTON_EDIT_APPLIANCE : t.BUTTON_ADD_APPLIANCE}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {isEditMode ? t.BUTTON_EDIT_APPLIANCE : t.BUTTON_ADD_APPLIANCE}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {!isEditMode && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  {t.LABEL_QUICK_ADD}
                </p>
                <div className="flex flex-wrap gap-2">
                  {APPLIANCE_PRESETS.map((preset) => (
                    <Badge
                      key={preset.name}
                      variant="outline"
                      className="cursor-pointer px-3 py-1.5 text-xs hover:bg-primary hover:text-primary-foreground"
                      onClick={() => handlePreset(preset)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key !== "Enter" && e.key !== " ") {
                          return;
                        }
                        e.preventDefault();
                        handlePreset(preset);
                      }}
                    >
                      {preset.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="appliance-name">{t.LABEL_NAME}</Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    id="appliance-name"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    onBlur={handleNameBlur}
                    placeholder="VD: Điều hòa Daikin"
                  />
                  {isEstimating && (
                    <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                <VoiceInputButton
                  onTranscript={(text) => {
                    setForm((prev) => ({ ...prev, name: text }));
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={() => cameraInputRef.current?.click()}
                  aria-label={IMAGE_LABELS.CAMERA_BUTTON}
                >
                  <Camera className="h-4 w-4 text-primary" />
                </Button>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept={ACCEPTED_CAMERA_TYPES}
                  capture="environment"
                  onChange={handleCameraFileChange}
                  className="hidden"
                  aria-hidden="true"
                />
              </div>

              {showCaptureCard && (
                <Card>
                  <CardContent className="flex flex-col gap-3 p-3">
                    {capturedImage && (
                      <div className="relative overflow-hidden rounded-md">
                        {/* eslint-disable-next-line @next/next/no-img-element -- base64 data URL */}
                        <img
                          src={`data:image/jpeg;base64,${capturedImage}`}
                          alt="Captured appliance"
                          className="h-32 w-full object-cover"
                        />
                        {isCapturing && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <span className="ml-2 text-xs text-white">
                              {IMAGE_LABELS.PROCESSING}
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
                            {getConfidenceLabel(recognitionResult.confidence)}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span>
                            {recognitionResult.estimatedWattage}
                            {IMAGE_LABELS.WATTAGE_SUFFIX}
                          </span>
                          {recognitionResult.brand && (
                            <span>
                              {IMAGE_LABELS.BRAND_LABEL}: {recognitionResult.brand}
                            </span>
                          )}
                          {recognitionResult.model && (
                            <span>
                              {IMAGE_LABELS.MODEL_LABEL}: {recognitionResult.model}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={handleRetryCapture}
                          >
                            <RotateCcw className="mr-1 h-3 w-3" />
                            {IMAGE_LABELS.RETRY}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={handleUseDetectedResult}
                          >
                            {IMAGE_LABELS.USE_RESULT}
                          </Button>
                        </div>
                      </div>
                    )}

                    {captureError && !recognitionResult && (
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-xs text-destructive">{captureError}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleRetryCapture}
                        >
                          <RotateCcw className="mr-1 h-3 w-3" />
                          {IMAGE_LABELS.RETRY}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {aiSuggestion && (
                <p className="flex items-center gap-1 text-xs text-accent">
                  <Sparkles className="h-3 w-3" />
                  {t.LABEL_AI_SUGGESTION_PREFIX} {aiSuggestion}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="appliance-type">{t.LABEL_TYPE}</Label>
              <Select
                value={form.type}
                onValueChange={(val) =>
                  setForm({ ...form, type: val as ApplianceType })
                }
              >
                <SelectTrigger id="appliance-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPLIANCE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t.APPLIANCE_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="appliance-wattage">{t.LABEL_WATTAGE}</Label>
              <Input
                id="appliance-wattage"
                type="number"
                min={1}
                value={form.wattage}
                onChange={(e) =>
                  setForm({ ...form, wattage: e.target.value })
                }
                placeholder="1500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>
                {t.LABEL_DAILY_HOURS}:{" "}
                <span className="font-semibold text-primary">
                  {form.dailyUsageHours} {t.LABEL_HOURS_SUFFIX}
                </span>
              </Label>
              <Slider
                min={SLIDER_MIN}
                max={SLIDER_MAX}
                step={SLIDER_STEP}
                value={[form.dailyUsageHours]}
                onValueChange={([val]) =>
                  setForm({ ...form, dailyUsageHours: val })
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="appliance-standby">
                {t.LABEL_STANDBY_WATTAGE}
              </Label>
              <Input
                id="appliance-standby"
                type="number"
                min={0}
                value={form.standbyWattage}
                onChange={(e) =>
                  setForm({ ...form, standbyWattage: e.target.value })
                }
                placeholder="0"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="appliance-habit">{t.LABEL_USAGE_HABIT}</Label>
              <Input
                id="appliance-habit"
                value={form.usageHabit}
                onChange={(e) =>
                  setForm({ ...form, usageHabit: e.target.value })
                }
                placeholder="VD: Bật từ 9h tối đến 6h sáng"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDialogOpen(false)}
              >
                {t.BUTTON_CANCEL}
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!isFormValid}
                onClick={handleSave}
              >
                {t.BUTTON_SAVE}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="fixed bottom-20 left-0 right-0 z-40 px-4">
        <div className="mx-auto flex max-w-lg gap-3">
          <Button
            variant="outline"
            className="h-12 flex-1"
            onClick={onBack}
          >
            {t.BUTTON_BACK}
          </Button>
          <Button
            className="h-12 flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!allRoomsHaveAppliances}
            onClick={onNext}
          >
            {t.BUTTON_NEXT}
          </Button>
        </div>
      </div>
    </div>
  );
}
