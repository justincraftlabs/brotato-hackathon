"use client";

import {
  ArrowLeft,
  Bath,
  Bed,
  CookingPot,
  Loader2,
  Monitor,
  MoreHorizontal,
  Pencil,
  Plus,
  Sofa,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { ComponentType } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/hooks/use-t";
import {
  addAppliances,
  addRoom as apiAddRoom,
  deleteAppliance,
  deleteRoom as apiDeleteRoom,
  getHome,
  updateAppliance,
  updateRoom as apiUpdateRoom,
} from "@/lib/api";
import { CO2_EMISSION_FACTOR } from "@/lib/constants";
import { formatKwh } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Appliance, Home, RoomSize, RoomType, RoomWithAppliances } from "@/lib/types";
import type { Translations } from "@/lib/translations";

import { ApplianceFormStep } from "./ApplianceForm";

const ICON_MAP: Record<RoomType, ComponentType<{ className?: string }>> = {
  bedroom: Bed,
  living_room: Sofa,
  kitchen: CookingPot,
  bathroom: Bath,
  office: Monitor,
  other: MoreHorizontal,
};

const DEFAULT_ROOM_SIZE: RoomSize = "medium";
const HOURS_PER_DAY = 24;
const DAYS_PER_MONTH = 30;

function calcRoomStats(room: RoomWithAppliances) {
  const totalKwh = room.appliances.reduce((sum, a) => sum + a.monthlyKwh, 0);
  const totalCo2Kg = totalKwh * CO2_EMISSION_FACTOR;
  const totalStandbyKwh = room.appliances.reduce(
    (sum, a) => sum + (a.standbyWattage / 1000) * HOURS_PER_DAY * DAYS_PER_MONTH,
    0
  );
  return { totalKwh, totalCo2Kg, totalStandbyKwh };
}

type EditState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "room-list"; home: Home }
  | { status: "room-detail"; home: Home; roomId: string };

interface EditModeViewProps {
  homeId: string;
}

interface RoomCardProps {
  room: RoomWithAppliances;
  onSelect: (roomId: string) => void;
  onEdit: (room: RoomWithAppliances) => void;
  onDelete: (roomId: string) => void;
  t: Translations;
}

