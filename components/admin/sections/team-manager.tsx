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

// Server actions return codes; a throw (e.g. a lost connection) maps to the
// generic save error.
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

// Owner-only team page. Unlike the draft-based section forms, every change here
// (create / edit / delete) is applied immediately by its own server action.
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
  // `"new"` opens the create dialog; a member opens the edit dialog.
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

      <AdminCard>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-start text-xs text-muted-foreground">
              <th className="py-1.5 pe-2 text-start font-medium">
                {t("name")}
              </th>
              <th className="py-1.5 pe-2 text-start font-medium">
                {t("email")}
              </th>
              <th className="py-1.5 pe-2 text-start font-medium">
                <span className="inline-flex items-center gap-1">
                  {t("role")}
                  <InfoTooltip text={t("roleTip")} />
                </span>
              </th>
              <th className="py-1.5 pe-2 text-start font-medium">
                <span className="inline-flex items-center gap-1">
                  {t("locations")}
                  <InfoTooltip text={t("locationsTip")} />
                </span>
              </th>
              <th className="w-px py-1.5">
                <span className="sr-only">{t("actions")}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b border-border/60">
                <td className="py-1.5 pe-2">
                  {member.name}
                  {member.isSelf && (
                    <span className="ms-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {t("you")}
                    </span>
                  )}
                </td>
                <td className="py-1.5 pe-2" dir="ltr">
                  {member.email}
                </td>
                <td className="py-1.5 pe-2">{t(`roles.${member.role}`)}</td>
                <td className="py-1.5 pe-2">
                  {member.role === "owner"
                    ? t("allLocations")
                    : member.locationIds
                        .map((id) => locationNames.get(id))
                        .filter(Boolean)
                        .join(", ") || "—"}
                </td>
                <td className="py-1.5">
                  <div className="flex justify-end gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`${common("edit")}: ${member.name}`}
                      onClick={() => setEditing(member)}
                    >
                      <Pencil />
                    </Button>
                    {!member.isSelf && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`${t("delete")}: ${member.name}`}
                        className="hover:text-destructive"
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

// Create (member = null) or edit dialog. Mounted only while open, so its state
// starts fresh each time. Errors render inline: a toast would sit beneath the
// dialog's top layer.
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
      // On update the (fixed) email is stripped by the action's schema.
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
            // The email is the login identity; it's fixed once created.
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
            // Owners can't demote themselves (see updateTeamMember).
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
