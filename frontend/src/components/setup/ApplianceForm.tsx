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
import { analyzeHabit, estimateAppliance } from "@/lib/api";
import type { HabitAnalysis } from "@/lib/types";
import { useT } from "@/hooks/use-t";
import { useLanguage } from "@/contexts/language-context";
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

interface ApplianceFormProps {
  rooms: Room[];
  appliancesByRoom: Record<string, Appliance[]>;
  onAddAppliance: (roomId: string, appliance: Omit<Appliance, "id" | "roomId" | "monthlyKwh" | "monthlyCost">) => Promise<void> | void;
  onEditAppliance: (roomId: string, applianceId: string, updates: Omit<Appliance, "id" | "roomId" | "monthlyKwh" | "monthlyCost">) => Promise<void> | void;
  onDeleteAppliance: (roomId: string, applianceId: string) => void;
  onNext: () => void;
  onBack: () => void;
  hideNavigation?: boolean;
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
  hideNavigation = false,
}: ApplianceFormProps) {
  const t = useT();
  const { lang } = useLanguage();
  const APPLIANCE_TYPES = Object.keys(t.APPLIANCE_TYPE_LABELS) as ApplianceType[];

  const [activeTab, setActiveTab] = useState(rooms[FIRST_TAB_INDEX]?.id ?? "");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogRoomId, setDialogRoomId] = useState("");
  const [editingApplianceId, setEditingApplianceId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [habitAnalysis, setHabitAnalysis] = useState<HabitAnalysis | null>(null);
  const [isFetchingHabit, setIsFetchingHabit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isUsingResult, setIsUsingResult] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const habitDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const originalNameRef = useRef<string>("");

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
    setHabitAnalysis(null);
    originalNameRef.current = "";
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
    setHabitAnalysis(null);
    originalNameRef.current = appliance.name;
    fetchHabitAnalysis(appliance.name, appliance.type, appliance.usageHabit ?? "", appliance.dailyUsageHours);
    setDialogOpen(true);
  }

  function handlePreset(preset: typeof APPLIANCE_PRESETS[number]) {
    setForm({
      ...form,
      name: preset.name[lang],
      type: preset.type,
      wattage: String(preset.wattage),
      dailyUsageHours: preset.dailyHours,
    });
    setAiSuggestion(null);
    setHabitAnalysis(null);
  }

  const fetchHabitAnalysis = useCallback(
    async (name: string, type: string, habit: string, hours: number) => {
      if (!name.trim()) return;
      if (habitDebounceRef.current) clearTimeout(habitDebounceRef.current);

      habitDebounceRef.current = setTimeout(async () => {
        setIsFetchingHabit(true);
        const result = await analyzeHabit(name, type, habit, hours);
        setIsFetchingHabit(false);
        if (result.success) {
          setHabitAnalysis(result.data);
        }
      }, 300);
    },
    []
  );

  const handleHabitBlur = useCallback(() => {
    fetchHabitAnalysis(form.name, form.type, form.usageHabit, form.dailyUsageHours);
  }, [form.name, form.type, form.usageHabit, form.dailyUsageHours, fetchHabitAnalysis]);

  const handleSelectSuggestion = useCallback(
    (suggestion: string) => {
      setForm((prev) => ({ ...prev, usageHabit: suggestion }));
      fetchHabitAnalysis(form.name, form.type, suggestion, form.dailyUsageHours);
    },
    [form.name, form.type, form.dailyUsageHours, fetchHabitAnalysis]
  );

  const handleTypeChange = useCallback(
    (val: string) => {
      setForm((prev) => ({ ...prev, type: val as ApplianceType }));
      setHabitAnalysis(null);
      fetchHabitAnalysis(form.name, val, form.usageHabit, form.dailyUsageHours);
    },
    [form.name, form.usageHabit, form.dailyUsageHours, fetchHabitAnalysis]
  );

  const handleNameBlur = useCallback(async () => {
    const trimmedName = form.name.trim();
    if (!trimmedName) return;
    // Skip re-estimation if name hasn't changed from when the dialog was opened
    if (trimmedName === originalNameRef.current) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setIsEstimating(true);
    const result = await estimateAppliance(trimmedName);
    setIsEstimating(false);

    if (!result.success) return;

    const estimate = result.data;
    setAiSuggestion(`${estimate.estimatedWattage}W`);

    const resolvedHabit = form.usageHabit || estimate.suggestedUsageHabit || "";
    const resolvedType = (APPLIANCE_TYPES.includes(estimate.type as ApplianceType)
      ? estimate.type
      : "other") as ApplianceType;

    setForm((prev) => ({
      ...prev,
      ...(prev.wattage
        ? {}
        : { wattage: String(estimate.estimatedWattage), type: resolvedType }),
      ...(prev.usageHabit || !estimate.suggestedUsageHabit
        ? {}
        : { usageHabit: estimate.suggestedUsageHabit }),
    }));

    // Always show habit analysis after name estimation
    fetchHabitAnalysis(trimmedName, resolvedType, resolvedHabit, form.dailyUsageHours);
  }, [form.name, form.usageHabit, form.type, form.dailyUsageHours, APPLIANCE_TYPES, fetchHabitAnalysis]);

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
    if (!recognitionResult || isUsingResult) {
      return;
    }

    setIsUsingResult(true);

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

    let resolvedHabit = form.usageHabit;
    if (estimate.success) {
      setAiSuggestion(`${estimate.data.estimatedWattage}W`);
      const suggestedHabit = estimate.data.suggestedUsageHabit;
      if (!form.usageHabit && suggestedHabit) {
        resolvedHabit = suggestedHabit;
        setForm((prev) => ({ ...prev, usageHabit: suggestedHabit }));
      }
    }

    fetchHabitAnalysis(recognitionResult.name, applianceType, resolvedHabit, form.dailyUsageHours);

    // Mark name as "original" so blur after this doesn't trigger re-estimation
    originalNameRef.current = recognitionResult.name;
    clearCapture();
    setIsUsingResult(false);
  }

  function handleRetryCapture() {
    clearCapture();
    cameraInputRef.current?.click();
  }

  async function handleSave() {
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

    setIsSaving(true);
    setSaveError(null);
    try {
      if (isEditMode && editingApplianceId) {
        await onEditAppliance(dialogRoomId, editingApplianceId, applianceData);
      } else {
        await onAddAppliance(dialogRoomId, applianceData);
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : t.SETUP_ERROR);
      return;
    } finally {
      setIsSaving(false);
    }

    setDialogOpen(false);
    setForm(INITIAL_FORM_STATE);
    setSaveError(null);
    setAiSuggestion(null);
    setHabitAnalysis(null);
    setEditingApplianceId(null);
  }

  const isFormValid =
    form.name.trim().length > 0 &&
    Number(form.wattage) > 0;

  const showCaptureCard = capturedImage || isCapturing || recognitionResult || captureError;

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={cn("flex w-full overflow-x-auto", rooms.length <= 1 && "hidden")}>
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
              <div className="flex flex-col gap-2 pt-2">
                {roomAppliances.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    {t.LABEL_NO_APPLIANCE_WARNING}
                  </p>
                )}

                {roomAppliances.length > 0 && (
                  <>
                    {/* Desktop table header */}
                    <div className="hidden md:grid md:grid-cols-[1fr_72px_88px_100px_116px_72px] items-center gap-3 border-b border-border/30 px-4 pb-2 text-xs font-medium text-muted-foreground/60">
                      <span>{t.LABEL_APPLIANCE}</span>
                      <span>{t.LABEL_WATTAGE_SHORT}</span>
                      <span>{t.LABEL_HOURS_PER_DAY}</span>
                      <span>{t.LABEL_MONTHLY_KWH}</span>
                      <span>{t.LABEL_MONTHLY_COST}</span>
                      <span />
                    </div>

                    <div className="flex flex-col gap-2">
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
                    </div>
                  </>
                )}

                {/* Add button: full-width dashed on mobile, compact on desktop */}
                <div className="flex items-center justify-between pt-1">
                  <Button
                    variant="outline"
                    className="h-10 w-full border-dashed md:hidden"
                    onClick={() => openAddDialog(room.id)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t.BUTTON_ADD_APPLIANCE}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden gap-1.5 md:flex"
                    onClick={() => openAddDialog(room.id)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {t.BUTTON_ADD_APPLIANCE}
                  </Button>
                </div>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* ── Add / Edit Appliance Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!isSaving) { setDialogOpen(v); if (!v) setSaveError(null); } }}>
        {/* p-0: remove default padding so we can control header/body/footer separately */}
        <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-lg md:max-w-2xl">

          {/* Sticky header */}
          <div className="shrink-0 border-b border-border/40 px-5 pb-4 pt-5">
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? t.BUTTON_EDIT_APPLIANCE : t.BUTTON_ADD_APPLIANCE}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {isEditMode ? t.BUTTON_EDIT_APPLIANCE : t.BUTTON_ADD_APPLIANCE}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable body */}
          <div className="flex flex-1 flex-col overflow-y-auto">

            {/* Quick-add presets — full width, above the 2-col grid (add mode only) */}
            {!isEditMode && (
              <div className="border-b border-border/30 px-5 py-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  {t.LABEL_QUICK_ADD}
                </p>
                <div className="flex flex-wrap gap-2">
                  {APPLIANCE_PRESETS.map((preset) => (
                    <Badge
                      key={preset.name.vi}
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
                      {preset.name[lang]}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Desktop: 2-column grid | Mobile: single column */}
            <div className="md:grid md:grid-cols-2 md:divide-x md:divide-border/30">

              {/* ── Left column: identity & specs ── */}
              <div className="flex flex-col gap-4 px-5 py-4">

                {/* Name + camera */}
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
                        placeholder={t.PLACEHOLDER_APPLIANCE_NAME}
                      />
                      {isEstimating && (
                        <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
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

                  {/* Image capture result card */}
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
                                disabled={isUsingResult}
                              >
                                <RotateCcw className="mr-1 h-3 w-3" />
                                {IMAGE_LABELS.RETRY}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                                onClick={handleUseDetectedResult}
                                disabled={isUsingResult}
                              >
                                {isUsingResult ? (
                                  <>
                                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                    {IMAGE_LABELS.PROCESSING}
                                  </>
                                ) : (
                                  IMAGE_LABELS.USE_RESULT
                                )}
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

                {/* Type */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="appliance-type">{t.LABEL_TYPE}</Label>
                  <Select value={form.type} onValueChange={handleTypeChange}>
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

                {/* Wattage + Standby side-by-side */}
                <div className="grid grid-cols-2 gap-3">
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
                    <Label htmlFor="appliance-standby">{t.LABEL_STANDBY_WATTAGE}</Label>
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
                </div>

              </div>

              {/* ── Right column: usage patterns ── */}
              <div className="flex flex-col gap-4 px-5 py-4">

                {/* Daily hours */}
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

                {/* Usage habit */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="appliance-habit">{t.LABEL_USAGE_HABIT}</Label>
                  <div className="relative">
                    <Input
                      id="appliance-habit"
                      value={form.usageHabit}
                      onChange={(e) =>
                        setForm({ ...form, usageHabit: e.target.value })
                      }
                      onBlur={handleHabitBlur}
                      placeholder={t.PLACEHOLDER_USAGE_HABIT}
                      className="pr-8"
                    />
                    {isFetchingHabit && (
                      <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>

                  {/* Smart suggestion chips */}
                  {habitAnalysis && habitAnalysis.habit_suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {habitAnalysis.habit_suggestions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleSelectSuggestion(s)}
                          className={cn(
                            "rounded-full border px-2.5 py-0.5 text-[11px] transition-colors",
                            form.usageHabit === s
                              ? "border-primary bg-primary/15 text-primary font-medium"
                              : "border-border text-muted-foreground hover:border-primary/50 hover:bg-primary/8 hover:text-primary"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Analysis result card */}
                  {habitAnalysis && habitAnalysis.analysis_summary && (
                    <div className="glass rounded-xl p-3 text-xs">
                      <p className="flex items-start gap-1 text-muted-foreground leading-relaxed">
                        <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                        {habitAnalysis.analysis_summary}
                      </p>
                      {habitAnalysis.carbon_impact_note && (
                        <p className="mt-1.5 text-muted-foreground/80">
                          🌱 {habitAnalysis.carbon_impact_note}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            dailyUsageHours: habitAnalysis.calculated_average_hours,
                          }))
                        }
                        className="mt-2 rounded-lg bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/25 transition-colors"
                      >
                        Áp dụng {habitAnalysis.calculated_average_hours.toFixed(1)}h
                      </button>
                    </div>
                  )}
                </div>

              </div>
              {/* end right column */}

            </div>
            {/* end 2-col grid */}

          </div>

          {/* Sticky footer */}
          <div className="shrink-0 border-t border-border/40 px-5 pb-5 pt-4">
            {saveError && (
              <p className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {saveError}
              </p>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={isSaving}
                onClick={() => setDialogOpen(false)}
              >
                {t.BUTTON_CANCEL}
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!isFormValid || isSaving}
                onClick={handleSave}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.SETUP_LOADING}
                  </>
                ) : (
                  t.BUTTON_SAVE
                )}
              </Button>
            </div>
          </div>

        </DialogContent>
      </Dialog>

      {!hideNavigation && (
        <div className="fixed bottom-20 left-0 right-0 z-40 px-4 lg:left-[var(--sidebar-width)]">
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
      )}
    </div>
  );
}
