"use client"

import { Pencil, Plus, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useId, useState, useTransition } from "react"

import { AdminModal, ConfirmModal } from "@/components/admin/admin-modal"
import {
  AdminCard,
  AdminField,
  AdminFlag,
  AdminInput,
  AdminSelect,
} from "@/components/admin/admin-ui"
import { InfoTooltip } from "@/components/admin/info-tooltip"
import { useToast } from "@/components/admin/toast"
import { Button } from "@/components/ui/button"
import type { ActionResult } from "@/lib/actions/admin/shared"
import type { NewTeamMemberDraft } from "@/lib/actions/admin/schemas"
import {
  createTeamMember,
  deleteTeamMember,
  updateTeamMember,
} from "@/lib/actions/admin/team"
import { ADMIN_ROLES, type AdminRole } from "@/lib/admin/permissions"
import { cn } from "@/lib/utils"

interface TeamLocation {
  id: string
  name: string
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: AdminRole
  locationIds: string[]
  isSelf: boolean
}

const headerCell = "px-4 py-2.5 text-start font-medium"
const bodyCell = "px-4 py-3 align-middle"
const wideOnly = "hidden sm:table-cell"

async function run(action: () => Promise<ActionResult>): Promise<ActionResult> {
  try {
    return await action()
  } catch {
    return { ok: false, error: "saveError" }
  }
}

function useErrorMessage() {
  const t = useTranslations("admin.team")
  const common = useTranslations("admin.common")
  return (code: string) =>
    t.has(`error.${code}`) ? t(`error.${code}`) : common("saveError")
}

export function TeamManager({
  members,
  locations,
}: {
  members: TeamMember[]
  locations: TeamLocation[]
}) {
  const t = useTranslations("admin.team")
  const common = useTranslations("admin.common")
  const { toast } = useToast()
  const errorMessage = useErrorMessage()
  const [editing, setEditing] = useState<TeamMember | "new" | null>(null)
  const [removing, setRemoving] = useState<TeamMember | null>(null)

  const locationNames = new Map(locations.map((item) => [item.id, item.name]))

  async function remove(member: TeamMember) {
    const result = await run(() => deleteTeamMember(member.id))
    if (result.ok) toast(t("deleted"), "success")
    else toast(errorMessage(result.error), "error")
  }

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <Button type="button" onClick={() => setEditing("new")}>
          <Plus />
          {t("add")}
        </Button>
      </header>

      <AdminCard className="relative overflow-x-auto p-0">
        <table className="w-full border-collapse text-sm sm:min-w-xl">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
              <th className={cn(headerCell, "w-2/5")}>{t("name")}</th>
              <th className={cn(headerCell, wideOnly)}>
                <span className="inline-flex items-center gap-1">
                  {t("role")}
                  <InfoTooltip text={t("roleTip")} />
                </span>
              </th>
              <th className={cn(headerCell, wideOnly)}>
                <span className="inline-flex items-center gap-1">
                  {t("locations")}
                  <InfoTooltip text={t("locationsTip")} />
                </span>
              </th>
              <th className="w-px">
                <span className="sr-only">{t("actions")}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr
                key={member.id}
                className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/30"
              >
                <td className={bodyCell}>
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold uppercase"
                    >
                      {member.name.trim().charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 font-medium">
                        <span className="truncate">{member.name}</span>
                        {member.isSelf && (
                          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                            {t("you")}
                          </span>
                        )}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        <span dir="ltr">{member.email}</span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs sm:hidden">
                        <RoleBadge role={member.role} />
                        <MemberLocations
                          member={member}
                          locationNames={locationNames}
                        />
                      </div>
                    </div>
                  </div>
                </td>
                <td className={cn(bodyCell, wideOnly)}>
                  <RoleBadge role={member.role} />
                </td>
                <td className={cn(bodyCell, wideOnly)}>
                  <MemberLocations
                    member={member}
                    locationNames={locationNames}
                  />
                </td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`${common("edit")}: ${member.name}`}
                      onClick={() => setEditing(member)}
                    >
                      <Pencil />
                    </Button>
                    {member.isSelf ? (
                      <span aria-hidden className="size-7" />
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`${t("delete")}: ${member.name}`}
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setRemoving(member)}
                      >
                        <Trash2 />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminCard>

      {editing && (
        <MemberDialog
          member={editing === "new" ? null : editing}
          locations={locations}
          onClose={() => setEditing(null)}
        />
      )}

      {removing && (
        <ConfirmModal
          open
          onClose={() => setRemoving(null)}
          onConfirm={() => void remove(removing)}
          title={t("deleteTitle", { name: removing.name })}
          message={t("deleteMessage")}
          confirmLabel={t("delete")}
          cancelLabel={common("cancel")}
        />
      )}
    </div>
  )
}