function RoomCard({ room, onSelect, onEdit, onDelete, t }: RoomCardProps) {
  const Icon = ICON_MAP[room.type];
  const { totalKwh, totalCo2Kg, totalStandbyKwh } = calcRoomStats(room);
  const hasAppliances = room.appliances.length > 0;

  const actionButtons = (
    <div className="flex shrink-0 items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
        onClick={(e) => { e.stopPropagation(); onEdit(room); }}
        aria-label={t.SETUP_EDIT_ROOM}
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
        onClick={(e) => { e.stopPropagation(); onDelete(room.id); }}
        aria-label={t.LABEL_DELETE}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );

  return (
    <div
      className="glass rounded-xl cursor-pointer transition-colors hover:border-primary/40 card-hover-glow"
      onClick={() => onSelect(room.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        onSelect(room.id);
      }}
    >
      {/* Desktop: table row */}
      <div className="hidden md:grid md:grid-cols-[1fr_110px_80px_106px_80px_96px_72px] items-center gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <span className="truncate text-sm font-semibold">{room.name}</span>
        </div>
        <span className="text-sm text-muted-foreground">{t.ROOM_SIZE_LABELS[room.size]}</span>
        <span className="text-sm text-muted-foreground">
          {room.appliances.length} {t.SETUP_APPLIANCE_COUNT}
        </span>
        <span className={cn("text-sm font-semibold", hasAppliances ? "text-primary" : "text-muted-foreground/30")}>
          {hasAppliances ? formatKwh(totalKwh) : "—"}
        </span>
        <span className={cn("text-sm", hasAppliances ? "text-muted-foreground" : "text-muted-foreground/30")}>
          {hasAppliances ? `${totalCo2Kg.toFixed(1)} kg` : "—"}
        </span>
        <span className={cn("text-sm", hasAppliances && totalStandbyKwh > 0 ? "text-amber-500" : "text-muted-foreground/30")}>
          {hasAppliances && totalStandbyKwh > 0 ? formatKwh(totalStandbyKwh) : "—"}
        </span>
        {actionButtons}
      </div>

      {/* Mobile: card */}
      <div className="p-4 md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-semibold">{room.name}</p>
              <p className="text-xs text-muted-foreground">
                {room.appliances.length} {t.SETUP_APPLIANCE_COUNT} · {t.ROOM_SIZE_LABELS[room.size]}
              </p>
            </div>
          </div>
          {actionButtons}
        </div>

        {hasAppliances && (
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border/30 pt-3">
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground">{t.LABEL_MONTHLY_ELECTRICITY}</span>
              <span className="text-xs font-semibold text-primary">{formatKwh(totalKwh)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground">CO₂</span>
              <span className="text-xs font-semibold">{totalCo2Kg.toFixed(1)} kg</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground">{t.LABEL_STANDBY_POWER}</span>
              <span className="text-xs font-semibold text-amber-500">{formatKwh(totalStandbyKwh)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface AddRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddRoom: (type: RoomType, size: RoomSize) => void;
  t: Translations;
}

function AddRoomDialog({ open, onOpenChange, onAddRoom, t }: AddRoomDialogProps) {
  const ROOM_TYPES = Object.keys(t.ROOM_TYPE_LABELS) as RoomType[];
  const ROOM_SIZES = Object.keys(t.ROOM_SIZE_LABELS) as RoomSize[];
  const [selectedType, setSelectedType] = useState<RoomType | null>(null);
  const [selectedSize, setSelectedSize] = useState<RoomSize>(DEFAULT_ROOM_SIZE);

  function handleConfirm() {
    if (!selectedType) {
      return;
    }
    onAddRoom(selectedType, selectedSize);
    setSelectedType(null);
    setSelectedSize(DEFAULT_ROOM_SIZE);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setSelectedType(null);
      setSelectedSize(DEFAULT_ROOM_SIZE);
    }
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.SETUP_ADD_ROOM}</DialogTitle>
          <DialogDescription className="sr-only">
            {t.LABEL_SELECT_ROOMS}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            {t.LABEL_SELECT_ROOMS}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {ROOM_TYPES.map((type) => {
              const Icon = ICON_MAP[type];
              const isSelected = selectedType === type;

              return (
                <Card
                  key={type}
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary/50",
                    isSelected && "border-primary"
                  )}
                  onClick={() => setSelectedType(type)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" && e.key !== " ") {
                      return;
                    }
                    e.preventDefault();
                    setSelectedType(type);
                  }}
                >
                  <CardContent className="flex flex-col items-center gap-2 p-4">
                    <Icon className="h-8 w-8 text-primary" />
                    <span className="text-sm font-medium">
                      {t.ROOM_TYPE_LABELS[type]}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedType && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">{t.SETUP_ROOM_SIZE_LABEL}</p>
              <div className="flex gap-2">
                {ROOM_SIZES.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "flex-1 text-xs",
                      selectedSize === size && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => setSelectedSize(size)}
                  >
                    {t.ROOM_SIZE_LABELS[size]}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleOpenChange(false)}
            >
              {t.BUTTON_CANCEL}
            </Button>
            <Button
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!selectedType}
              onClick={handleConfirm}
            >
              {t.SETUP_ADD_ROOM}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface EditRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: RoomWithAppliances | null;
  onSave: (roomId: string, type: RoomType, size: RoomSize) => void;
  t: Translations;
}

function EditRoomDialog({ open, onOpenChange, room, onSave, t }: EditRoomDialogProps) {
  const ROOM_TYPES = Object.keys(t.ROOM_TYPE_LABELS) as RoomType[];
  const ROOM_SIZES = Object.keys(t.ROOM_SIZE_LABELS) as RoomSize[];
  const [selectedType, setSelectedType] = useState<RoomType>("bedroom");
  const [selectedSize, setSelectedSize] = useState<RoomSize>(DEFAULT_ROOM_SIZE);

  useEffect(() => {
    if (!room) {
      return;
    }
    setSelectedType(room.type);
    setSelectedSize(room.size);
  }, [room]);

  function handleSave() {
    if (!room) {
      return;
    }
    onSave(room.id, selectedType, selectedSize);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.SETUP_EDIT_ROOM}</DialogTitle>
          <DialogDescription className="sr-only">
            {t.SETUP_EDIT_ROOM}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {ROOM_TYPES.map((type) => {
              const Icon = ICON_MAP[type];
              const isSelected = selectedType === type;

              return (
                <Card
                  key={type}
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary/50",
                    isSelected && "border-primary"
                  )}
                  onClick={() => setSelectedType(type)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" && e.key !== " ") {
                      return;
                    }
                    e.preventDefault();
                    setSelectedType(type);
                  }}
                >
                  <CardContent className="flex flex-col items-center gap-2 p-4">
                    <Icon className="h-8 w-8 text-primary" />
                    <span className="text-sm font-medium">
                      {t.ROOM_TYPE_LABELS[type]}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">{t.SETUP_ROOM_SIZE_LABEL}</p>
            <div className="flex gap-2">
              {ROOM_SIZES.map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "flex-1 text-xs",
                    selectedSize === size && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => setSelectedSize(size)}
                >
                  {t.ROOM_SIZE_LABELS[size]}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              {t.BUTTON_CANCEL}
            </Button>
            <Button
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleSave}
            >
              {t.BUTTON_SAVE}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
  t: Translations;
}

function DeleteRoomDialog({ open, onOpenChange, onConfirm, isDeleting, t }: DeleteRoomDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t.LABEL_DELETE}</DialogTitle>
          <DialogDescription>
            {t.SETUP_DELETE_ROOM_CONFIRM}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
          >
            {t.BUTTON_CANCEL}
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            disabled={isDeleting}
            onClick={onConfirm}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.SETUP_DELETING_ROOM}
              </>
            ) : (
              t.LABEL_DELETE
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function EditModeView({ homeId }: EditModeViewProps) {
  const t = useT();
  const [editState, setEditState] = useState<EditState>({ status: "loading" });

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomWithAppliances | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadHome = useCallback(async () => {
    setEditState({ status: "loading" });

    const result = await getHome(homeId);

    if (!result.success) {
      setEditState({ status: "error", message: result.error });
      return;
    }

    setEditState({ status: "room-list", home: result.data });
  }, [homeId]);

  useEffect(() => {
    loadHome();
  }, [loadHome]);

  const selectRoom = useCallback(
    (roomId: string) => {
      if (editState.status !== "room-list" && editState.status !== "room-detail") {
        return;
      }
      setEditState({ status: "room-detail", home: editState.home, roomId });
    },
    [editState]
  );

  const backToRooms = useCallback(() => {
    if (editState.status !== "room-detail") {
      return;
    }
    setEditState({ status: "room-list", home: editState.home });
  }, [editState]);

  const reloadAndStayInRoom = useCallback(
    async (roomId: string) => {
      const result = await getHome(homeId);
      if (!result.success) {
        return;
      }
      setEditState({ status: "room-detail", home: result.data, roomId });
    },
    [homeId]
  );

  const reloadToRoomList = useCallback(async () => {
    const result = await getHome(homeId);
    if (!result.success) {
      return;
    }
    setEditState({ status: "room-list", home: result.data });
  }, [homeId]);

  const handleAddRoom = useCallback(
    async (type: RoomType, size: RoomSize) => {
      const currentRooms = editState.status === "room-list" ? editState.home.rooms : [];
      const sameTypeCount = currentRooms.filter((r) => r.type === type).length;
      const baseName = t.ROOM_TYPE_LABELS[type];
      const name = sameTypeCount === 0 ? baseName : `${baseName} ${sameTypeCount + 1}`;
      const result = await apiAddRoom(homeId, { name, type, size });
      if (!result.success) {
        return;
      }
      setAddDialogOpen(false);
      await reloadToRoomList();
    },
    [homeId, t.ROOM_TYPE_LABELS, reloadToRoomList, editState]
  );

  const handleEditRoom = useCallback(
    (room: RoomWithAppliances) => {
      setEditingRoom(room);
      setEditDialogOpen(true);
    },
    []
  );

  const handleSaveRoom = useCallback(
    async (roomId: string, type: RoomType, size: RoomSize) => {
      const currentRooms = editState.status === "room-list" ? editState.home.rooms : [];
      const sameTypeCount = currentRooms.filter((r) => r.type === type && r.id !== roomId).length;
      const baseName = t.ROOM_TYPE_LABELS[type];
      const name = sameTypeCount === 0 ? baseName : `${baseName} ${sameTypeCount + 1}`;
      await apiUpdateRoom(homeId, roomId, { name, type, size });
      setEditDialogOpen(false);
      setEditingRoom(null);
      await reloadToRoomList();
    },
    [homeId, t.ROOM_TYPE_LABELS, reloadToRoomList, editState]
  );

  const handleDeleteRoomClick = useCallback((roomId: string) => {
    setDeletingRoomId(roomId);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDeleteRoom = useCallback(async () => {
    if (!deletingRoomId) {
      return;
    }
    setIsDeleting(true);
    await apiDeleteRoom(homeId, deletingRoomId);
    setIsDeleting(false);
    setDeleteDialogOpen(false);
    setDeletingRoomId(null);
    await reloadToRoomList();
  }, [homeId, deletingRoomId, reloadToRoomList]);

  const handleAddAppliance = useCallback(
    async (
      roomId: string,
      appliance: Omit<Appliance, "id" | "roomId" | "monthlyKwh" | "monthlyCost">
    ) => {
      const result = await addAppliances(homeId, roomId, [
        {
          name: appliance.name,
          type: appliance.type,
          wattage: appliance.wattage,
          dailyUsageHours: appliance.dailyUsageHours,
          standbyWattage: appliance.standbyWattage,
          usageHabit: appliance.usageHabit,
        },
      ]);
      if (!result.success) {
        throw new Error(result.error);
      }
      await reloadAndStayInRoom(roomId);
    },
    [homeId, reloadAndStayInRoom]
  );

  const handleEditAppliance = useCallback(
    async (
      roomId: string,
      applianceId: string,
      updates: Omit<Appliance, "id" | "roomId" | "monthlyKwh" | "monthlyCost">
    ) => {
      const result = await updateAppliance(homeId, applianceId, {
        name: updates.name,
        type: updates.type,
        wattage: updates.wattage,
        dailyUsageHours: updates.dailyUsageHours,
        standbyWattage: updates.standbyWattage,
        usageHabit: updates.usageHabit,
      });
      if (!result.success) {
        throw new Error(result.error);
      }
      await reloadAndStayInRoom(roomId);
    },
    [homeId, reloadAndStayInRoom]
  );

  const handleDeleteAppliance = useCallback(
    async (roomId: string, applianceId: string) => {
      await deleteAppliance(homeId, applianceId);
      await reloadAndStayInRoom(roomId);
    },
    [homeId, reloadAndStayInRoom]
  );

  if (editState.status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t.SETUP_LOADING}</p>
      </div>
    );
  }

  if (editState.status === "error") {
    return (
      <Card className="border-destructive">
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <p className="text-sm font-semibold text-destructive">
            {t.SETUP_ERROR}
          </p>
          <p className="text-xs text-muted-foreground">{editState.message}</p>
          <Button variant="outline" size="sm" onClick={loadHome}>
            {t.SETUP_RETRY}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (editState.status === "room-list") {
    const allAppliances = editState.home.rooms.flatMap((r) => r.appliances);
    const homeTotalKwh = allAppliances.reduce((s, a) => s + a.monthlyKwh, 0);
    const homeTotalCo2 = homeTotalKwh * CO2_EMISSION_FACTOR;
    const homeTotalStandby = allAppliances.reduce(
      (s, a) => s + (a.standbyWattage / 1000) * HOURS_PER_DAY * DAYS_PER_MONTH,
      0
    );

    return (
      <div className="flex flex-col gap-4 lg:gap-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-center text-xl font-bold lg:text-left lg:text-2xl">
              {t.SETUP_EDIT_TITLE}
            </h1>
            <p className="mt-1 text-center text-sm text-muted-foreground lg:text-left">
              {t.SETUP_SELECT_ROOM}
            </p>
          </div>
          {/* Desktop: Add room button in header */}
          <Button
            size="sm"
            className="hidden shrink-0 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 md:flex"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            {t.SETUP_ADD_ROOM}
          </Button>
        </div>

        {/* Home summary stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(
            [
              { label: t.LABEL_ROOM_COUNT_TITLE, value: String(editState.home.rooms.length), sub: t.LABEL_SUB_ROOMS },
              { label: t.LABEL_MONTHLY_ELECTRICITY, value: formatKwh(homeTotalKwh), sub: t.LABEL_SUB_CONSUMPTION },
              { label: t.LABEL_MONTHLY_CO2, value: `${homeTotalCo2.toFixed(1)} kg`, sub: t.LABEL_SUB_EMISSION },
              { label: t.LABEL_STANDBY_POWER, value: formatKwh(homeTotalStandby), sub: t.LABEL_SUB_STANDBY },
            ] as const
          ).map(({ label, value, sub }) => (
            <div key={label} className="glass rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground">{label}</p>
              <p className="mt-0.5 text-base font-bold text-primary leading-tight">{value}</p>
              <p className="text-[10px] text-muted-foreground">{sub}</p>
            </div>
          ))}
        </div>

        {/* Desktop: table layout */}
        <div className="hidden md:flex md:flex-col md:gap-2">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_110px_80px_106px_80px_96px_72px] items-center gap-3 border-b border-border/30 px-4 pb-2 text-xs font-medium text-muted-foreground/60">
            <span>{t.LABEL_ROOM}</span>
            <span>{t.LABEL_ROOM_SIZE}</span>
            <span>{t.LABEL_APPLIANCE}</span>
            <span>{t.LABEL_MONTHLY_KWH}</span>
            <span>CO₂</span>
            <span>{t.LABEL_STANDBY_POWER}</span>
            <span />
          </div>

          {editState.home.rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onSelect={selectRoom}
              onEdit={handleEditRoom}
              onDelete={handleDeleteRoomClick}
              t={t}
            />
          ))}

          <Button
            variant="outline"
            size="sm"
            className="mt-1 w-fit gap-1.5"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            {t.SETUP_ADD_ROOM}
          </Button>
        </div>

        {/* Mobile: card grid */}
        <div className="flex flex-col gap-3 md:hidden">
          {editState.home.rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onSelect={selectRoom}
              onEdit={handleEditRoom}
              onDelete={handleDeleteRoomClick}
              t={t}
            />
          ))}

          <Button
            variant="outline"
            className="h-auto min-h-[4.5rem] w-full border-dashed"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t.SETUP_ADD_ROOM}
          </Button>
        </div>

        <AddRoomDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onAddRoom={handleAddRoom}
          t={t}
        />

        <EditRoomDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          room={editingRoom}
          onSave={handleSaveRoom}
          t={t}
        />

        <DeleteRoomDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleConfirmDeleteRoom}
          isDeleting={isDeleting}
          t={t}
        />
      </div>
    );
  }

  const selectedRoom = editState.home.rooms.find(
    (r) => r.id === editState.roomId
  );

  if (!selectedRoom) {
    return null;
  }

  const singleRoomArray = [selectedRoom];
  const singleAppliancesByRoom: Record<string, Appliance[]> = {
    [selectedRoom.id]: selectedRoom.appliances,
  };

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={backToRooms}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold lg:text-2xl">{selectedRoom.name}</h1>
      </div>

      <ApplianceFormStep
        rooms={singleRoomArray}
        appliancesByRoom={singleAppliancesByRoom}
        onAddAppliance={handleAddAppliance}
        onEditAppliance={handleEditAppliance}
        onDeleteAppliance={handleDeleteAppliance}
        onNext={backToRooms}
        onBack={backToRooms}
        hideNavigation
      />
    </div>
  );
}
