"use client";

import { CheckCircle2, Home as HomeIcon, Loader2, Pencil, Plus, Trash2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/hooks/use-t";
import type {
  ChatAction,
  ChatActionApplianceInput,
  ChatActionApplianceUpdates,
} from "@/lib/chat-action";
import { cn } from "@/lib/utils";

export type ActionStatus =
  | { state: "pending" }
  | { state: "applying" }
  | { state: "applied" }
  | { state: "failed"; message: string }
  | { state: "cancelled" };

interface ChatActionCardProps {
  action: ChatAction;
  status: ActionStatus;
  onApply: () => void;
  onCancel: () => void;
}

const ADD_OPERATION = "add";
const UPDATE_OPERATION = "update";
const DELETE_OPERATION = "delete";
const CREATE_ROOM_OPERATION = "createRoom";

export function ChatActionCard({ action, status, onApply, onCancel }: ChatActionCardProps) {
  const t = useT();

  const operationBadge = getOperationBadge(action, t);
  const Icon = getOperationIcon(action);
  const toneClass = getToneClass(action);

  return (
    <Card className={cn("ml-9 mt-2 border", toneClass)}>
      <CardContent className="flex flex-col gap-3 p-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-background/60">
            <Icon className="h-3.5 w-3.5" />
          </div>
          <p className="text-sm font-semibold">{t.CHAT_ACTION_TITLE}</p>
          <span className="ml-auto rounded-full bg-background/70 px-2 py-0.5 text-[10px] font-medium">
            {operationBadge}
          </span>
        </div>

        <dl className="grid grid-cols-[80px_1fr] gap-x-3 gap-y-1 text-xs">
          {action.operation === CREATE_ROOM_OPERATION ? (
            <CreateRoomDetails action={action} t={t} />
          ) : (
            <>
              <dt className="text-muted-foreground">{t.CHAT_ACTION_ROOM_LABEL}</dt>
              <dd className="font-medium">{action.roomName}</dd>
              {action.operation === ADD_OPERATION && (
                <AddDetails action={action} t={t} />
              )}
              {action.operation === UPDATE_OPERATION && (
                <UpdateDetails action={action} t={t} />
              )}
              {action.operation === DELETE_OPERATION && (
                <>
                  <dt className="text-muted-foreground">{t.CHAT_ACTION_APPLIANCE_LABEL}</dt>
                  <dd className="font-medium">{action.applianceName}</dd>
                </>
              )}
            </>
          )}
        </dl>

        <StatusRow
          status={status}
          onApply={onApply}
          onCancel={onCancel}
          applyLabel={t.CHAT_ACTION_APPLY}
          cancelLabel={t.CHAT_ACTION_CANCEL}
          applyingLabel={t.CHAT_ACTION_APPLYING}
          appliedLabel={t.CHAT_ACTION_APPLIED}
          failedLabel={t.CHAT_ACTION_FAILED}
          cancelledLabel={t.CHAT_ACTION_CANCELLED}
          retryLabel={t.CHAT_ACTION_RETRY}
        />
      </CardContent>
    </Card>
  );
}

interface AddDetailsProps {
  action: Extract<ChatAction, { operation: "add" }>;
  t: ReturnType<typeof useT>;
}

function AddDetails({ action, t }: AddDetailsProps) {
  return <ApplianceFields appliance={action.appliance} t={t} />;
}

interface CreateRoomDetailsProps {
  action: Extract<ChatAction, { operation: "createRoom" }>;
  t: ReturnType<typeof useT>;
}

function CreateRoomDetails({ action, t }: CreateRoomDetailsProps) {
  const { room, appliances } = action;
  const roomTypeLabel = t.ROOM_TYPE_LABELS[room.type];
  const roomSizeLabel = t.ROOM_SIZE_LABELS[room.size];
  return (
    <>
      <dt className="text-muted-foreground">{t.CHAT_ACTION_ROOM_LABEL}</dt>
      <dd className="font-medium">{room.name}</dd>
      <dt className="text-muted-foreground">{t.CHAT_ACTION_TYPE_LABEL}</dt>
      <dd className="font-medium">{roomTypeLabel}</dd>
      <dt className="text-muted-foreground">{t.CHAT_ACTION_ROOM_SIZE_LABEL}</dt>
      <dd className="font-medium">{roomSizeLabel}</dd>
      {appliances.length > 0 && (
        <>
          <dt className="col-span-2 mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            {t.CHAT_ACTION_APPLIANCES_HEADING}
          </dt>
          {appliances.map((appliance, index) => (
            <ApplianceRow key={`${appliance.name}-${index}`} appliance={appliance} t={t} />
          ))}
        </>
      )}
    </>
  );
}

interface ApplianceRowProps {
  appliance: ChatActionApplianceInput;
  t: ReturnType<typeof useT>;
}

function ApplianceRow({ appliance, t }: ApplianceRowProps) {
  return (
    <dd className="col-span-2 rounded-md bg-background/40 p-2">
      <div className="grid grid-cols-[80px_1fr] gap-x-3 gap-y-1 text-xs">
        <ApplianceFields appliance={appliance} t={t} />
      </div>
    </dd>
  );
}

interface ApplianceFieldsProps {
  appliance: ChatActionApplianceInput;
  t: ReturnType<typeof useT>;
}

function ApplianceFields({ appliance, t }: ApplianceFieldsProps) {
  return (
    <>
      <dt className="text-muted-foreground">{t.CHAT_ACTION_APPLIANCE_LABEL}</dt>
      <dd className="font-medium">{appliance.name}</dd>
      <dt className="text-muted-foreground">{t.CHAT_ACTION_TYPE_LABEL}</dt>
      <dd className="font-medium">{appliance.type}</dd>
      <dt className="text-muted-foreground">{t.CHAT_ACTION_WATTAGE_LABEL}</dt>
      <dd className="font-medium">{appliance.wattage}W</dd>
      <dt className="text-muted-foreground">{t.CHAT_ACTION_HOURS_LABEL}</dt>
      <dd className="font-medium">{appliance.dailyUsageHours}h</dd>
      {appliance.standbyWattage !== undefined && appliance.standbyWattage > 0 && (
        <>
          <dt className="text-muted-foreground">{t.CHAT_ACTION_STANDBY_LABEL}</dt>
          <dd className="font-medium">{appliance.standbyWattage}W</dd>
        </>
      )}
      {appliance.usageHabit && appliance.usageHabit.length > 0 && (
        <>
          <dt className="text-muted-foreground">{t.CHAT_ACTION_HABIT_LABEL}</dt>
          <dd className="font-medium">{appliance.usageHabit}</dd>
        </>
      )}
    </>
  );
}

interface UpdateDetailsProps {
  action: Extract<ChatAction, { operation: "update" }>;
  t: ReturnType<typeof useT>;
}

function UpdateDetails({ action, t }: UpdateDetailsProps) {
  return (
    <>
      <dt className="text-muted-foreground">{t.CHAT_ACTION_APPLIANCE_LABEL}</dt>
      <dd className="font-medium">{action.applianceName}</dd>
      <dt className="col-span-2 mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
        {t.CHAT_ACTION_UPDATES_HEADING}
      </dt>
      <UpdateFields updates={action.updates} t={t} />
    </>
  );
}

interface UpdateFieldsProps {
  updates: ChatActionApplianceUpdates;
  t: ReturnType<typeof useT>;
}

function UpdateFields({ updates, t }: UpdateFieldsProps) {
  return (
    <>
      {updates.name !== undefined && (
        <>
          <dt className="text-muted-foreground">{t.CHAT_ACTION_APPLIANCE_LABEL}</dt>
          <dd className="font-medium">{updates.name}</dd>
        </>
      )}
      {updates.type !== undefined && (
        <>
          <dt className="text-muted-foreground">{t.CHAT_ACTION_TYPE_LABEL}</dt>
          <dd className="font-medium">{updates.type}</dd>
        </>
      )}
      {updates.wattage !== undefined && (
        <>
          <dt className="text-muted-foreground">{t.CHAT_ACTION_WATTAGE_LABEL}</dt>
          <dd className="font-medium">{updates.wattage}W</dd>
        </>
      )}
      {updates.dailyUsageHours !== undefined && (
        <>
          <dt className="text-muted-foreground">{t.CHAT_ACTION_HOURS_LABEL}</dt>
          <dd className="font-medium">{updates.dailyUsageHours}h</dd>
        </>
      )}
      {updates.standbyWattage !== undefined && (
        <>
          <dt className="text-muted-foreground">{t.CHAT_ACTION_STANDBY_LABEL}</dt>
          <dd className="font-medium">{updates.standbyWattage}W</dd>
        </>
      )}
      {updates.usageHabit !== undefined && (
        <>
          <dt className="text-muted-foreground">{t.CHAT_ACTION_HABIT_LABEL}</dt>
          <dd className="font-medium">{updates.usageHabit}</dd>
        </>
      )}
    </>
  );
}

interface StatusRowProps {
  status: ActionStatus;
  onApply: () => void;
  onCancel: () => void;
  applyLabel: string;
  cancelLabel: string;
  applyingLabel: string;
  appliedLabel: string;
  failedLabel: string;
  cancelledLabel: string;
  retryLabel: string;
}

function StatusRow({
  status,
  onApply,
  onCancel,
  applyLabel,
  cancelLabel,
  applyingLabel,
  appliedLabel,
  failedLabel,
  cancelledLabel,
  retryLabel,
}: StatusRowProps) {
  if (status.state === "applied") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-primary">
        <CheckCircle2 className="h-3.5 w-3.5" />
        {appliedLabel}
      </div>
    );
  }

  if (status.state === "cancelled") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <XCircle className="h-3.5 w-3.5" />
        {cancelledLabel}
      </div>
    );
  }

  if (status.state === "failed") {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-xs text-destructive">
          <XCircle className="h-3.5 w-3.5" />
          {failedLabel}: {status.message}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onApply}>
            {retryLabel}
          </Button>
        </div>
      </div>
    );
  }

  if (status.state === "applying") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        {applyingLabel}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={onApply}>
        {applyLabel}
      </Button>
      <Button size="sm" variant="outline" onClick={onCancel}>
        {cancelLabel}
      </Button>
    </div>
  );
}

function getOperationIcon(action: ChatAction) {
  if (action.operation === CREATE_ROOM_OPERATION) return HomeIcon;
  if (action.operation === ADD_OPERATION) return Plus;
  if (action.operation === UPDATE_OPERATION) return Pencil;
  return Trash2;
}

function getOperationBadge(action: ChatAction, t: ReturnType<typeof useT>): string {
  if (action.operation === CREATE_ROOM_OPERATION) return t.CHAT_ACTION_CREATE_ROOM_BADGE;
  if (action.operation === ADD_OPERATION) return t.CHAT_ACTION_ADD_BADGE;
  if (action.operation === UPDATE_OPERATION) return t.CHAT_ACTION_UPDATE_BADGE;
  return t.CHAT_ACTION_DELETE_BADGE;
}

function getToneClass(action: ChatAction): string {
  if (action.operation === DELETE_OPERATION) {
    return "border-destructive/40 bg-destructive/5";
  }
  if (action.operation === UPDATE_OPERATION) {
    return "border-amber-500/40 bg-amber-500/5";
  }
  return "border-primary/40 bg-primary/5";
}
