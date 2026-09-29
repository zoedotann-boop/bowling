import { BranchChooser } from "@/components/home/branch-chooser"
import { getSiteBranches } from "@/lib/db/queries/site"

export default async function Page() {
  const branches = await getSiteBranches()
  return <BranchChooser branches={Object.values(branches)} />
}
