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

  return (
    <Card
      className="cursor-pointer transition-colors hover:border-primary"
      onClick={() => onSelect(room.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") {
          return;
        }
        e.preventDefault();
        onSelect(room.id);
      }}
    >
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold">{room.name}</p>
            <p className="text-xs text-muted-foreground">
              {t.ROOM_TYPE_LABELS[room.type]} · {t.ROOM_SIZE_LABELS[room.size]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {room.appliances.length} {t.SETUP_APPLIANCE_COUNT}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(room);
            }}
            aria-label={t.SETUP_EDIT_ROOM}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(room.id);
            }}
            aria-label={t.LABEL_DELETE}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
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
      const name = t.ROOM_TYPE_LABELS[type];
      const result = await apiAddRoom(homeId, { name, type, size });
      if (!result.success) {
        return;
      }
      setAddDialogOpen(false);
      await reloadToRoomList();
    },
    [homeId, t.ROOM_TYPE_LABELS, reloadToRoomList]
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
      const name = t.ROOM_TYPE_LABELS[type];
      await apiUpdateRoom(homeId, roomId, { name, type, size });
      setEditDialogOpen(false);
      setEditingRoom(null);
      await reloadToRoomList();
    },
    [homeId, t.ROOM_TYPE_LABELS, reloadToRoomList]
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
      await addAppliances(homeId, roomId, [
        {
          name: appliance.name,
          type: appliance.type,
          wattage: appliance.wattage,
          dailyUsageHours: appliance.dailyUsageHours,
          standbyWattage: appliance.standbyWattage,
          usageHabit: appliance.usageHabit,
        },
      ]);
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
      await updateAppliance(homeId, applianceId, {
        name: updates.name,
        type: updates.type,
        wattage: updates.wattage,
        dailyUsageHours: updates.dailyUsageHours,
        standbyWattage: updates.standbyWattage,
        usageHabit: updates.usageHabit,
      });
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
    return (
      <div className="flex flex-col gap-4 lg:gap-6">
        <div>
          <h1 className="text-center text-xl font-bold lg:text-left lg:text-2xl">
            {t.SETUP_EDIT_TITLE}
          </h1>
          <p className="mt-1 text-center text-sm text-muted-foreground lg:text-left">
            {t.SETUP_SELECT_ROOM}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
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
            className="h-auto min-h-[4.5rem] w-full border-dashed lg:min-h-[5rem]"
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
    <div className="flex flex-col gap-4 pb-24 lg:gap-6 lg:pb-0">
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
      />
    </div>
  );
}
