import Image from "next/image"

import { serviceIconAt, type ServiceIcon } from "@/lib/home"
import { isOptimizableImage } from "@/lib/images"
import {
  BarIcon,
  BowlingIcon,
  EveryoneIcon,
  MenuIcon,
  OpenLateIcon,
  PartyIcon,
} from "@/components/icons"
import {
  CorporateIllustration,
  GymboreeIllustration,
  TeamIllustration,
} from "@/components/illustrations"

export const SERVICE_ART: Record<ServiceIcon, typeof BowlingIcon> = {
  bowling: BowlingIcon,
  party: PartyIcon,
  menu: MenuIcon,
  gymboree: GymboreeIllustration,
  team: TeamIllustration,
  group: EveryoneIcon,
  drinks: BarIcon,
  corporate: CorporateIllustration,
  clock: OpenLateIcon,
}

export function ServiceArt({
  icon,
  imageUrl,
  index,
}: {
  icon: string
  imageUrl: string | null
  index: number
}) {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt=""
        width={80}
        height={80}
        unoptimized={!isOptimizableImage(imageUrl)}
        className="size-[68px] shrink-0 object-contain lg:size-20"
      />
    )
  }
  const Art = SERVICE_ART[serviceIconAt(icon, index)]
  return <Art className="h-[68px] w-auto shrink-0 lg:h-20" />
}
