import { SetPasswordForm } from "@/components/admin/set-password-form"

const single = (value: string | string[] | undefined) =>
  typeof value === "string" && value ? value : null

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { token, email } = await searchParams

  return (
    <div className="flex min-h-svh items-center justify-center bg-cream p-4">
      <SetPasswordForm token={single(token)} email={single(email)} />
    </div>
  )
}