function RoleBadge({ role }: { role: AdminRole }) {
  const t = useTranslations("admin.team")
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        role === "owner"
          ? "bg-primary/15 text-primary"
          : "bg-muted text-foreground"
      )}
    >
      {t(`roles.${role}`)}
    </span>
  )
}

function MemberLocations({
  member,
  locationNames,
}: {
  member: TeamMember
  locationNames: Map<string, string>
}) {
  const t = useTranslations("admin.team")
  if (member.role === "owner") {
    return <span className="text-muted-foreground">{t("allLocations")}</span>
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {member.locationIds.map((id) => (
        <span
          key={id}
          className="rounded-md border border-border px-2 py-0.5 text-xs whitespace-nowrap"
        >
          {locationNames.get(id)}
        </span>
      ))}
    </div>
  )
}

function MemberDialog({
  member,
  locations,
  onClose,
}: {
  member: TeamMember | null
  locations: TeamLocation[]
  onClose: () => void
}) {
  const t = useTranslations("admin.team")
  const common = useTranslations("admin.common")
  const { toast } = useToast()
  const errorMessage = useErrorMessage()
  const id = useId()
  const [draft, setDraft] = useState<NewTeamMemberDraft>(() =>
    member
      ? {
          name: member.name,
          email: member.email,
          role: member.role,
          locationIds: member.locationIds,
        }
      : { name: "", email: "", role: "manager", locationIds: [] }
  )
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function toggleLocation(locationId: string, checked: boolean) {
    setDraft((prev) => ({
      ...prev,
      locationIds: checked
        ? [...prev.locationIds, locationId]
        : prev.locationIds.filter((item) => item !== locationId),
    }))
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await run(() =>
        member ? updateTeamMember(member.id, draft) : createTeamMember(draft)
      )
      if (result.ok) {
        toast(t(member ? "updated" : "created"), "success")
        onClose()
      } else {
        setError(errorMessage(result.error))
      }
    })
  }

  return (
    <AdminModal
      open
      onClose={onClose}
      title={member ? member.name : t("add")}
      closeLabel={common("close")}
      className="max-w-lg"
    >
      <form onSubmit={submit} className="space-y-4">
        <AdminField
          label={t("name")}
          tooltip={t("nameTip")}
          htmlFor={`${id}-name`}
        >
          <AdminInput
            id={`${id}-name`}
            required
            value={draft.name}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, name: event.target.value }))
            }
          />
        </AdminField>
        <AdminField
          label={t("email")}
          tooltip={t("emailTip")}
          htmlFor={`${id}-email`}
        >
          <AdminInput
            id={`${id}-email`}
            type="email"
            required
            dir="ltr"
            disabled={Boolean(member)}
            value={draft.email}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, email: event.target.value }))
            }
          />
        </AdminField>
        <AdminField
          label={t("role")}
          tooltip={t("roleTip")}
          htmlFor={`${id}-role`}
        >
          <AdminSelect
            id={`${id}-role`}
            disabled={member?.isSelf}
            value={draft.role}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                role: event.target.value as AdminRole,
              }))
            }
          >
            {ADMIN_ROLES.map((role) => (
              <option key={role} value={role}>
                {t(`roles.${role}`)}
              </option>
            ))}
          </AdminSelect>
        </AdminField>
        {draft.role === "owner" ? (
          <p className="text-sm text-muted-foreground">{t("ownerAccess")}</p>
        ) : (
          <AdminField label={t("locations")} tooltip={t("locationsTip")}>
            <div className="space-y-2">
              {locations.map((location) => (
                <AdminFlag
                  key={location.id}
                  id={`${id}-location-${location.id}`}
                  label={location.name}
                  checked={draft.locationIds.includes(location.id)}
                  onCheckedChange={(checked) =>
                    toggleLocation(location.id, checked)
                  }
                />
              ))}
            </div>
          </AdminField>
        )}

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {common("cancel")}
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? common("saving") : member ? common("save") : t("create")}
          </Button>
        </div>
      </form>
    </AdminModal>
  )
}
